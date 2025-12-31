//退出模块
$.Module(function (App) {
    let Quit = {}
    Quit.Start = (data) => {
        let loc = data.trim()
        if (!loc) {
            loc = App.Mapper.HouseID?"1949":"26"
        }
        $.PushCommands(
            $.To(loc),
            $.Nobusy(),
            $.Function(() => {
                App.Core.Connect.Offline = true
                Note("退出游戏")
                App.Send("quit")
                App.Next()
            })
        )
        App.Next()
    }
    let Quest = App.Quests.NewQuest("quit")
    Quest.Name = "退出"
    Quest.Desc = "退出并不再连线,可以指定位置"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Start = function (data) {

        Quit.Start(data)
    }
    App.Quests.Register(Quest)

})