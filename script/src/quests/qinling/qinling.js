//打老秦任务模块
$.Module(function (App) {
    let Qinling = {}
    Qinling.Data = {
        //打一下就跑
        HitAndRun: true,
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
    //记录奖品
    let matcherDrop = /^当~~一声，一.(.+)从天而降，掉落在你面前。$/
    //全局计划
    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
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
        })
    Qinling.Start = () => {
        Qinling.Data.Finished = false
        PlanQuest.Execute()
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
            App.Send("unride;enter door")
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
            $.To("2819"),
            $.Plan(PlanEnter)
        )
        $.Next()
    }
    //进入成功
    Qinling.Entered = () => {
        Qinling.Data.All++
        Qinling.Data.Start = $.Now()

        Note("进入副本，打探地图")
        Quest.Cooldown(120000)
        App.Core.Fuben.Last = $.Now()
        $.PushCommands(
            $.Path(["s"]),
            $.Function(App.Core.Fuben.LoadMazeMap),//加载地图
            $.Function(Qinling.Maze)
        )
        $.Next()
    }
    //初始化地图
    Qinling.Maze = () => {
        App.Map.Room.ID = "2820"
        if (App.Core.Fuben.Current == null) {
            Quest.Cooldown(120000)
            App.Send("quit")
            return
        }
        Qinling.AddApth()
        $.PushCommands(
            $.To("2824"),
            $.Function(Qinling.KillQin),
        )
        $.Next()
    }
    //补全迷宫地图连接
    Qinling.AddApth = () => {
        App.Core.Fuben.Current.AddPath("2820", App.Core.Fuben.Current.Landmark["entry"], "s")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["entry"], "2820", "n")
        App.Core.Fuben.Current.AddPath("2823", App.Core.Fuben.Current.Landmark["exit"], "n")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["exit"], "2823", "s")
    }
    //杀老秦
    Qinling.KillQin = () => {
        $.PushCommands(
            $.Function(() => {
                $.RaiseStage("qinbefore")//用于H&R时的初始化
                $.Next()
            }),
            $.Do("i"),
            $.Sync(),
            $.Rest(),
            $.Function(() => {
                $.RaiseStage("prepare")
                $.Next()
            }),
            $.Sync(),
            $.Path(["n"]),
            $.Function(() => {
                if (App.Map.Room.Data.Objects.FindByName("秦始皇僵尸").First()) {
                    $.Insert(
                        App.NewKillCommand("qin shihuang", App.NewCombat("qinling").WithHitAndRun(Qinling.Data.HitAndRun ? "s" : "").WithKillInGroup(true)),
                        $.Function(() => {
                            if (!Qinling.Data.HitAndRun) {
                                $.Insert($.Path(["s"]),)
                            }
                            $.Next()
                        }),
                        $.Function(Qinling.KillQin)
                    )
                    $.Next()
                    return
                }
                App.Map.Room.Data.Objects.Items.forEach(item => {
                    switch (item.IDLower) {
                        case "skeleton fighter":
                        case "corpse":
                        case "skeleton":
                        case "long sword":
                            break
                        default:
                            App.Send(`get ${item.IDLower}`)//捡道具
                    }
                })
                App.Send("i")
                $.Insert(
                    $.Path(["s"]),
                    $.Function(() => {
                        //更新统计信息
                        Qinling.Data.Success++
                        Qinling.Data.Cost = Qinling.Data.Cost + $.Now() - Qinling.Data.Start
                        Qinling.Data.Finished = true
                        App.Next()
                    }),
                    $.Path(["out"]),
                    $.Prepare("commonWithStudy"),
                )
                App.Next()
            })
        )
        $.Next()
    }
    App.BindEvent("core.relogin", (e) => {
        Quest.Cooldown(0)
    })
    App.BindEvent("core.queststart", (e) => {
        Qinling.Data = {
            HitAndRun: true,
            Finished: false,
            Start: null,
            Cost: 0,
            HitAndRun: App.QuestParams["qinlingflee"] == 0,
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
    App.Quests.Qinling = Qinling
})