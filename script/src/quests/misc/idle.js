$.Module(function (App) {
    let Idle = {}
    Idle.Start = (data) => {
        $.PushCommands(
            $.Prepare(),
            $.Function(() => {
                if (App.Map.Room.ID != data.trim()) {
                    $.Insert($.To(data))
                }
                $.Next()
            }),
            $.Wait(1000),
        )
        App.Next()
    }
    let Quest = App.Quests.NewQuest("idle")
    Quest.Name = "在指定位置发待"
    Quest.Desc = "结束当前任务队列"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.GetReady = function (q, data) {
        if (!data) {
            data = "26"
        }
        return () => {
            Quest.Start(data)
        }
    }

    Quest.Start = function (data) {
        Idle.Start(data)
    }
    App.Quests.Register(Quest)
})