(function (App) {
    let questsModule = App.RequireModule("helllibjs/quests/quests.js")
    let conditionsModule = App.RequireModule("helllibjs/conditions/conditions.js")
    App.Core.Quest = {}

    App.Core.Quest.OnAlias = function (n, l, w) {
        let q = w[0].trim()
        if (q) {
            App.Core.Quest.Exec(w[0])
            return
        }
        q=GetVariable("quest").trim()
        if (q) {
            App.Core.Quest.Exec(w[0])
            return
        }
        PrintSystem("quest变量为空，未指定任务。")
    }
    App.Quest = {}
    App.Core.Quest.Exec = function (line) {
        App.Init()
        App.ReloadVariable()
        App.Quests.StartLine(line.trim())
    }
    App.Quests = new questsModule.Quests(App.Positions["Quest"], App.Commands, new conditionsModule.Conditions)
    App.BindEvent("core.stop", function () {
        App.Quests.Stop()
    })
})(App)