(function (App) {
    App.Core.Dispel = {}
    App.Core.Dispel.Need = false
    App.BindEvent("core.dispelok", function () {
        App.Core.Dispel.Need = false
    })
    App.BindEvent("core.needdispel", function () {
        App.Core.Dispel.Need = true
    })
    App.Proposals.Register("dispel", App.Proposals.NewProposal(function (proposals, exclude) {
        if (App.Core.Dispel.Need) {
            return function () {
                App.Commands.PushCommands(
                    App.Commands.NewDoCommand("yun dispel;hp"),
                    App.NewNobusyCommand(),
                )
                App.Next()
            }
        }
        return null
    }))

})(App)