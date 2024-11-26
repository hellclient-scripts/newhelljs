$.Module(function (App) {
    let Idle = {}
    Idle.Start = (data) => {
        $.PushCommands(
            $.To(data)
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
        if (App.Map.Room.ID != data.trim()) {
            return () => {
                Quest.Start(data)
            }
        }
        return null
    }

    Quest.Start = function (data) {
        Idle.Start(data)
    }
    App.Quests.Register(Quest)
})