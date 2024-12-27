$.Module(function (App) {
    let Qinling = {}
    Qinling.Data = {
        HitAndRun: true,
        Finished: false,
        Start: null,
        Cost: 0,
        All: 0,
        Success: 0,
        Gifts: {},
    }
    let matcherDrop = /^当~~一声，一.(.+)从天而降，掉落在你面前。$/
    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            task.AddTrigger(matcherDrop, (tri, result) => {
                let gift = result[1]
                if (!Qinling.Data.Gifts[gift]) {
                    Qinling.Data.Gifts[gift] = 0
                }
                Qinling.Data.Gifts[gift]++
                return true
            })
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
    Qinling.Enter = () => {
        App.Checker.GetCheck("weaponduration").Force()
        $.PushCommands(
            $.Prepare("", { WeaponDurationMin: 80 }),
            $.To("2819"),
            $.Plan(PlanEnter)
        )
        $.Next()
    }

    Qinling.Entered = () => {
        Qinling.Data.All++
        Qinling.Data.Start = $.Now()

        Note("进入副本，打探地图")
        Quest.Cooldown(120000)
        App.Core.Fuben.Last = $.Now()
        $.PushCommands(
            $.Path(["s"]),
            $.Function(App.Core.Fuben.LoadMazeMap),
            $.Function(Qinling.Maze)
        )
        $.Next()
    }
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
    Qinling.AddApth = () => {
        App.Core.Fuben.Current.AddPath("2820", App.Core.Fuben.Current.Landmark["entry"], "s")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["entry"], "2820", "n")
        App.Core.Fuben.Current.AddPath("2823", App.Core.Fuben.Current.Landmark["exit"], "n")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["exit"], "2823", "s")
    }
    Qinling.KillQin = () => {
        $.PushCommands(
            $.Function(() => {
                $.RaiseStage("qinbefore")
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
                            App.Send(`get ${item.IDLower}`)
                    }
                })
                App.Send("i")
                $.Insert(
                    $.Path(["s"]),
                    $.Function(() => {
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