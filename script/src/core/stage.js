(function (App) {
    let actionModule = App.RequireModule("helllibjs/conditions/action.js")
    App.Core.Stage = {}
    App.Core.Stage.Stance = ""
    App.Core.Stage.ChangeStance = function (s) {
        if (App.Core.Stage.Stance != s) {
            App.Core.Stage.Raise("stanceleave-" + App.Core.Stage.Stance)
            App.Core.Stage.Stance = s
            App.Core.Stage.Raise("stance-" + s)
        }
    }
    App.Core.Stage.Commands = []
    App.Core.Stage.Raise = (name) => {
        name = "#" + name
        Note("触发场景:" + name)
        App.Core.Stage.Execute(name)
    }
    App.Core.Stage.Load = () => {
        App.Core.Stage.Commands = []
        App.LoadVariable("command").forEach(data => {
            let action = actionModule.Parse(data)
            App.Core.Stage.Commands.push(action)
        })
    }
    App.Core.Stage.Execute = (name) => {
        App.Core.Stage.Commands.forEach(action => {
            if (action.Command == name) {
                if (App.Quests.Conditions.Check(action.Conditions)) {
                    App.Send(action.Data)
                }
            }
        })
    }
})(App)