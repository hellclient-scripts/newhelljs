(function (App) {

    let checkbusy = function (delay, cb) {
        delay = delay - 0
        if (isNaN(delay) || delay <= 0) {
            delay = 1000
        }
        let task = App.Positions["Connect"].NewTask(function (result) {
            if (result.Name == "nobusy") {
                cb()
            }
        })
        task.NewTimer(delay, function () {
            App.Send("bai")
            return true
        })
        task.NewTrigger("指令格式：apprentice | bai [cancel]|<对象>",function(){
            OmitOutput()
        }).WithName("nobusy")
        App.Send("bai")
    }
    let sync = function (cb) {
        let task = App.Positions["Connect"].NewTask(function (result) {
            if (result.Name == "sync") {
                cb()
            }
        })
        task.NewTrigger("此服务已经暂停。",function(){
            OmitOutput()
        }).WithName("sync")
        App.Send("mail")
    }
    App.Sync=function(cb){
        sync(cb)
    }
    App.Commands.RegisterExecutor("nobusy", function (commands, running) {
        running.OnStart = function (arg) {
            checkbusy(running.Command.Data, function () { App.Next() })
        }
    })
    App.NewNobusyCommand = function (delay) {
        return App.Commands.NewCommand("nobusy", delay)
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
    App.NewSyncCommand = function (delay) {
        return App.Commands.NewCommand("sync", delay)
    }
    App.UserQueue.UserQueue.RegisterCommand("#sync", function (uq, data) {
        uq.Commands.Append(
            App.NewSyncCommand(data),
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
        let echoevent=new App.Event("core.echo."+event.Data.Wildcards[0],event.Data.Wildcards[1])
        App.RaiseEvent(echoevent)
    })

})(App)