(function (App) {

    let checkbusy = function (delay, offset, cb) {
        delay = delay - 0
        if (isNaN(delay) || delay <= 0) {
            delay = 1000
        }
        offset = offset - 0
        if (isNaN(offset)) {
            offset = 0
        }
        let task = App.Positions["Connect"].AddTask(function (result) {
            if (result.Name == "nobusy") {
                App.Positions["Response"].StartNewTerm()
                if (cb) {
                    cb()
                }
            }
        })
        task.AddTimer(delay, function () {
            App.Send("bai")
            return true
        }).Reset(offset)
        task.AddTrigger("指令格式：apprentice | bai [cancel]|<对象>", function () {
            OmitOutput()
        }).WithName("nobusy")
        App.Send("bai")
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
    App.CheckBusy=checkbusy
    
    App.Commands.RegisterExecutor("nobusy", function (commands, running) {
        running.OnStart = function (arg) {
            checkbusy(running.Command.Data.Delay, running.Command.Data.Offset, function () { App.Next() })
        }
    })
    App.NewNobusyCommand = function (delay, offset) {
        return App.Commands.NewCommand("nobusy", { Delay: delay, Offset: offset })
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