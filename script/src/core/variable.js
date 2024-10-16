(function (App) {
    App.ReloadVariable=function(){
        App.LoadSender()
        App.Core.Goods.Load()
        App.Core.Weapon.Load()
        App.Core.Combat.Load()
    }
})(App)