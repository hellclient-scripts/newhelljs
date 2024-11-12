$.Module(function (App) {
    let Qinling = {}
    Qinling.Start = () => {
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
            $.To("2824")
        )
        $.Next()
    }
    Qinling.AddApth = () => {
        App.Core.Fuben.Current.AddPath("2820", App.Core.Fuben.Current.Landmark["entry"], "s")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["entry"], "2820", "n")
        App.Core.Fuben.Current.AddPath("2823", App.Core.Fuben.Current.Landmark["exit"], "n")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["exit"], "2823", "s")
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