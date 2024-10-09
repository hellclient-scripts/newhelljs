(function (app) {
    let commandModule=app.RequireModule("helllibjs/command/command.js")
    app.Commands=new commandModule.Commands()
    app.Commands.PositionCommand=app.Positions["Command"]
    app.Commands.PositionQueue=app.Positions["CommandQueue"]
    app.Commands.InitCommon()
    app.Commands.RegisterExecutor("manual",function(commands,running){
        running.OnStart=function(arg){
            Note("进入手动模式")
        }
    })
    let cmdManual=app.Commands.NewCommand("manual")
    app.Commands.EmptyCommand=cmdManual
    app.Next=function(){app.Commands.Next()}
    app.Fail=function(){app.Commands.Fail()}
    app.Finish=function(){app.Commands.Finish()}
    app.Append=function(...commands){app.Commands.Append(...commands)}
    app.Insert=function(...commands){app.Commands.Insert(...commands)}
    app.Execute=function(command,arg){app.Commands.Execute(command,arg)}
    app.Next()
})(App)