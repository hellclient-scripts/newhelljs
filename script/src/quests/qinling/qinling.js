$.Module(function (App) {
    let Qinling = {}
    Qinling.Data = {
        Finished: false,
    }
    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
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
        Qinling.Data = {
            Finished: false,
        }
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
            $.Prepare("commonWithStudy", { WeaponDurationMin: 80 }),
            $.To("2819"),
            $.Plan(PlanEnter)
        )
        $.Next()
    }

    Qinling.Entered = () => {
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
            $.Rest(),
            $.Path(["n"]),
            $.Function(() => {
                if (App.Map.Room.Data.Objects.FindByName("秦始皇僵尸").First()) {
                    $.Insert(
                        App.NewKillCommand("qin shihuang", App.NewCombat("qinling").WithHitAndRun("s")),
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
                            break
                        default:
                            App.Send(`get ${item.IDLower}`)
                    }
                })
                App.Send("i")
                $.Insert(
                    $.Path(["s"]),
                    $.Function(() => {
                        Qinling.Data.Finished = true
                        App.Next()
                    }),
                    $.Path(["out"]),
                    $.Prepare(),
                )
                App.Next()
            })
        )
        $.Next()
    }
    let Quest = App.Quests.NewQuest("qinling")
    Quest.Name = "秦岭副本"
    Quest.Desc = ""
    Quest.Intro = ""
    Quest.Help = ""
    Quest.OnHUD = () => {
        return null
    }
    Quest.OnSummary = () => {
        return null
    }
    Quest.OnReport = () => {
        return null
    }
    Quest.Start = function (data) {
        Qinling.Start()
    }
    App.Quests.Register(Quest)
    App.Quests.Qinling = Qinling
})