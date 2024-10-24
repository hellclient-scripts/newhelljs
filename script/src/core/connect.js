(function (App) {
    App.Core.Connect = {}
    App.Core.Connect.Next = null
    App.Core.Connect.OnTime = function () {
        if (!App.Core.Connect.NoLogin && App.Core.Connect.Running() && App.Core.Connect.Next != null && App.Core.Connect.Next <= (new Date()).getTime()) {
            if (!IsConnected()) {
                Connect()
            } else {
                App.Core.Connect.Login()
                App.Core.Connect.Next = null
            }
        }
    }
    App.Core.Connect.Running = function () {
        return App.Quests.Stopped == false
    }
    App.Core.Connect.NoLogin = false
    App.Core.Connect.Login = function () {
        Send(GetVariable("id"))
        SendNoEcho(GetVariable("passw"))
        print("******")
        Send("y")
    }
    App.Core.Connect.Callback = null
    App.Core.Connect.DefaultCallback = function () {
        App.Commands.Discard()
        App.Commands.PushCommands(
            App.Commands.NewFunctionCommand(App.Core.Emergency.CheckDeath),
            App.NewPrepareCommand(""),
            App.Commands.NewFunctionCommand(() => {
                if (!App.Quests.IsStopped()) {
                    Note("重新执行任务队列")
                    App.Quests.Restart()
                }
            })
        )
        App.Next()
    }
    App.Reconnect = function (delay, callback) {
        if (!delay) { delay = 0 }
        if (callback == null) { callback = App.Core.Connect.DefaultCallback }
        App.Core.Connect.Next = (new Date()).getTime() + delay
        App.Core.Connect.Callback = callback
        Disconnect()
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
        for (var key in App.Positions){
            App.Positions[key].Discard()
        }
        if (!App.Core.Connect.NoLogin && App.Core.Connect.Running()) {
            if (App.Core.Connect.Next == null) {
                Note(""+(App.Params.ReloginDelay/1000).toFixed()+"秒后尝试重连")
                App.Reconnect(App.Params.ReloginDelay)
            }
        }
    })
    let matcherEnter = /^你连线进入.+。$/
    let matcherReenter = /重新连线完毕。/
    let matcherTooFast = /^你距上一次退出时间只有.+秒钟，请稍候再登录。$/
    let matcherTooFast2 = /^你不能在.+秒钟之内连续重新连线。$/
    var PlanOnConnected = new App.Plan(App.Positions.Connect,
        function (task) {
            task.AddTrigger(matcherEnter).WithName("enter")
            task.AddTrigger(matcherReenter).WithName("reenter")
            task.AddTrigger(matcherTooFast).WithName("toofast")
            task.AddTrigger(matcherTooFast2).WithName("toofast2")
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
                        case "toofast":
                        case "toofast2":
                            if (App.Core.Connect.Callback) {
                                App.Core.Connect.Next = (new Date()).getTime() + 10000
                                Note("10秒后重试")
                            }
                            break
                    }
                    break
            }
        })
    App.BindEvent("core.entermud", function () {
        App.Core.Connect.Next = null
        let cb = App.Core.Connect.Callback
        App.Core.Connect.Callback = null
        if (cb) { cb() }
    })
    App.Core.Connect.OnDisconnected = function () {

    }
    App.Engine.BindTimeHandler(function () { App.Core.Connect.OnTime() })

})(App)