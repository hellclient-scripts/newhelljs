(function (App) {
    let commandModule=App.RequireModule("helllibjs/command/command.js")
    App.Commands=new commandModule.Commands()
    App.Commands.PositionCommand=App.Positions["Command"]
    App.Commands.PositionQueue=App.Positions["CommandQueue"]
    App.Commands.InitCommon()
    App.Commands.RegisterExecutor("manual",function(commands,running){
        running.OnStart=function(arg){
            Note("进入手动模式")
        }
    })
    let cmdManual=App.Commands.NewCommand("manual")
    App.Commands.EmptyCommand=cmdManual
    App.Next=function(){App.Commands.Next()}
    App.Fail=function(){App.Commands.Fail()}
    App.Finish=function(){App.Commands.Finish()}
    App.Append=function(...commands){App.Commands.Append(...commands)}
    App.Insert=function(...commands){App.Commands.Insert(...commands)}
    App.Execute=function(command,arg){App.Commands.Execute(command,arg)}
    App.Push=function(entrycmd){return App.Commands.Push(entrycmd)}
    App.PushCommands=function(...commands){return App.Commands.PushCommands(...commands)}
    App.Next()
})(App)