(function (App) {
    App.Core.Connect = {}
    App.Core.Connect.Login = function () {
        Send(GetVariable("id"))
        SendNoEcho(GetVariable("passw"))
        print("******")
        Send("y")
    }
    App.Core.Connect.OnAliasLogin = function (n, l, w) {
        App.Core.Connect.Login()
    }
    App.BindEvent("connected", function (event) {
        event.Context.Propose(function () {
            PlanOnConnected.Execute()
        })
    })
    App.BindEvent("disconnected", function (event) {
        Metronome.Discard(true)
        App.Committee.Positions.forEach(position => {
            position.StartNewTerm()
        });
        Note("断线了")
    })
    let matcherEnter = /^你连线进入.+。$/
    let matcherReenter = /^重新连线完毕。/
    let matcherTooFast=/^你距上一次退出时间只有.+秒钟，请稍候再登录。$/
    var PlanOnConnected = new App.Plan(App.Positions.Connect,
        function (task) {
            task.AddTrigger(matcherEnter).WithName("enter")
            task.AddTrigger(matcherReenter).WithName("reenter")
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