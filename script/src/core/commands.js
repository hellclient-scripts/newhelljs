//指令模块
(function (App) {
    let commandModule = App.RequireModule("helllibjs/command/command.js")
    // commandModule.Debug=true
    //指令实例
    App.Commands = new commandModule.Commands()
    //指令的Position
    App.Commands.PositionCommand = App.Positions["Command"]
    App.Commands.PositionQueue = App.Positions["CommandQueue"]
    App.Commands.InitCommon()
    //定义空闲指令
    App.Commands.RegisterExecutor("manual", function (commands, running) {
        running.OnStart = function (arg) {
            Note("进入手动模式")
        }
    })
    let cmdManual = App.Commands.NewCommand("manual")
    App.Commands.EmptyCommand = cmdManual
    //别名
    App.Next = function () { App.Commands.Next() }
    App.Fail = function () { App.Commands.Fail() }
    App.Pop = function () { App.Commands.Pop() }
    App.Append = function (...commands) { App.Commands.Append(...commands) }
    App.Insert = function (...commands) { App.Commands.Insert(...commands) }
    App.Execute = function (command, arg) { App.Commands.Execute(command, arg) }
    App.Push = function (readycmd) { return App.Commands.Push(readycmd) }
    App.PushCommands = function (...commands) { return App.Commands.PushCommands(...commands) }
    App.Next()
})(App)