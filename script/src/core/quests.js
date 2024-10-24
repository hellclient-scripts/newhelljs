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
        q = GetVariable("quest").trim()
        if (q) {
            App.Core.Quest.Exec(q)
            return
        }
        PrintSystem("quest变量为空，未指定任务。")
    }
    App.Quest = {}
    App.Core.Quest.Exec = function (line) {
        App.Commands.PushCommands(
            App.Commands.NewFunctionCommand(App.Init),
            App.Commands.NewFunctionCommand(() => { App.Quests.StartLine(line.trim()) }),
        )
        App.Next()
    }
    App.Quests = new questsModule.Quests(App.Positions["Quest"], App.Commands, new conditionsModule.Conditions)
    App.BindEvent("core.stop", function () {
        App.Quests.Stop()
    })
    App.Quests.OnStart=()=>{
        App.RaiseEvent(new App.Event("core.queststart"))
    }
    App.Quests.OnStop=()=>{
        App.RaiseEvent(new App.Event("core.queststop"))
    }
})(App)            
