(function (App) {

    App.Core.Emergency = {}
    App.Core.Emergency.OnFaint=function(){
        Disconnect()
    }
    App.BindEvent("core.faint",App.Core.Emergency.OnFaint)
})(App)