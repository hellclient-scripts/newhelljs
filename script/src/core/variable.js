(function (App) {
    App.ReloadVariable = function () {
        App.LoadSender()
        App.Core.Goods.Load()
        App.Core.Weapon.Load()
        App.Core.Combat.Load()
        App.Core.NPC.Load()
        App.Core.Study.Load()
        App.Core.Stage.Load()
    }
})(App)