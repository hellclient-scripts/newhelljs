//驱散模块
(function (App) {
    App.Core.Dispel = {}
    //是否需要驱散
    App.Core.Dispel.Need = false
    //是否驱散失败
    App.Core.Dispel.Fail = false
    //是否致命毒
    App.Core.Dispel.Deadly = false
    App.BindEvent("core.dispelok", function () {
        App.Core.Dispel.Need = false
        App.Core.Dispel.Fail = false
        App.Core.Dispel.Deadly = false
    })
    App.BindEvent("core.needdispel", function (event) {
        App.Core.Dispel.Need = true
        if (event.Data.Output.indexOf("玄冥神掌") > -1) {
            App.Core.Dispel.Deadly = true
        }
    })
    App.BindEvent("core.notdispelable", function () {
        App.Core.Dispel.Fail = true
    })
    //注册解毒的准备
    App.Proposals.Register("dispel", App.Proposals.NewProposal(function (proposals, context, exclude) {
        if (App.Core.Dispel.Need && App.Core.Dispel.Deadly && (App.Data.Player.HP["气血百分比"] <= 10 || App.Data.Player.HP["精气百分比"] <= 10)) {
            Note("致命毒")
            App.Core.Emergency.NoLogin = true
            App.Commands.Discard()
            Disconnect()
            return
        }
        if (App.Core.Dispel.Need && App.Data.Player.Jifa["force"] && App.Data.Player.Jifa["force"].Level > 100 && App.Data.Player.HP["内力上限"] >= 300) {
            return function () {
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocDazuo),
                    App.Commands.NewDoCommand("yun dispel;hp"),
                    App.NewNobusyCommand(),
                )
                App.Next()
            }
        }
        return null
    }))

})(App)