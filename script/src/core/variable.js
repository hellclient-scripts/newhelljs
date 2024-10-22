(function (App) {
    App.ReloadVariable = function () {
        App.LoadSender()
        App.Core.Goods.Load()
        App.Core.Weapon.Load()
        App.Core.Combat.Load()
        let expmax = GetVariable("max_exp")
        if (expmax.trim() && !isNaN(expmax)) {
            App.Params.ExpMax = expmax - 0
        }
        App.Core.NPC.Load()
    }
})(App)