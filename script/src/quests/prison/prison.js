$.Module(function (App) {
    let Prison = {}
    Prison.Data = {
        Success: 0,
        Gifts: {},
        Finished: false,
        Start: 0,
        Cost: 0,
        Box: 0,
        GoodBox: 0,
        Migong: [],
    }
    let matcherYanfei = "看起来燕非想杀死你！"
    let matcherGift = /^你从打开的宝箱中拿出一.(.+)。/
    let matcherBox = "你把宝箱打开了。"
    let matcherFinish = "太监大喜，连声称谢：壮士神勇，圣上必有重赏！"
    //铲除李莲英、宫廷转危为安，你获得了二千点经验、一千点潜能、五百点实战体会、二百点江湖阅历、能力得
    // 到了提升。
    //通过这次锻炼，你获得了一百四十九点经验、七十四点潜能、三十七点实通过这次锻炼，你获得了一百四十九点经验、七十四点潜能、三十七点实
    //战体会、能力得到了提升。
    //通过这次锻炼，你获得了二百六十九点经验、一百三十四点潜能、六十七点实战体会、能力得到了提升。
    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            task.AddCatcher("core.giftbouns", (catcher, event) => {
                if (event.Data.prompt == "铲除李莲英、宫廷转危为安") {
                    App.Core.Analytics.Add(Quest.ID, App.CNumber.ParseNumber(event.Data.exp), App.CNumber.ParseNumber(event.Data.pot), App.CNumber.ParseNumber(event.Data.tihui))
                }
                return true
            })
            task.AddTrigger(matcherBox, (tri, result) => {
                Prison.Data.Box++
                return true
            })
            task.AddTrigger(matcherYanfei, (tri, result) => {
                App.Send("kill yan fei")
                if (App.Combat) {
                    App.Combat.Target = "yan fei"
                }
                return true
            })
            task.AddTrigger(matcherFinish, (tri, result) => {
                Quest.Cooldown(0)
                return true
            })
            //统计奖品
            task.AddTrigger(matcherGift, (tri, result) => {
                let gift = result[1]
                if (!Prison.Data.Gifts[gift]) {
                    Prison.Data.Gifts[gift] = 0
                }
                Prison.Data.GoodBox++
                Prison.Data.Gifts[gift]++
                return true
            })
            //副本失败
            task.AddCatcher("core.fubenfail", (catcher, event) => {
                if (Prison.Data.Finished || true) {
                    event.Context.Set("callback", () => {
                        Note("离开副本")
                        Quest.Cooldown(0)
                    })
                } else {
                    Note("副本失败")
                }
                Quest.Cooldown(0)
                return true
            })
        })
    Prison.Start = () => {
        Prison.Data.Finished = false
        PlanQuest.Execute()
        Prison.Enter()
    }
    Prison.Enter = () => {
        $.PushCommands(
            $.Prepare("commonWithExp"),
            // $.Timeslice("天牢"),
            $.To("fuben"),
            $.Plan(PlanEnter)
        )
        $.Next()
    }
    let PlanEnter = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.AddTrigger("祝你好运气！", (catcher, result) => {
                //成功进入副本
                task.Data = "ok"
                return true
            })
            App.Send("unride;enter prison")
            App.Sync()

        },
        (result) => {
            if (result.Task.Data == "ok") {
                Prison.Entered()
                return
            }
            Note("进入失败")
            // App.Core.Timeslice.Change("")
            Quest.Cooldown(120000)
            App.Fail()
        }
    )
    let matcherAnswerYes = /^太监有气无力地说道：这位.+，你是来为皇宫清除叛逆的吗？？\(answer yes\/no\)$/
    let matcherAcceptYes = "太监说道：你愿意为宫廷清理叛逆，铲除李莲英吗？(accept yes/no)"
    let PlanAccept = new App.Plan(
        App.Positions["Room"],
        (task) => {
            task.AddTrigger(matcherAnswerYes, (tri, result) => {
                App.Send("answer yes")
                return true
            })
            task.AddTrigger(matcherAcceptYes, (tri, result) => {
                App.Send("accept yes")
            })
            task.AddTimer(10000)
            $.RaiseStage("wait")
        },
        (result) => {
            App.Send("halt")
            App.Next()
        })
    Prison.Entered = () => {
        Prison.Data.Start = $.Now()
        Note("进入副本，打探地图")
        Quest.Cooldown(120000)
        App.Core.Fuben.Last = $.Now()
        Prison.LastRoom = ""
        $.PushCommands(
            $.Plan(PlanAccept),
            $.Path(["s"]),
            $.Function(App.Core.Fuben.LoadMazeMap),//加载地图
            $.Function(Prison.Maze)
        )
        $.Next()
    }
    Prison.OnMoveBlocker = function (name) {
        Prison.LastRoom = App.Map.Room.ID
        App.Reconnect(2000, Prison.Connect0)
    }
    Prison.Connect0 = function () {
        App.Reconnect(2000, Prison.Connect)
    }
    Prison.Connect = function () {
        PlanQuest.Execute()
        App.Map.Room.ID = Prison.LastRoom
        $.PushCommands(
            $.Function(App.Core.Emergency.CheckDeath),
            $.Function(() => {
                App.Core.Weapon.PickWeapon()
                $.Next()
            }),
            $.Rest(),
            $.Function(Prison.Go)
        )
        $.Next()

    }
    Prison.MoveData = App.Move.NewOnMoveBlocker(Prison.OnMoveBlocker)
    Prison.Go = () => {
        if (App.Map.Room.Name == "天牢") {
            App.Map.Room.ID = App.Core.Fuben.Current.Landmark["current"]
        }
        $.PushCommands(
            $.Function(() => {
                $.RaiseStage("prepare")
                $.Next()
            }),
            $.To(["fuben-prison-exit"], App.Map.SingleStep(), App.Core.Fuben.InFuben, Prison.MoveData),
            $.CounterAttack("lao tou", App.NewCombat("prison").WithTags("laotou").WithKillInGroup(true)),
            $.Do("get gold from corpse;get silver from corpse 2"),
            $.Sync(),
            $.Function(() => {
                App.Look()
                $.Next()
            }),
            $.Sync(),
            $.Rest(),
            $.Nobusy(),
            $.Kill("li lianying", App.NewCombat("prison").WithTags("lilianying").WithKillInGroup(true)),
            $.Sync(),
            $.Rest(),
            $.Nobusy(),
            $.To(["fuben-prison-entry"], App.Map.SingleStep(), App.Core.Fuben.InFuben, Prison.MoveData),
            $.Do("report tai"),
            $.Sync(),
            $.To(["fuben-prison-exit"], App.Map.SingleStep(), App.Core.Fuben.InFuben, Prison.MoveData),
            $.Function(() => {
                Note("等待离开")
                $.RaiseStage("wait")
                $.Next()
            }),
            $.Wait(31000)
        )
        $.Next()
    }
    Prison.Maze = () => {
        App.Map.Room.ID = $.RID("fuben-prison-entry2")
        if (App.Core.Fuben.Current == null) {
            Quest.Cooldown(120000)
            $.PushCommands(
                $.To("gc"),
            )
            $.Next()
            return
        }
        Prison.AddApth()
        Prison.Go()
    }
    Prison.Migong = () => {
        $.PushCommands(
            $.Function(App.Core.Fuben.LoadMazeMap),
            $.Function(() => {
                if (!App.Core.Fuben.Current || !App.Core.Fuben.Current.Landmark["entry"] || !App.Core.Fuben.Current.Landmark["exit"] || !App.Core.Fuben.Current.Landmark["current"]) {
                    App.Log("副本迷宫地图错误")
                    App.Fail()
                    return
                }
                Prison.Data.Migong = [...App.Core.Fuben.Current.Rooms].filter(v => v != App.Core.Fuben.Current.Landmark["exit"] && v != App.Core.Fuben.Current.Landmark["current"])
                App.Map.Room.ID = App.Core.Fuben.Current.Landmark["current"]
                $.Next()
            }),
            $.Function(() => {
                if (App.QuestParams.prisonnosearch.trim() != "t") {
                    $.Insert(
                        $.Rooms(Prison.Data.Migong, App.Map.SingleStep(), Prison.Checker, App.Core.Fuben.InFuben),
                    )
                } else {
                    Note("跳过搜索，直接离开")
                }
                $.Next()
            }),
            $.Function(() => {
                Note("搜刮结束，离开")
                $.Insert($.To(App.Core.Fuben.Current.Landmark["exit"], App.Map.SingleStep(), Prison.Checker, App.Core.Fuben.InFuben))
                $.Next()
            }),
            $.Function(Prison.Leave)
        )
        $.Next()
    }
    Prison.Retry = () => {
        App.Commands.Drop()
        $.PushCommands(
            $.Function(App.Core.Fuben.LoadMazeMap),
            $.Function(() => {
                if (!App.Core.Fuben.Current || !App.Core.Fuben.Current.Landmark["entry"] || !App.Core.Fuben.Current.Landmark["exit"] && !App.Core.Fuben.Current.Landmark["current"]) {
                    App.Log("副本迷宫地图错误")
                    App.Fail()
                    return
                }
                App.Map.Room.ID = App.Core.Fuben.Current.Landmark["current"]
                $.Next()
            }),
            $.Function(() => {
                if (App.QuestParams.prisonnosearch.trim() != "t") {
                    $.Insert(
                        $.Rooms(Prison.Data.Migong, App.Map.SingleStep(), Prison.Checker, App.Core.Fuben.InFuben),
                    )
                } else {
                    Note("跳过搜索，直接离开")
                }
                $.Next()
            }),
            $.Function(() => {
                Note("搜刮结束，离开")
                $.Insert($.To(App.Core.Fuben.Current.Landmark["exit"], App.Map.SingleStep(), Prison.Checker, App.Core.Fuben.InFuben))
                $.Next()
            }),
            $.Function(Prison.Leave)
        )
        $.Next()
    }
    Prison.Leave = () => {
        if (App.Map.Room.Exits.indexOf("out") >= 0) {
            App.PushCommands(
                $.Do("i"),
                $.Path(["out"]),
                $.Function(() => {
                    App.Map.Room.ID = $.RID("wm")
                    Quest.Cooldown(120000)
                    Prison.Data.Success++
                    Prison.Data.Cost += $.Now() - Prison.Data.Start
                    App.Next()
                }),
                // $.Timeslice(""),
                $.Prepare("commonWithExp"),
            )
            if (App.QuestParams["prisonkillli"].trim() == "t") {
                $.Insert(
                    $.Function(() => {
                        $.RaiseStage("prepare")
                        $.Next()
                    }),
                    $.Kill("li lianying", App.NewCombat("lilianying").WithTags("李莲英").WithKillInGroup(true))
                )
            }
            App.Next()
            return true
        }
        App.Fail()
    }
    let matcherInjured = "你脚下一滑，差点摔个嘴啃泥，好不容易稳住身子，才感觉脚踝扭伤了，好痛啊..."
    let matcherInjured2 = "只听得一声机括脆响，你下意识的赶紧避让，却为时已晚，一支钢弩不偏不倚正好射中你。"
    let matcherInjured3 = "你一脚踩上了什么东西，身形再也把持不住，猛的向前滑出，只留下一声惊叫久久回荡..."
    let matcherRetry = "你一脚踩到了什么东西，急惶惶的把脚收起，却已经听到阵阵沉闷的声音从地下响起..."
    let matcherRetry2 = "只见四周光影晃动，整个房间似乎在快速移动，等一切安静下来，周遭景象似乎有所改变。"

    let PlanCheck = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.Data = ""
            task.AddTrigger(matcherInjured, (tri, result) => {
                task.Data = "injured"
                return true
            })
            task.AddTrigger(matcherInjured2, (tri, result) => {
                task.Data = "injured"
                return true
            })
            task.AddTrigger(matcherInjured3, (tri, result) => {
                task.Data = "injured"
                return true
            })
            task.AddTrigger(matcherRetry, (tri, result) => {
                task.Data = "injuretryred"
                return true
            })
            task.AddTrigger(matcherRetry2, (tri, result) => {
                task.Data = "retry"
                return true
            })
            App.Sync()
        },
        (result) => {
            if (result.Task.Data == "retry") {
                Prison.Retry()
                return
            }
            if (result.Task.Data == "injured") {
                $.Insert($.Do("hp"), $.Sync(), $.Rest())
            }
            App.Next()
        })
    Prison.LastRoom = ""

    Prison.Checker = function (move, map) {
        move.OnArrive = function (move, map) {
            if (App.Map.Room.ID) {
                Prison.Data.Migong = Prison.Data.Migong.filter(v => v != App.Map.Room.ID)
            }
            let snap = App.Map.Snap()
            App.Commands.Insert(
                $.Plan(PlanCheck),
                $.Function(() => {
                    if (App.Map.Room.Data.Objects.FindByLabel("宝箱").First()) {
                        App.Send("open bao xiang;get all from bao xiang")
                    }
                    $.Next()
                }),
                App.Commands.NewFunctionCommand(() => {
                    App.Map.Rollback(snap)
                    move.Walk(map)
                })
            )
            $.Next()
        }
    }
    //补全迷宫地图连接
    Prison.AddApth = () => {
        let entry = $.RID("fuben-prison-entry2")
        let exit = $.RID("fuben-prison-exit")
        App.Core.Fuben.Current.AddPath(entry, App.Core.Fuben.Current.Landmark["entry"], "s")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["entry"], entry, "n")
        App.Core.Fuben.Current.AddPath(exit, App.Core.Fuben.Current.Landmark["exit"], "n")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["exit"], exit, "s")
    }

    let Quest = App.Quests.NewQuest("prison")
    Quest.Name = "天牢"
    Quest.Desc = ""
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Group = "prison"
    Quest.OnHUD = () => {
        return [
            new App.HUD.UI.Word("天牢:"),
            new App.HUD.UI.Word(App.HUD.UI.ShortNumber(Prison.Data.Success), 5, true),
        ]

    }
    Quest.OnSummary = () => {
        return [
            new App.HUD.UI.Word("牢:"),
            new App.HUD.UI.Word(App.HUD.UI.ShortNumber(Prison.Data.Success), 5, true),
        ]

    }
    Quest.OnReport = () => {
        let gift = []
        let giftdata = []
        for (var name in Prison.Data.Gifts) {
            let rate = (Prison.Data.Gifts[name] * 100 / Prison.Data.Box).toFixed(2) + "%"
            giftdata.push({ label: `${name}:${Prison.Data.Gifts[name]}件 (${rate})`, sum: Prison.Data.Gifts[name] })
        }
        if (giftdata.length > 0) {
            giftdata.sort((a, b) => {
                return b.sum - a.sum
            })
            gift = giftdata.map(v => v.label)
        }
        let cost = Prison.Data.Success > 0 ? (Prison.Data.Cost / Prison.Data.Success / 1000).toFixed() + "秒" : "-"
        let d = $.Now() - App.Quests.StartAt
        let eff = d > 0 ? (Prison.Data.Success * 3600 * 1000 / d).toFixed(0) + "次/小时" : "-"
        let box = Prison.Data.Success > 0 ? (Prison.Data.Box / Prison.Data.Success).toFixed(2) + "个" : "-"
        let rate = Prison.Data.Box > 0 ? (Prison.Data.GoodBox * 100 / Prison.Data.Box).toFixed(2) + "%" : "-"
        return [`天牢-成功:${Prison.Data.Success}次 宝箱:${Prison.Data.Box} 出货:${Prison.Data.GoodBox} 毛效率:${eff} 平均耗时：${cost} 平均宝箱:${box} 出货率:${rate}`, `天牢-奖励： ${gift.join(" , ")}`]
    }
    Quest.Start = function (data) {
        Prison.Start()
    }
    App.Core.Quest.AppendInitor((e) => {
        Prison.Data = {
            Success: 0,
            Gifts: {},
            Finished: false,
            Start: 0,
            Cost: 0,
            Box: 0,
            GoodBox: 0,
            Migong: [],
        }
    })
    App.Quests.Register(Quest)
    App.Quests.Prison = Prison
    Quest.TimeCost = 30
    App.Core.Analytics.RegisterTask(Quest.ID, Quest.Name, Quest.Timeslice ? Quest.Timeslice : Quest.Name)

})