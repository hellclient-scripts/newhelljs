(function (App) {
    let userqueueModule=App.RequireModule("helllibjs/command/userqueue.js")
    App.UserQueue={}
    App.UserQueue.OnAlias=function(n,l,w){
        App.UserQueue.UserQueue.Exec(l)
    }
    App.UserQueue.UserQueue=new userqueueModule.UserQueue(App.Commands)
    App.UserQueue.UserQueue.RegisterCommand("#wait",userqueueModule.Wait)
    App.UserQueue.UserQueue.RegisterCommand("#loop",userqueueModule.Loop)
    App.UserQueue.UserQueue.RegisterCommand("#do",userqueueModule.Do)
    App.UserQueue.UserQueue.RegisterCommand("#to",function(uq,data){
        uq.Commands.Append(
            App.Move.NewToCommand(data.split(",")),
            uq.Commands.NewFunctionCommand(function(){uq.Next()}),
        )
        uq.Commands.Next()
    })
    App.BindEvent("core.stop",function(){
        App.UserQueue.UserQueue.Stop()
    })
})(App)