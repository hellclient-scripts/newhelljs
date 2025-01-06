//加载变量模块
(function (App) {
    App.ReloadVariable = function () {
        App.LoadSender()
        App.Move.Load()
        App.Core.Goods.Load()
        App.Core.Weapon.Load()
        App.Core.Combat.Load()
        App.Core.NPC.Load()
        App.Core.Study.Load()
        App.Core.Stage.Load()
        //App.Core.Params.Load最后覆盖设置
        App.Core.Params.Load()
    }
})(App)