//放弃经验模块
$.Module(function (App) {
    let Fangqi = {}
    Fangqi.Start = (data) => {
        App.Stop()
        App.Next()
    }
    let Quest = App.Quests.NewQuest("fangqi")
    Quest.Name = "放弃经验到Maxexp"
    Quest.Desc = "用于配药大米拿danyu mo等限制经验任务"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.GetReady = function (q, data) {
        let maxexp = App.Core.GetMaxExp()
        if (maxexp > 0 && App.Data.Player.HP["经验"] > maxexp) {
            return () => {
                $.PushCommands(
                    $.Prepare("exp")
                )
                $.Next()
            }
        }
        return
    }
    Quest.Start = function (data) {
        Fangqi.Start(data)
    }
    App.Quests.Register(Quest)
})