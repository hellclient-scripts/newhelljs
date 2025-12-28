//响应同步模块
(function (App) {
    //检查busy,第一个参数时周期，第二个参数是延迟，第三个参数是busy结束后的回调
    //返回具体Task,可以取消
    let checkbusy = function (delay, offset, cb) {
        let nobusy = false
        delay = delay - 0
        if (isNaN(delay) || delay <= 0) {
            delay = 1000
        }
        offset = offset - 0
        if (isNaN(offset)) {
            offset = 0
        }
        let task = App.Positions["Connect"].AddTask(function (result) {
            if (result.Name == "sync") {
                App.Positions["Response"].StartNewTerm()
                if (cb) {
                    cb()
                }
            }
        })
        var timer = task.AddTimer(delay, function () {
            App.Send("bai")
            return true
        }).Reset(offset)
        task.AddTrigger("指令格式：apprentice | bai [cancel]|<对象>", function () {
            OmitOutput()
            if (!nobusy) {
                nobusy = true
                timer.Enable(false)
                App.Send("mail")
            }
            return true
        })
        task.AddTrigger("此服务已经暂停。", function () {
            OmitOutput()
        }).WithName("sync")

        App.Send("bai")
        return task
    }

    //检查目盲,第一个参数时周期，第二个参数是延迟，第三个参数是busy结束后的回调
    let checkblind = function (delay, offset, cb) {
        let noblind = false
        delay = delay - 0
        if (isNaN(delay) || delay <= 0) {
            delay = 1000
        }
        offset = offset - 0
        if (isNaN(offset)) {
            offset = 0
        }
        let task = App.Positions["Connect"].AddTask(function (result) {
            if (result.Name == "sync") {
                App.Positions["Response"].StartNewTerm()
                if (cb) {
                    cb()
                }
            }
        })
        var timer = task.AddTimer(delay, function () {
            App.Send(`ask ${GetVariable("id")} about blind`)
            return true
        }).Reset(offset)
        task.AddTrigger("你自己自言自语。", function () {
            if (!noblind) {
                noblind = true
                timer.Enable(false)
                App.Send("mail")
            }
            return true
        })
        task.AddTrigger("此服务已经暂停。", function () {
            OmitOutput()
        }).WithName("sync")

        App.Send(`ask ${GetVariable("id")} about blind`)
    }
    //同步，参数为回调
    let sync = function (cb) {
        let task = App.Positions["Connect"].AddTask(function (result) {
            if (result.Name == "sync") {
                App.Positions["Response"].StartNewTerm()
                if (cb) {
                    cb()
                }
            }
        })
        task.AddTrigger("此服务已经暂停。", function () {
            OmitOutput()
        }).WithName("sync")
        App.Send("mail")
    }
    //发起同步
    App.Sync = function (cb) {
        sync(cb)
    }
    //别名
    App.CheckBusy = checkbusy

    //注册nobusy指令
    App.Commands.RegisterExecutor("nobusy", function (commands, running) {
        running.OnStart = function (arg) {
            checkbusy(running.Command.Data.Delay, running.Command.Data.Offset, function () { App.Next() })
        }
    })
    App.NewNobusyCommand = function (delay, offset) {
        return App.Commands.NewCommand("nobusy", { Delay: delay, Offset: offset })
    }
    App.CheckBlind = checkblind
    //注册noblind指令
    App.Commands.RegisterExecutor("noblind", function (commands, running) {
        running.OnStart = function (arg) {
            checkblind(running.Command.Data.Delay, running.Command.Data.Offset, function () { App.Next() })
        }
    })
    App.NewNoblindCommand = function (delay, offset) {
        return App.Commands.NewCommand("noblind", { Delay: delay, Offset: offset })
    }
    // 注册#nobusy的用户队列
    App.UserQueue.UserQueue.RegisterCommand("#nobusy", function (uq, data) {
        uq.Commands.Append(
            App.NewNobusyCommand(data),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })
    // 注册sync的指令
    App.Commands.RegisterExecutor("sync", function (commands, running) {
        running.OnStart = function (arg) {
            sync(function () { App.Next() })
        }
    })
    App.NewSyncCommand = function () {
        return App.Commands.NewCommand("sync")
    }
    // 注册#sync的用户队列
    App.UserQueue.UserQueue.RegisterCommand("#sync", function (uq, data) {
        uq.Commands.Append(
            App.NewSyncCommand(),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })
    // 带参数的回显，参数为变量名和变量值
    App.Echo = function (name, value) {
        name = name || ""
        value = value || ""
        App.Send("follow -echo- " + name + "." + value)
    }
    //参数会以core.echo.参数名抛出事件，事件值为参数值
    App.Engine.SetFilter("core.onecho", function (event) {
        let echoevent = new App.Event("core.echo." + event.Data.Wildcards[0], event.Data.Wildcards[1])
        OmitOutput()
        App.RaiseEvent(echoevent)
    })

})(App)