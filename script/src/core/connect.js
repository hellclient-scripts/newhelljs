(function (App) {
    App.Core.Connect = {}
    App.Core.Connect.Next = (new Date()).getTime() + 1000
    App.Core.Connect.Entered = false
    App.Core.Connect.CanLogin = function () {
        if (App.Core.Dispel.Need && (App.Data.Player.HP["气血百分比"] < 10 || App.Data.Player.HP["精气百分比"] < 10)) {
            return false
        }
        return !App.Core.Connect.Offline && !App.Core.Emergency.NoLogin && App.Core.Connect.Running()
    }
    App.Core.Connect.OnTime = function () {
        let next = App.Core.Connect.Next
        if (next == null && App.Core.Connect.GetAutorun()) {
            next = 0
        }
        if (!IsConnected() && App.Core.Connect.CanLogin() && next != null && App.Core.Connect.Next <= (new Date()).getTime()) {
            Connect()
        }
    }
    App.Core.Connect.OnLogin = function (event) {
        if (App.Core.Connect.GetAutorun() && App.Core.Connect.Callback == null) {
            App.Core.Connect.Callback = App.Core.Connect.DefaultCallback
        }
        App.Core.Connect.Entered = false
        event.Context.Propose(function () {
            PlanOnConnected.Execute()
        })
        if (App.Core.Connect.CanLogin()) {
            App.Core.Connect.Login()
            App.Core.Connect.Next = (new Date()).getTime() + 10000
            // App.Core.Connect.Next = null
        }
    }
    App.BindEvent("core.login", App.Core.Connect.OnLogin)
    App.Core.Connect.GetAutorun = () => {
        let autorun = GetVariable("autorun")
        if (autorun != null) {
            autorun = autorun.trim()
        } else {
            autorun = ""
        }
        return autorun
    }
    App.Core.Connect.Running = function () {
        return App.Quests.IsStopped() == false || App.Core.Connect.GetAutorun()
    }
    App.Core.Connect.Login = function () {
        Send(GetVariable("id"))
        SendNoEcho(GetVariable("passw"))
        print("******")
        Send("y")
    }
    App.Core.Connect.Offline = false
    App.Core.Connect.Callback = null
    App.Core.Connect.DefaultCallback = function () {
        App.Commands.Discard()
        App.Commands.PushCommands(
            App.Commands.NewFunctionCommand(App.Core.Emergency.CheckDeath),
            App.NewPrepareCommand(""),
        )
        if (!App.Quests.IsStopped()) {
            App.Commands.Append(
                App.NewPrepareCommand(""),
                App.Commands.NewFunctionCommand(() => {
                    Note("重新执行任务队列")
                    App.Quests.Restart()
                })
            )
        } else {
            let autorun = App.Core.Connect.GetAutorun()
            App.Commands.Append(
                App.Commands.NewFunctionCommand(() => {
                    Note("执行自动任务" + autorun)
                    Execute(autorun)
                })
            )
        }
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
    })
    App.BindEvent("disconnected", function (event) {
        Metronome.Discard(true)
        App.Combat.Discard()
        for (var key in App.Positions) {
            App.Positions[key].Discard()
        }
        if (App.Core.Connect.CanLogin()) {
            if (App.Core.Connect.Next == null) {
                Note("" + (App.Params.ReloginDelay / 1000).toFixed() + "秒后尝试重连")
                App.Reconnect(App.Params.ReloginDelay, App.Core.Connect.Callback)
            }
        }
    })
    let matcherEnter = /^你连线进入.+。$/
    let matcherReenter = /重新连线完毕。$/
    let matcherTooFast = /你距上一次退出时间只有.+秒钟，请稍候再登录。$/
    let matcherTooFast2 = /你不能在.+秒钟之内连续重新连线。$/
    var PlanOnConnected = new App.Plan(App.Positions.Connect,
        function (task) {
            task.AddTrigger(matcherEnter).WithName("enter")
            task.AddTrigger(matcherReenter).WithName("reenter")
            task.AddTrigger(matcherTooFast).WithName("toofast")
            task.AddTrigger(matcherTooFast2).WithName("toofast2")
            task.AddTimer(5000).WithName("timeout")
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
                case "timer":
                    if (App.Core.Connect.Callback) {
                        App.Core.Connect.Next = (new Date()).getTime() + 10000
                        Note("10秒后重试")
                    }
                    break
            }
        })
    App.BindEvent("core.entermud", function () {
        App.Core.Connect.Offline = false
        App.Core.Connect.Next = null
        App.Core.Connect.Entered = true
        let cb = App.Core.Connect.Callback
        App.Core.Connect.Callback = null
        if (cb) { cb() }
    })
    App.Core.Connect.OnDisconnected = function () {

    }
    App.Engine.BindTimeHandler(function () { App.Core.Connect.OnTime() })

})(App)