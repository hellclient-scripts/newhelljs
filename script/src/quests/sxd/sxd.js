$.Module(function (App) {
    let Sxd = {}
    Sxd.Step = 0
    Sxd.Finished = false
    Sxd.Start = () => {
        Sxd.Finished = false
        PlanQuest.Execute()
        Sxd.Step = 0
        $.PushCommands(
            $.Prepare(),
            $.Function(() => {
                if (App.Data.Item.List.FindByIDLower("fire").First() == null) {
                    $.Insert($.Buy("fire"))
                }
                $.Next()
            }),
            $.To("2994"),
            $.To("3002"),
            $.Function(() => {
                Sxd.Finished = true
                $.Next()
            })
        )
        $.Next()
    }
    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            task.AddCatcher("core.faint", (catcher, event) => {
                event.Context.Set("callback", Sxd.AfterFaint)
                return true
            })
        }, (result) => {

        })
    Sxd.AfterFaint = () => {
        App.Map.DiscardMove()
        PlanQuest.Execute()
        $.PushCommands(
            $.Do("l"),
            $.Sync(),
            $.Do("yun heal"),
            $.Nobusy(),
            $.Do("yun recover;yun regenerate"),
            $.Function(Sxd.GoOn)
        )
        $.Next()
    }
    Sxd.GoOn = () => {
        if (App.Map.Room.Name == "悬崖底") {
            $.PushCommands(
                $.To("3002"),
                $.Function(() => {
                    Sxd.Finished = true
                    $.Next()
                })
            )
            $.Next()

        } else {
            App.Fail()
        }
    }
    let Quest = App.Quests.NewQuest("sxd")
    Quest.Name = "去神仙洞，拿神兵"
    Quest.Desc = ""
    Quest.Intro = ""
    Quest.Help = ""
    Quest.GetReady = function (q, data) {
        if (!Sxd.Finished) {
            return () => { Quest.Start(data) }
        }
        return null
    }
    Quest.Start = function (data) {
        Sxd.Start(data)
    }
    App.Quests.Register(Quest)
})