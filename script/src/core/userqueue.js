//用户队列模块
(function (App) {
    let userqueueModule = App.RequireModule("helllibjs/command/userqueue.js")
    App.UserQueue = {}
    //响应别名
    App.UserQueue.OnAlias = function (n, l, w) {
        App.UserQueue.Exec(l)
    }
    //执行入口
    App.UserQueue.Exec = function (cmd) {
        App.Commands.PushCommands(
            App.Commands.NewFunctionCommand(App.Init),
            App.Commands.NewFunctionCommand(() => { App.UserQueue.UserQueue.Exec(cmd) }),
        )
        App.Next()
    }
    //实例及初始化
    App.UserQueue.UserQueue = new userqueueModule.UserQueue(App.Commands)
    App.UserQueue.UserQueue.RegisterCommand("#wait", userqueueModule.Wait)
    App.UserQueue.UserQueue.RegisterCommand("#loop", userqueueModule.Loop)
    App.UserQueue.UserQueue.RegisterCommand("#do", userqueueModule.Do)
    App.UserQueue.UserQueue.RegisterCommand("#to", function (uq, data) {
        uq.Commands.Append(
            App.Move.NewToCommand(data.split(",")),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })
    App.BindEvent("core.stop", function () {
        App.UserQueue.UserQueue.Stop()
    })
})(App)