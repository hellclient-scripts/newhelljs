(function (app) {
    app.Core.Connect = {}
    app.Core.Connect.Login = function () {
        Send(GetVariable("id"))
        SendNoEcho(GetVariable("passw"))
        print("******")
        Send("y")
    }
    app.Core.Connect.OnAliasLogin = function (n, l, w) {
        app.Core.Connect.Login()
    }
    App.BindEvent("connected", function (event) {
        event.Context.Propose("", function () {
            PlanOnConnected.Execute()
        })
    })
    
    let matcherEnter = /^你连线进入.+。$/
    let matcherReenter = /^重新连线完毕。/
    let matcherTooFast=/^你距上一次退出时间只有.+秒钟，请稍候再登录。$/
    var PlanOnConnected = new app.Plan(App.Positions.Connect,
        function (task) {
            task.NewTrigger(matcherEnter).WithName("enter")
            task.NewTrigger(matcherReenter).WithName("reenter")
        },
        function (result) {
            switch (result.Type) {
                case "trigger":
                    switch (result.Name) {
                        case "enter":
                            App.RaiseEvent(new App.Event("core.entermud", false).WithType("system"))
                            break
                        case "reenter":
                            App.RaiseEvent(new App.Event("core.entermud", true).WithType("system"))
                            break
                    }
                    break
            }
        })
})(App)