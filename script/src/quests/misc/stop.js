//停止模块
$.Module(function (App) {
    let Stop = {}
    Stop.Start = (data) => {
        App.Stop()
        App.Next()
    }
    let Quest = App.Quests.NewQuest("stop")
    Quest.Name = "结束任务队列"
    Quest.Desc = "结束当前任务队列"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Start = function (data) {
        Stop.Start(data)
    }
    App.Quests.Register(Quest)

})