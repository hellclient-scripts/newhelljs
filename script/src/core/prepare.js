(function (App) {
    let proposalsModule = App.RequireModule("helllibjs/proposals/proposals.js")
    App.Core.Prepare = {}
    App.Proposals = new proposalsModule.Proposals()
    App.Commands.RegisterExecutor("prepare", function (commands, running) {
        running.OnStart = function (arg) {
            App.Prepare(running.Command.Data)
        }
    })
    App.NewPrepareCommand = function (id) {
        return App.Commands.NewCommand("prepare", id)
    }
    let eventBeforeCheck=new App.Event("core.beforecheck")
    App.Prepare = function (id) {
        App.RaiseEvent(eventBeforeCheck)
        let checks = App.Checker.Check()
        if (checks.length == 0) {
            AfterCheck(id)
            return
        }
        App.PushCommands(
            App.Commands.NewFunctionCommand(function () {
                checks.forEach(check => {
                    check()
                });
                App.Next()
            }),
            App.NewSyncCommand(),
            App.Commands.NewFunctionCommand(function () {
                AfterCheck(id)
            }),
        )
        App.Next()
    }
    let AfterCheck = function (id) {
        id = id || ""
        let submit = App.Proposals.Submit(id)
        if (submit) {
            App.PushCommands(
                App.Commands.NewFunctionCommand(submit),
                App.NewPrepareCommand(id),
            )
        }
        App.Next()

    }
    App.Proposals.Register("cash", App.Proposals.NewProposal(function (proposals, exclude) {
        let cash = App.Data.Item.List.FindByName("一千两银票").First()
        let num = cash ? cash.GetData().Count : 0
        if (num >= App.Params.CashMax) {
            return function () {
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocBank),
                    App.Commands.NewDoCommand("cun " + (num - App.Params.CashKeep) + " cash;i"),
                    App.NewSyncCommand(),
                    App.Commands.NewWaitCommand(1000),
                )
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("gold", App.Proposals.NewProposal(function (proposals, exclude) {
        let gold = App.Data.Item.List.FindByName("黄金").First()
        let num = gold ? gold.GetData().Count : 0
        if (num >= App.Params.GoldMax) {
            return function () {
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocBank),
                    App.Commands.NewDoCommand("cun " + Math.floor((num - (App.Params.GoldMax - App.Params.GoldKeep) / 2)) + " gold;i"),
                    App.NewSyncCommand(),
                    App.Commands.NewWaitCommand(1000),
                )
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("qu", App.Proposals.NewProposal(function (proposals, exclude) {
        let gold = App.Data.Item.List.FindByName("黄金").First()
        let num = gold ? gold.GetData().Count : 0
        if (num < App.Params.GoldKeep) {
            return function () {
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocBank),
                    App.Commands.NewDoCommand("qu " + Math.floor(((App.Params.GoldMax - App.Params.GoldKeep) / 2 - num)) + " gold;i"),
                    App.NewSyncCommand(),
                    App.Commands.NewWaitCommand(1000),
                )
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("silver", App.Proposals.NewProposal(function (proposals, exclude) {
        let silver = App.Data.Item.List.FindByName("白银").First()
        let num = silver ? silver.GetData().Count : 0
        if (num >= App.Params.SilverMax) {
            return function () {
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocBank),
                    App.Commands.NewDoCommand("cun " + (num - App.Params.SilverKeep) + " silver;i"),
                    App.NewSyncCommand(),
                    App.Commands.NewWaitCommand(1000),
                )
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("coin", App.Proposals.NewProposal(function (proposals, exclude) {
        let coin = App.Data.Item.List.FindByName("铜钱").First()
        let num = coin ? coin.GetData().Count : 0
        if (num >= App.Params.CoinMax) {
            return function () {
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocBank),
                    App.Commands.NewDoCommand("cun " + (num - App.Params.CoinKeep) + " coin;i"),
                    App.NewSyncCommand(),
                    App.Commands.NewWaitCommand(1000),
                )
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("food", App.Proposals.NewProposal(function (proposals, exclude) {
        let item = App.Data.Item.List.FindByIDLower(App.Params.Food).First()
        let num = item ? item.GetData().Count : 0
        if (num < App.Params.FoodMin) {
            return function () {
                App.Commands.PushCommands(
                    App.Goods.NewBuyCommand(App.Params.Food)
                )
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("drink", App.Proposals.NewProposal(function (proposals, exclude) {
        let item = App.Data.Item.List.FindByIDLower(App.Params.Drink).First()
        let num = item ? item.GetData().Count : 0
        if (num < App.Params.DrinkMin) {
            return function () {
                App.Commands.PushCommands(
                    App.Goods.NewBuyCommand(App.Params.Drink)
                )
                App.Next()
            }
        }
        return null
    }))
    let common = App.Proposals.NewProposalGroup(
        "cash",
        "gold",
        "qu",
        "silver",
        "coin",
        "food",
        "drink",
    )
    App.Proposals.Register("", common)
    App.Proposals.Register("common", common)

    App.UserQueue.UserQueue.RegisterCommand("#prepare", function (uq, data) {
        uq.Commands.Append(
            App.NewPrepareCommand(data),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })

})(App)