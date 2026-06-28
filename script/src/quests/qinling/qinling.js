$.Module(function (App) {
    class Maze {
        Level = 0
        Password = ""
        Corners = ["mazemap-0-0", "mazemap-0-9", "mazemap-9-0", "mazemap-9-9"]
        Goldman = ["mazemap-0-0", "mazemap-0-9", "mazemap-9-0", "mazemap-9-9", "mazemap-5-4"]
        Mapping = {}
        Doors = [["fuben-qinling-door-n", "south"], ["fuben-qinling-door-e", "west"], ["fuben-qinling-door-s", "north"], ["fuben-qinling-door-w", "east"]]
        Direction = ""
        Unlocked = ["A", "B", "C", "D"]
    }
    let Qinling = {}
    Qinling.Data = {
        Maze: new Maze(),
        //打一下就跑
        //是否已经结束
        Finished: false,
        //开始时间
        Start: null,
        //花费时间
        Cost: 0,
        //总次数
        All: 0,
        //成功次数
        Success: 0,
        //礼物清单
        Gifts: {},
    }
    //你一脚踩上了什么东西，身形再也把持不住，猛的向前滑出，只留下一声惊叫久久回荡...
    // 通过这次锻炼，你获得了一万二千点经验、二点潜能、二千点实战体会、十六点江湖阅历、十四点威望、能力
    // 得到了提升。
    // 当~~一声，一只小金元宝从天而降，掉落在你面前。
    // 当~~一声，一片翡翠残片从天而降，掉落在你面前。
    // 当~~一声，一片水晶残片从天而降，掉落在你面前。
    let matcherRoomID = /^管理物件分配该房间的序列号：(A|B|C|D)$/
    let matcherPassword = /^密码 ([1|2|3|4|5|6|7|8|9|0])$/
    let matcherDrop = /^当~~一声，一.(.+)从天而降，掉落在你面前。$/
    let matcherAutolook = "突然四周一阵旋转，等一切安静下来，你发现地板下出现几个洞口。"

    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            task.AddCatcher("core.giftbouns", (catcher, event) => {
                if (event.Data.prompt == "通过这次锻炼") {
                    App.Core.Analytics.Add(Quest.ID, App.CNumber.ParseNumber(event.Data.exp || ""), App.CNumber.ParseNumber(event.Data.pot || ""), App.CNumber.ParseNumber(event.Data.tihui || ""))
                    Qinling.Data.Success++
                }
                return true
            })
            task.AddTrigger(matcherRoomID, (tri, result) => {
                Note(`密码锁房间 ${result[1]}:${App.Map.Room.ID}`)
                Qinling.Data.Maze.Mapping[result[1]] = App.Map.Room.ID
                return true
            })
            //统计奖品
            task.AddTrigger(matcherDrop, (tri, result) => {
                let gift = result[1]
                if (!Qinling.Data.Gifts[gift]) {
                    Qinling.Data.Gifts[gift] = 0
                }
                Qinling.Data.Gifts[gift]++
                return true
            })
            //副本失败
            task.AddCatcher("core.fubenfail", (catcher, event) => {
                if (Qinling.Data.Finished) {
                    event.Context.Set("callback", () => {
                        Note("离开副本")
                    })
                }
                Quest.Cooldown(120000)
                return true
            })
            task.AddTrigger(matcherAutolook, (tri, result) => {
                Note("场景自动更新")
                App.Move.IgnoreRoomEntry()
                return true
            })
            task.AddTrigger(matcherPassword, (tri, result) => {
                Qinling.Data.Maze.Password = result[1] + Qinling.Data.Maze.Password
                return true
            })
        })
    Qinling.Start = () => {
        Qinling.Data.Finished = false
        Qinling.Enter()
    }
    let PlanEnter = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.AddTrigger("祝你好运气！", (tri, result) => {
                //成功进入副本
                task.Data = "ok"
                return true
            })
            App.Send("unride;enter mausoleum")
            App.Sync()

        },
        (result) => {
            if (result.Task.Data == "ok") {
                Qinling.Entered()
                return
            }
            Note("进入失败")
            Quest.Cooldown(120000)
            App.Fail()
        }
    )
    //进副本
    Qinling.Enter = () => {
        App.Checker.GetCheck("weaponduration").Force()
        $.PushCommands(
            $.Prepare("", { WeaponDurationMin: 80 }),
            $.To("fuben"),
            $.Plan(PlanEnter)
        )
        $.Next()
    }
    //进入成功
    Qinling.Entered = () => {
        Qinling.Data.All++
        Qinling.Data.Start = $.Now()
        Qinling.Data.Start.Finished = false
        Qinling.Data.Maze = new Maze()
        PlanQuest.Execute()
        Note("进入副本，打探地图")
        Quest.Cooldown(120000)
        App.Core.Fuben.Last = $.Now()
        $.PushCommands(
            $.Function(App.Core.Fuben.LoadMazeMap),//加载地图
            $.Function(Qinling.Maze)
        )
        $.Next()
    }
    //初始化地图
    Qinling.Maze = () => {
        App.Map.Room.ID = $.RID("fuben-qinling-entry")
        if (App.Core.Fuben.Current == null) {
            Quest.Cooldown(120000)
            App.Send("quit")
            return
        }
        Qinling.AddPath()
        Qinling.TryUnlock()
    }
    Qinling.TryUnlock = () => {
        if (Qinling.Data.Maze.Unlocked.length > 0) {
            let next = Qinling.Data.Maze.Mapping[Qinling.Data.Maze.Unlocked[0]]
            if (!next) {
                next = Qinling.Data.Maze.Corners.shift()
            }
            $.PushCommands(
                $.To(next, App.Core.Fuben.InFuben, App.Map.SingleStep()),
                $.Sync(),
                $.Function(Qinling.InUnlockRoom)
            )
            $.Next()
            return
        }
        Qinling.TryDoors()
    }
    Qinling.InUnlockRoom = () => {
        if (Qinling.Data.Maze.Mapping[Qinling.Data.Maze.Unlocked[0]] == App.Map.Room.ID) {
            Qinling.Data.Maze.Unlocked.shift()
            $.PushCommands(
                $.Do("move desk"),
                $.Sync(),
                $.Function(Qinling.TryUnlock)
            )
            $.Next()
            return
        }
        $.PushCommands(
            $.Function(Qinling.TryUnlock)
        )
        $.Next()
    }
    Qinling.TryDoors = () => {
        if (Qinling.Data.Maze.Doors.length > 0) {
            let nextdoor = Qinling.Data.Maze.Doors.shift()
            Qinling.Data.Maze.Direction = nextdoor[1]
            $.PushCommands(
                $.To(nextdoor[0], App.Core.Fuben.InFuben, App.Map.SingleStep()),
                $.Sync(),
                $.Function(function () {
                    if ((App.Map.Room.Exits.indexOf(Qinling.Data.Maze.Direction) >= 0)) {
                        $.PushCommands(
                            $.Path([Qinling.Data.Maze.Direction], App.Core.Fuben.InFuben),
                            $.Function(Qinling.EnterInner)
                        )
                    } else {
                        $.Insert(
                            $.Function(Qinling.TryDoors)
                        )
                    }
                    $.Next()
                })
            )
            $.Next()
            return
        }
        Qinling.Leave()
    }
    Qinling.EnterInner = () => {
        Qinling.Data.Maze.Level = 1
        $.PushCommands(
            $.Function(App.Core.Fuben.LoadMazeMap),//加载地图
            $.Function(() => {
                Qinling.AddPath2()
                App.Map.Room.ID = $.RID("fuben-qinling-entry2")
                $.Next()
            }),
            $.Function(Qinling.Search)
        )
        $.Next()
    }
    Qinling.Search = () => {
        if (Qinling.Data.Maze.Password.length >= 9) {
            Note("密码齐了，搞老秦")
            Qinling.GoQin()
            return
        }
        if (Qinling.Data.Maze.Goldman.length == 0) {
            App.Log("金人杀完了，失败")
            Quest.Cooldown(120000)
            Qinling.Leave()
            return
        }
        if (App.Map.Room.ID == "") {
            App.Log("位置丢失")
            return
        }
        $.RaiseStage("preapre")
        $.Insert(
            $.To(Qinling.Data.Maze.Goldman.shift(), App.Map.SingleStep(), App.Core.Fuben.InFuben),
            $.Function(() => {
                let goldmancount = App.Map.Room.Data.Objects.FindByIDLower("gold man").Sum()
                App.Send("yun recover")
                for (let i = 0; i < goldmancount; i++) {
                    App.Send(`kill gold man ${i + 1}`)
                }
                $.Next()
            }),
            $.CounterAttack("gold man", App.NewCombat("qinling").WithTags("goldman").WithKillInGroup(true)),
            $.Rest(),
            $.Function(Qinling.Search)
        )
        $.Next()
    }
    Qinling.GoQin = () => {
        $.PushCommands(
            $.To("mazemap-5-4", App.Core.Fuben.InFuben, App.Map.SingleStep()),
            $.Sync(),
            $.Function(() => {
                $.RaiseStage("preapre")
                $.Next()
            }),
            $.Do(`turn ${Qinling.Data.Maze.Password}`),
            App.NewKillCommand("qin shihuang", App.NewCombat("qinling").WithTags("qinshihuang").WithKillInGroup(true)),
            $.Function(() => {
                App.Look()
                $.Next()
            }),
            $.Sync(),
            $.Function(() => {
                App.Map.Room.Data.Objects.Items.forEach(item => {
                    switch (item.IDLower) {
                        case "skeleton fighter":
                        case "corpse":
                        case "skeleton":
                        case "coffin":
                        case "long sword":
                            break
                        default:
                            App.Send(`get ${item.IDLower}`)//捡道具
                    }
                })
                App.Send("i")
                $.Next()
            }),
            $.Function(Qinling.Leave),
        )
        $.Next()
    }
    Qinling.Leave = () => {
        if (Qinling.Data.Maze.Level == 0) {
            $.PushCommands(
                $.To("fuben-qinling-exit", App.Core.Fuben.InFuben, App.Map.SingleStep()),
                $.Path(["n"]),
                $.Function(() => {
                    Quest.Cooldown(120000)
                    Qinling.Data.Cost = Qinling.Data.Cost + $.Now() - Qinling.Data.Start
                    Qinling.Data.Finished = true
                    $.Next()
                }),
                $.Prepare("commonWithExp"),
            )
        } else {
            $.PushCommands(
                $.To("fuben-qinling-exit2", App.Core.Fuben.InFuben, App.Map.SingleStep()),
                $.Path([Qinling.Data.Maze.Direction]),
                $.Function(() => {
                    Quest.Cooldown(120000)
                    Qinling.Data.Cost = Qinling.Data.Cost + $.Now() - Qinling.Data.Start
                    Qinling.Data.Finished = true
                    $.Next()
                }),
                $.Prepare("commonWithExp"),
            )
        }
        $.Next()
    }
    //补全迷宫地图连接
    Qinling.AddPath = () => {
        App.Core.Fuben.Current.AddPath($.RID("fuben-qinling-entry"), App.Core.Fuben.Current.Landmark["entry"], "n")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["entry"], $.RID("fuben-qinling-entry"), "s")
        App.Core.Fuben.Current.AddPath($.RID("fuben-qinling-exit"), App.Core.Fuben.Current.Landmark["exit"], "s")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["exit"], $.RID("fuben-qinling-exit"), "n")
        App.Core.Fuben.Current.AddPath("mazemap-5-4", $.RID("fuben-qinling-door-n"), "nd")
        App.Core.Fuben.Current.AddPath($.RID("fuben-qinling-door-n"), "mazemap-5-4", "su")
        App.Core.Fuben.Current.AddPath("mazemap-5-4", $.RID("fuben-qinling-door-e"), "ed")
        App.Core.Fuben.Current.AddPath($.RID("fuben-qinling-door-e"), "mazemap-5-4", "wu")
        App.Core.Fuben.Current.AddPath("mazemap-5-4", $.RID("fuben-qinling-door-s"), "sd")
        App.Core.Fuben.Current.AddPath($.RID("fuben-qinling-door-s"), "mazemap-5-4", "nu")
        App.Core.Fuben.Current.AddPath("mazemap-5-4", $.RID("fuben-qinling-door-w"), "wd")
        App.Core.Fuben.Current.AddPath($.RID("fuben-qinling-door-w"), "mazemap-5-4", "eu")
    }
    Qinling.AddPath2 = () => {
        App.Core.Fuben.Current.AddPath($.RID("fuben-qinling-entry2"), App.Core.Fuben.Current.Landmark["entry"], Qinling.Data.Maze.Direction)
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["exit"], $.RID("fuben-qinling-exit2"), Qinling.Data.Maze.Direction)
    }
    App.Core.Quest.AppendInitor(() => {
        Qinling.Data = {
            HitAndRun: true,
            Finished: false,
            Start: null,
            Cost: 0,
            All: 0,
            Success: 0,
            Gifts: {},
        }
    })

    //任务实例
    let Quest = App.Quests.NewQuest("qinling")
    Quest.Name = "秦岭副本"
    Quest.Desc = ""
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Group = "qinling"
    Quest.OnHUD = () => {
        return [
            new App.HUD.UI.Word("秦陵:"),
            new App.HUD.UI.Word(App.HUD.UI.ShortNumber(Qinling.Data.Success), 5, true),
        ]

    }
    Quest.OnSummary = () => {
        return [
            new App.HUD.UI.Word("秦:"),
            new App.HUD.UI.Word(App.HUD.UI.ShortNumber(Qinling.Data.Success), 5, true),
        ]

    }
    Quest.OnReport = () => {
        let gift = []
        for (var name in Qinling.Data.Gifts) {
            gift.push(`${name}:${Qinling.Data.Gifts[name]}件`)
        }
        let rate = Qinling.Data.All > 0 ? (Qinling.Data.Success * 100 / Qinling.Data.All).toFixed(0) + "%" : "-"
        let cost = Qinling.Data.Success > 0 ? (Qinling.Data.Cost / Qinling.Data.Success / 1000).toFixed() + "秒" : "-"
        return [`秦陵-成功 ${Qinling.Data.Success}次 共计 ${Qinling.Data.All}次 成功率 ${rate} 平均耗时 ${cost} 道具： ${gift.join(" , ")}`]
    }
    Quest.Start = function (data) {
        Qinling.Start()
    }

    App.Quests.Register(Quest)
    App.Core.Analytics.RegisterTask(Quest.ID, Quest.Name, Quest.Timeslice ? Quest.Timeslice : Quest.Name)
    App.Quests.Qinling = Qinling
})