(function (App) {
    App.Core.Dispel = {}
    App.Core.Dispel.Need = false
    App.Core.Dispel.Fail = false
    App.BindEvent("core.dispelok", function () {
        App.Core.Dispel.Need = false
        App.Core.Dispel.Fail = false
    })
    App.BindEvent("core.needdispel", function () {
        App.Core.Dispel.Need = true
    })
    App.BindEvent("core.notdispelable", function () {
        App.Core.Dispel.Fail = true
    })
    App.Proposals.Register("dispel", App.Proposals.NewProposal(function (proposals, context, exclude) {
        if (App.Core.Dispel.Need && App.Data.Player.Jifa["force"] && App.Data.Player.Jifa["force"].Level > 100) {
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