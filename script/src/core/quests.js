(function (App) {
    let questsModule = App.RequireModule("helllibjs/quests/quests.js")
    let conditionsModule = App.RequireModule("helllibjs/conditions/conditions.js")
    App.Core.Quest = {}

    App.Core.Quest.OnAlias = function (n, l, w) {
        App.Core.Quest.Exec(w[0])
    }
    App.Quest = {}
    App.Core.Quest.Exec = function (line) {
        App.Quests.StartLine(line.trim())
    }
    App.Quests = new questsModule.Quests(App.Positions["Quest"], App.Commands, new conditionsModule.Conditions)
    App.BindEvent("core.stop", function () {
        App.Quests.Stop()
    })
})(App)