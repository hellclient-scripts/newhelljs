(function (App) {
    App.Core.Heal = {}


    App.Proposals.Register("dazuo", App.Proposals.NewProposal(function (proposals, exclude) {
        if ((App.Data.Player.HP["当前内力"] * 100 / App.Data.Player.HP["内力上限"]) <= App.Params.NeiliMin) {
            return function () {
                let num = App.Params.NumDazuo > 0 ? App.Params.NumDazuo : (App.Data.Player.HP["内力上限"] - App.Data.Player.HP["当前内力"])
                if (num >= App.Data.Player.HP["当前气血"]) { num = App.Data.Player.HP["当前气血"] }
                if (num < 10) { num = 10 }
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocDazuo),
                    App.Commands.NewDoCommand("dazuo "+num),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                    App.NewSyncCommand(),
                )
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("jinchuanyao", App.Proposals.NewProposal(function (proposals, exclude) {
        if (App.Data.Player.HP["气血百分比"] <= 20) {
            return function () {
                App.Commands.PushCommands(
                    App.Goods.NewBuyCommand("jin chuangyao"),
                    App.Commands.NewDoCommand("eat jinchuang yao;yun recover;yun regenerate;hp;i"),
                    App.NewNobusyCommand(),
                )
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("heal", App.Proposals.NewProposal(function (proposals, exclude) {
        if (App.Data.Player.HP["气血百分比"] <= App.Params.HealBelow) {
            return function () {
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocDazuo),
                    App.Commands.NewDoCommand("yun heal"),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                    App.NewSyncCommand(),
                )
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("tuna", App.Proposals.NewProposal(function (proposals, exclude) {
        if ((App.Data.Player.HP["当前精力"] * 100 / App.Data.Player.HP["精力上限"]) <= App.Params.JingliMin) {
            return function () {
                let num = App.Params.NumTuna > 0 ? App.Params.NumTuna : (App.Data.Player.HP["精力上限"] - App.Data.Player.HP["当前精力"])
                if (num >= App.Data.Player.HP["当前精气"]) { num = App.Data.Player.HP["当前精气"] }
                if (num < 10) { num = 10 }
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocDazuo),
                    App.Commands.NewDoCommand("dazuo "+num),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                    App.NewSyncCommand(),
                )
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("yangjingdan", App.Proposals.NewProposal(function (proposals, exclude) {
        if (App.Data.Player.HP["精气百分比"] <= 34) {
            return function () {
                App.Commands.PushCommands(
                    App.Goods.NewBuyCommand("yangjing dan"),
                    App.Commands.NewDoCommand("eat yangjing dan;yun recover;yun regenerate;hp;i"),
                    App.NewNobusyCommand(),
                )
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("inspire", App.Proposals.NewProposal(function (proposals, exclude) {
        if (App.Data.Player.HP["精气百分比"] <= App.Params.InspireBelow) {
            return function () {
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocDazuo),
                    App.Commands.NewDoCommand("yun inspire"),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                    App.NewSyncCommand(),
                )
                App.Next()
            }
        }
        return null
    }))

})(App)