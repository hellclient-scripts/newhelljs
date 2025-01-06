//场景模块
(function (App) {
    let actionModule = App.RequireModule("helllibjs/conditions/action.js")
    App.Core.Stage = {}
    //姿态模块，不同姿态切换时会触发场景
    App.Core.Stage.Stance = ""
    App.Core.Stage.ChangeStance = function (s) {
        if (App.Core.Stage.Stance != s) {
            App.Core.Stage.Raise("stanceleave-" + App.Core.Stage.Stance)
            App.Core.Stage.Stance = s
            App.Core.Stage.Raise("stance-" + s)
        }
    }
    App.Core.Stage.Commands = []
    //触发场景
    App.Core.Stage.Raise = (name) => {
        name = "#" + name
        Note("触发场景:" + name)
        App.Core.Stage.Execute(name)
    }
    //加载变量设置
    App.Core.Stage.Load = () => {
        App.Core.Stage.Commands = []
        App.LoadVariable("command").forEach(data => {
            let action = actionModule.Parse(data)
            App.Core.Stage.Commands.push(action)
        })
    }
    //调用指定场景的指令
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