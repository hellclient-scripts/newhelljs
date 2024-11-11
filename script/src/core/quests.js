(function (App) {
    let questsModule = App.RequireModule("helllibjs/quests/quests.js")
    let conditionsModule = App.RequireModule("helllibjs/conditions/conditions.js")
    App.Core.Quest = {}
    App.Core.Quest.StartedAt = 0
    App.Core.Quest.OnAlias = function (n, l, w) {
        let q = w[0].trim()
        if (q) {
            App.Core.Quest.Exec(w[0])
            return
        }
        q = GetVariable("quest").trim()
        if (q) {
            App.Core.Quest.Exec(q)
            return
        }
        PrintSystem("quest变量为空，未指定任务。")
    }
    App.Quest = {}
    App.Core.Quest.Current = ""
    App.Core.Quest.Exec = function (line) {
        App.Commands.PushCommands(
            App.Commands.NewFunctionCommand(App.Init),
            App.Commands.NewFunctionCommand(() => {
                App.Core.Quest.Current = line.trim()
                App.Quests.StartLine(line.trim())
            }),
        )
        App.Next()
    }
    App.Quests = new questsModule.Quests(App.Positions["Quest"], App.Commands, new conditionsModule.Conditions)
    App.BindEvent("core.stop", function () {
        App.Quests.Stop()
    })
    App.Quests.OnStart = () => {
        App.Core.Quest.StartedAt = (new Date()).getTime()
        App.RaiseEvent(new App.Event("core.queststart"))
    }
    App.Quests.OnStop = () => {
        App.Core.Quest.Current = ""
        App.RaiseEvent(new App.Event("core.queststop"))
    }
    App.Quests.Conditions.RegisterMatcher(App.Quests.Conditions.NewMatcher("maxexp", function (data, target) {
        return App.Data.Player.HP["经验"] <= (data - 0)
    }))
    App.Quests.Conditions.RegisterMatcher(App.Quests.Conditions.NewMatcher("yueli", function (data, target) {
        return App.Data.Player.Score["阅历"] >= (data - 0)
    }))
    App.Quests.Conditions.RegisterMatcher(App.Quests.Conditions.NewMatcher("pot", function (data, target) {
        return App.Data.Player.HP["潜能"] >= (data - 0)
    }))
})(App)            
