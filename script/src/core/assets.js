//物品售卖模块
(function (App) {
    let assetsModule = App.RequireModule("helllibjs/assets/assets.js")
    let conditionsModule = App.RequireModule("helllibjs/conditions/conditions.js")
    App.Assets = new assetsModule.Assets()
    App.Core.Assets = {}
    App.Core.Assets.Conditions = new conditionsModule.Conditions()
    App.Core.Assets.Rules = []
    App.Core.Assets.StaticRules = []
    App.Core.Assets.GoodsRules = []
    // 配置文件的匹配条件
    App.Core.Assets.MatchFunction = function (rule, asset) {
        switch (rule.Data.Name) {
            case "any"://任意
                break
            case "":
            case "id"://id 匹配,默认
                if (!(rule.Data.UserData.includes(asset.Item.ID))) {
                    return
                }
                break
            case "name"://中文名匹配
                if (!(rule.Data.UserData.includes(asset.Item.GetData().Name))) {
                    return
                }
                break
            default:
                return
        }
        // 再做一轮添加匹配
        if (!App.Core.Assets.Conditions.Check(rule.Data.Conditions, asset)) {
            return
        }
        return rule.Data.Command
    }
    //将单行文本解析为处理规则
    App.Core.Assets.ParseRule = function (data) {
        return App.Assets.Parse(data, App.Core.Assets.MatchFunction)
    }
    //读取变量中的规则列表
    App.Core.Assets.LoadRules = function () {
        App.Core.Assets.Rules = []
        App.LoadVariable("sell").forEach(data => {
            App.Core.Assets.Rules.push(App.Core.Assets.ParseRule(data))
        })
    }
    App.Core.Assets.LoadRules()
    //读取默认配置
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
                case "#sell"://出售
                    App.Commands.PushCommands(
                        App.Move.NewToCommand("48"),
                        App.Commands.NewDoCommand("sell " + result.Asset.Item.IDLower),
                        App.Commands.NewDoCommand("i"),
                        App.NewSyncCommand(),
                        App.Commands.NewWaitCommand(1000),)
                    break
                case "#drop"://丢到客店
                    App.Commands.PushCommands(
                        App.Move.NewToCommand("26"),
                        App.Commands.NewDoCommand("drop " + result.Asset.Item.IDLower),
                        App.Commands.NewDoCommand("i"),
                        App.NewSyncCommand(),
                        App.Commands.NewWaitCommand(1000),
                    )
                    break
                case "#drophere"://原地丢
                    App.Commands.PushCommands(
                        App.Commands.NewDoCommand("drop " + result.Asset.Item.IDLower),
                        App.Commands.NewDoCommand("i"),
                        App.NewSyncCommand(),
                    )
                    break
                case "#store"://存起来
                    if (App.Data.Item.List.FindByID("qiankun bag").First()) {
                        App.Commands.PushCommands(
                            App.Commands.NewDoCommand("keep " + result.Asset.Item.IDLower),
                            App.Commands.NewDoCommand("i"),
                            App.NewSyncCommand()
                        )
                    } else {
                        App.Commands.PushCommands(
                            App.Move.NewToCommand("2682"),
                            App.Commands.NewDoCommand("store " + result.Asset.Item.IDLower),
                            App.Commands.NewDoCommand("i"),
                            App.NewSyncCommand()
                        )
                    }
                    break
                case "#pack"://打包带身上
                    if (App.Data.Item.List.FindByID("qiankun bag").First()) {
                        App.Commands.PushCommands(
                            App.Commands.NewDoCommand("keep " + result.Asset.Item.IDLower),
                            App.Commands.NewDoCommand("i"),
                            App.NewSyncCommand()
                        )
                    } else if (App.Data.Item.List.FindByID("budai").First()) {
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
                case "#use"://直接使用(勋章)
                    App.Commands.PushCommands(
                        App.Commands.NewDoCommand("use " + result.Asset.Item.IDLower),
                        App.Commands.NewDoCommand("i;donate"),
                        App.NewSyncCommand(),
                    )
                    break
                default:
                    App.Fatal("assets", "未知的处理指令" + result.Command)
                    return
            }
        }
        App.Next()
    }
    //准备时的上下文
    App.Core.Assets.PrepareDataKey = "assetsrules"
    //注册一个处理物品的准备
    App.Proposals.Register("assets", App.Proposals.NewProposal(function (proposals, context, exclude) {
        let canStore = (App.Data.Item.List.FindByID("qiankun bag").First() != null) || (GetVariable("house").trim() != "" && App.Data.Item.List.FindByID("key").First() != null)
        for (item of App.Data.Item.List.Items) {
            let result = App.Core.Assets.Maintain(item, context[App.Core.Assets.PrepareDataKey] || [])
            if (result && result.Command != "" && result.Command != "#carry") {
                if (canStore || result.Command != "#store") {
                    return function () {
                        App.Core.Assets.GoMaintain(result)
                    }
                }
                return
            }
        }
        return null
    }))
})(App)