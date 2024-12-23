(function (App) {

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
    }
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
            App.Send(`ask ${App.Data.Player.Score.ID} about blind`)
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

        App.Send(`ask ${App.Data.Player.Score.ID} about blind`)
    }

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
    App.Sync = function (cb) {
        sync(cb)
    }
    App.CheckBusy = checkbusy

    App.Commands.RegisterExecutor("nobusy", function (commands, running) {
        running.OnStart = function (arg) {
            checkbusy(running.Command.Data.Delay, running.Command.Data.Offset, function () { App.Next() })
        }
    })
    App.NewNobusyCommand = function (delay, offset) {
        return App.Commands.NewCommand("nobusy", { Delay: delay, Offset: offset })
    }
    App.CheckBlind=checkblind
    App.Commands.RegisterExecutor("noblind", function (commands, running) {
        running.OnStart = function (arg) {
            checkblind(running.Command.Data.Delay, running.Command.Data.Offset, function () { App.Next() })
        }
    })
    App.NewNoblindCommand = function (delay, offset) {
        return App.Commands.NewCommand("noblind", { Delay: delay, Offset: offset })
    }
    App.UserQueue.UserQueue.RegisterCommand("#nobusy", function (uq, data) {
        uq.Commands.Append(
            App.NewNobusyCommand(data),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })
    App.Commands.RegisterExecutor("sync", function (commands, running) {
        running.OnStart = function (arg) {
            sync(function () { App.Next() })
        }
    })
    App.NewSyncCommand = function () {
        return App.Commands.NewCommand("sync")
    }
    App.UserQueue.UserQueue.RegisterCommand("#sync", function (uq, data) {
        uq.Commands.Append(
            App.NewSyncCommand(),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })
    App.Echo = function (name, value) {
        name = name || ""
        value = value || ""
        App.Send("follow -echo- " + name + "." + value)
    }
    App.Engine.SetFilter("core.onecho", function (event) {
        let echoevent = new App.Event("core.echo." + event.Data.Wildcards[0], event.Data.Wildcards[1])
        OmitOutput()
        App.RaiseEvent(echoevent)
    })

})(App)