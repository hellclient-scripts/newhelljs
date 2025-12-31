//退出模块
$.Module(function (App) {
    let Relogin = {}
    Relogin.Start = (data) => {
        let loc = data.trim()
        if (!loc) {
            loc = "26"
        }
        $.PushCommands(
            $.To(loc),
            $.Nobusy(),
            $.Function(() => {
                Note("退出游戏，准备重新连接")
                App.Core.Connect.Next = (new Date()).getTime() + 32000
                App.Send("quit")
                App.Core.Connect.Callback=App.Next
            })
        )
        App.Next()
    }
    let Quest = App.Quests.NewQuest("relogin")
    Quest.Name = "重新登录"
    Quest.Desc = "退出并重新连接"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Start = function (data) {
        Relogin.Start(data)
    }
    App.Quests.Register(Quest)

})