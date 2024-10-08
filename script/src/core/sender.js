(function (app) {
    let senderModule=app.RequireModule("helllibjs/sender/sender.js")
    App.Sender=new senderModule.Sender()
    App.Send=function(cmd,Grouped){
        App.Sender.Send(cmd,Grouped)
    }
})(App)