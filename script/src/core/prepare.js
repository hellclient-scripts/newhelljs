(function (App) {
    let proposalsModule = App.RequireModule("helllibjs/proposals/proposals.js")
    App.Core.Prepare = {}
    App.Proposals = new proposalsModule.Proposals()
    App.Commands.RegisterExecutor("prepare", function (commands, running) {
        running.OnStart = function (arg) {
            App.Prepare(running.Command.Data.ID, running.Command.Data.Data)
        }
    })
    App.NewPrepareCommand = function (id, data) {
        return App.Commands.NewCommand("prepare", { ID: id, Data: data })
    }
    App.PrepareMoney = function (num) {
        if (!num) { num = 0 }
        let money = App.Core.Item.GetMoney()
        if (num > money) {
            let cmd
            let diff = num - money
            if (diff >= 10) {
                cmd = "qu " + Math.ceil(diff / 10) + " cash;i"
            } else {
                cmd = "qu " + diff + " gold;i"
            }
            App.Commands.PushCommands(
                App.Move.NewToCommand(App.Params.LocBank),
                App.Commands.NewDoCommand(cmd),
                App.NewSyncCommand(),
                App.Commands.NewWaitCommand(1000),
                App.NewPrepareMoneyCommand(num),
            )
        }
        App.Next()
    }
    App.NewPrepareMoneyCommand = function (num) {
        return App.Commands.NewFunctionCommand(() => { App.PrepareMoney(num) })
    }
    let eventBeforeCheck = new App.Event("core.beforecheck")
    App.Check = () => {
        App.RaiseEvent(eventBeforeCheck)
        let checks = App.Checker.Check()
        if (checks.length == 0) {
            App.Next()
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
        )
        App.Next()
    }
    App.Prepare = function (id, context) {
        App.RaiseEvent(eventBeforeCheck)
        let checks = App.Checker.Check()
        if (checks.length == 0) {
            AfterCheck(id, context)
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
                AfterCheck(id, context)
            }),
        )
        App.Next()
    }
    let AfterCheck = function (id, context) {
        id = id || ""
        let submit = App.Proposals.Submit(id, context)
        if (submit) {
            App.PushCommands(
                App.Commands.NewFunctionCommand(submit),
                App.NewPrepareCommand(id, context),
            )
        }
        App.Next()
    }
    App.Proposals.Register("cash", App.Proposals.NewProposal(function (proposals, context, exclude) {
        let cash = App.Data.Item.List.FindByName("一千两银票").First()
        let num = cash ? cash.GetData().Count : 0
        if (num >= App.Params.CashMax) {
            return function () {
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocBank),
                    App.Commands.NewDoCommand("cun " + (num - App.Params.CashKeep) + " cash;i;score"),
                    App.NewSyncCommand(),
                    App.Commands.NewWaitCommand(1000),
                )
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("gold", App.Proposals.NewProposal(function (proposals, context, exclude) {
        let gold = App.Data.Item.List.FindByName("黄金").First()
        let num = gold ? gold.GetData().Count : 0
        if (num >= App.Params.GoldMax) {
            return function () {
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocBank),
                    App.Commands.NewDoCommand("cun " + Math.floor((num - (App.Params.GoldMax - App.Params.GoldKeep) / 2)) + " gold;i;score"),
                    App.NewSyncCommand(),
                    App.Commands.NewWaitCommand(1000),
                )
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("qu", App.Proposals.NewProposal(function (proposals, context, exclude) {
        let gold = App.Data.Item.List.FindByName("黄金").First()
        let num = gold ? gold.GetData().Count : 0
        if (num < App.Params.GoldKeep) {
            return function () {
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocBank),
                    App.Commands.NewDoCommand("qu " + Math.floor(((App.Params.GoldMax - App.Params.GoldKeep) / 2 - num)) + " gold;i;score"),
                    App.NewSyncCommand(),
                    App.Commands.NewWaitCommand(1000),
                )
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("silver", App.Proposals.NewProposal(function (proposals, context, exclude) {
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
    App.Proposals.Register("coin", App.Proposals.NewProposal(function (proposals, context, exclude) {
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
    App.Proposals.Register("food", App.Proposals.NewProposal(function (proposals, context, exclude) {
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
    App.Proposals.Register("drink", App.Proposals.NewProposal(function (proposals, context, exclude) {
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
    App.Proposals.Register("exp", App.Proposals.NewProposal(function (proposals, context, exclude) {
        let maxexp = App.Core.GetMaxExp()
        if (maxexp > 0 && App.Data.Player.HP["经验"] > maxexp) {
            let skill = App.Core.GetMaxSkillLevel()
            let safelevel = skill ? skill["等级"] : 0 - 2
            if ((safelevel * safelevel * safelevel / 10) > maxexp) {
                return function () {
                    PrintSystem("最大经验设置有误,技能 " + skill["名称"] + " 超限")
                }
            }
            return function () {
                $.PushCommands(
                    $.To(App.Params.LocDazuo),
                    $.Do("fangqi exp;hp"),
                    $.Nobusy(),
                )
                App.Next()
            }
        }
        return null
    }))

    let common = App.Proposals.NewProposalGroup(
        "eatyao",
        "cash",
        "gold",
        "qu",
        "silver",
        "coin",
        "jinchuanyao",
        "yangjingdan",
        "food",
        "drink",
        "inspire",
        "dazuo",
        "heal",
        "dispel",
        "tuna",
        "assets",
        "item",
        "repair",
    )
    App.Proposals.Register("", common)
    App.Proposals.Register("common", common)
    App.Proposals.Register("commonWithStudy", App.Proposals.NewProposalGroup("common", "jiqu", "study"))
    App.Proposals.Register("commonWithExp", App.Proposals.NewProposalGroup("commonWithStudy", "exp"))
    App.UserQueue.UserQueue.RegisterCommand("#prepare", function (uq, data) {
        uq.Commands.Append(
            App.NewPrepareCommand(data),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })

})(App)