(function (App) {
    let assetsModule = App.RequireModule("helllibjs/assets/assets.js")
    let conditionsModule = App.RequireModule("helllibjs/conditions/conditions.js")
    App.Assets = new assetsModule.Assets()
    App.Core.Assets = {}
    App.Core.Assets.Conditions = new conditionsModule.Conditions()
    App.Core.Assets.Rules = []
    App.Core.Assets.StaticRules = []
    App.Core.Assets.GoodsRules = []
    App.Core.Assets.MatchFunction = function (rule, asset) {
        switch (rule.Data.Name) {
            case "any":
                break
            case "":
            case "id":
                if (!(rule.Data.UserData.includes(asset.Item.ID))) {
                    return
                }
                break
            case "name":
                if (!(rule.Data.UserData.includes(asset.Item.GetData().Name))) {
                    return
                }
                break
            default:
                return
        }
        if (!App.Core.Assets.Conditions.Check(rule.Data.Conditions, asset)) {
            return
        }
        return rule.Data.Command
    }
    App.Core.Assets.ParseRule = function (data) {
        return App.Assets.Parse(data, App.Core.Assets.MatchFunction)
    }
    App.Core.Assets.LoadRules = function () {
        App.Core.Assets.Rules = []
        App.LoadVariable("sell").forEach(data => {
            App.Core.Assets.Rules.push(App.Core.Assets.ParseRule(data))
        })
    }
    App.Core.Assets.LoadRules()
    App.LoadLines("data/assets.txt").forEach(data => {
        App.Core.Assets.StaticRules.push(App.Core.Assets.ParseRule(data))
    })
    App.Core.Assets.Maintain = function (item, rules) {
        return App.Assets.Maintain(item, rules || [], App.Core.Assets.GoodsRules, App.Core.Assets.Rules, App.Core.Assets.StaticRules)
    }
    App.Core.Assets.NeedCarry = function (item, rules) {
        let result = App.Core.Assets.Maintain(item, rules)
        if (result && (result.Command == "" || result.Command != "#carry")) {
            return true
        }
        return false
    }
    App.Core.Assets.Conditions.RegisterMatcher(App.Core.Assets.Conditions.NewMatcher("wielded", function (data, target) {
        return target.Item && target.Item.Mode != 0
    }))

    App.Core.Assets.GoMaintain = function (result) {
        if (result) {
            switch (result.Command) {
                case "#sell":
                    App.Commands.PushCommands(
                        App.Move.NewToCommand("48"),
                        App.Commands.NewDoCommand("sell " + result.Asset.Item.IDLower),
                        App.Commands.NewDoCommand("i"),
                        App.NewSyncCommand(),
                        App.Commands.NewWaitCommand(1000),)
                    break
                case "#drop":
                    App.Commands.PushCommands(
                        App.Move.NewToCommand("26"),
                        App.Commands.NewDoCommand("drop " + result.Asset.Item.IDLower),
                        App.Commands.NewDoCommand("i"),
                        App.NewSyncCommand(),
                        App.Commands.NewWaitCommand(1000),
                    )
                    break
                case "#drophere":
                    App.Commands.PushCommands(
                        App.Commands.NewDoCommand("drop " + result.Asset.Item.IDLower),
                        App.Commands.NewDoCommand("i"),
                        App.NewSyncCommand(),
                    )
                    break
                case "#pack":
                    if (App.Data.Item.List.FindByID("budai").First()) {
                        App.Commands.PushCommands(
                            App.Commands.NewDoCommand("put " + result.Asset.Item.IDLower + " in budai"),
                            App.Commands.NewDoCommand("i"),
                            App.NewSyncCommand(),
                        )
                    } else {
                        App.Commands.PushCommands(
                            App.Goods.NewBuyCommand("budai"),
                            App.Commands.NewDoCommand("put " + result.Asset.Item.IDLower + "in budai"),
                            App.Commands.NewDoCommand("i"),
                            App.NewSyncCommand(),
                        )
                    }
                    break
                default:
                    App.Fatal("assets", "未知的处理指令" + result.Command)
            }
        }
        App.Next()
    }
    App.Core.Assets.PrepareDataKey = "assetsrules"
    App.Proposals.Register("assets", App.Proposals.NewProposal(function (proposals, exclude) {
        for (item of App.Data.Item.List.Items) {
            let result = App.Core.Assets.Maintain(item, App.Core.Prepare.Data[App.Core.Assets.PrepareDataKey] || [])
            if (result && result.Command != "" && result.Command != "#carry") {
                return function () {
                    App.Core.Assets.GoMaintain(result)
                }
                return
            }
        }
        return null
    }))
})(App)