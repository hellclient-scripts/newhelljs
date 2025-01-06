//准备模块
(function (App) {
    let proposalsModule = App.RequireModule("helllibjs/proposals/proposals.js")
    App.Core.Prepare = {}
    //准备的实例
    App.Proposals = new proposalsModule.Proposals()
    //注册prepare指令
    App.Commands.RegisterExecutor("prepare", function (commands, running) {
        running.OnStart = function (arg) {
            App.Prepare(running.Command.Data.ID, running.Command.Data.Data)
        }
    })
    App.NewPrepareCommand = function (id, data) {
        return App.Commands.NewCommand("prepare", { ID: id, Data: data })
    }
    //准备钱的函数
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
    //注册准备现金指令
    App.NewPrepareMoneyCommand = function (num) {
        return App.Commands.NewFunctionCommand(() => { App.PrepareMoney(num) })
    }

    let eventBeforeCheck = new App.Event("core.beforecheck")
    //检查的函数
    App.Check = () => {
        App.RaiseEvent(eventBeforeCheck)//触发检查发送指令
        let checks = App.Checker.Check()//获取需要执行的检查
        if (checks.length == 0) {//无需检查
            App.Next()
            return
        }
        App.PushCommands(//一次性执行所有检查
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
    //准备函数，第一个函数时准备id,第二个时准备的上下文(环境变量)
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
    //根据checker结果，执行准备
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
    //注册存cash的准备
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
    //注册存gold的准备
    App.Proposals.Register("gold", App.Proposals.NewProposal(function (proposals, context, exclude) {
        let gold = App.Data.Item.List.FindByName("黄金").First()
        let num = gold ? gold.GetData().Count : 0
        let goldmax = context.GoldMax != null ? context.GoldMax : App.Params.GoldMax
        let goldkeep = context.GoldKeep != null ? context.GoldKeep : App.Params.GoldKeep
        if (num >= goldmax) {
            return function () {
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocBank),
                    App.Commands.NewDoCommand("cun " + Math.floor((num - (goldmax - goldkeep) / 2)) + " gold;i;score"),
                    App.NewSyncCommand(),
                    App.Commands.NewWaitCommand(1000),
                )
                App.Next()
            }
        }
        return null
    }))
    //注册取钱的准备
    App.Proposals.Register("qu", App.Proposals.NewProposal(function (proposals, context, exclude) {
        let gold = App.Data.Item.List.FindByName("黄金").First()
        let num = gold ? gold.GetData().Count : 0
        let goldmax = context.GoldMax != null ? context.GoldMax : App.Params.GoldMax
        let goldkeep = context.GoldKeep != null ? context.GoldKeep : App.Params.GoldKeep
        if (num < goldkeep) {
            return function () {
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocBank),
                    App.Commands.NewDoCommand("qu " + Math.floor(((goldmax + goldkeep) / 2 - num)) + " gold;i;score"),
                    App.NewSyncCommand(),
                    App.Commands.NewWaitCommand(1000),
                )
                App.Next()
            }
        }
        return null
    }))
    //注册存silver的准备
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
    //注册存coin的准备
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
    //注册买食物的准备
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
    //注册买水的准备
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
    //注册买放弃exp的准备(不在common里)
    App.Proposals.Register("exp", App.Proposals.NewProposal(function (proposals, context, exclude) {
        let maxexp = App.Core.GetMaxExp()
        if (maxexp > 0 && App.Data.Player.HP["经验"] > maxexp) {
            let skill = App.Core.GetMaxSkillLevel()
            let safelevel = skill ? (skill["等级"] - 3) : 0
            if ((safelevel * safelevel * safelevel / 10) > (maxexp + 1000)) {
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
    //注册买债券的准备
    App.Proposals.Register("bond", App.Proposals.NewProposal(function (proposals, context, exclude) {
        if (App.Data.Player.Score["存款"] > 80000) {
            return function () {
                App.Commands.PushCommands(
                    $.To(App.Params.LocBank),
                    $.Nobusy(),
                    $.Do("qu 1000 cash"),
                    $.Nobusy(),
                    $.Do("bond 1000 cash;score"),
                    $.Nobusy(),
                )
                App.Next()
            }
        }
        return null
    }))
    //注册赎回债权的准备
    App.Proposals.Register("refund", App.Proposals.NewProposal(function (proposals, context, exclude) {
        if (App.Data.Player.Score["存款"] < 5000 && App.Data.Player.Score["债券"] > 0) {
            return function () {
                App.Commands.PushCommands(
                    $.To(App.Params.LocBank),
                    $.Nobusy(),
                    $.Do("refund 1"),
                    $.Nobusy(),
                    $.Do("cun 1000 cash;score"),
                    $.Nobusy(),
                )
                App.Next()
            }
        }
        return null
    }))
    //注册通用的准备组
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
        "tuna",
        "dispel",
        "assets",
        "refund",
        "bond",
        "item",
        "repair",
        "dropwp",
        "summon",
    )
    App.Proposals.Register("", common)
    App.Proposals.Register("common", common)
    //注册通用带学习的准备组
    App.Proposals.Register("commonWithStudy", App.Proposals.NewProposalGroup("common", "study", "jiqu"))
    //注册通用带学习和放弃经验的准备组
    App.Proposals.Register("commonWithExp", App.Proposals.NewProposalGroup("common", "exp", "study", "jiqu"))
    //注册准备指令
    App.UserQueue.UserQueue.RegisterCommand("#prepare", function (uq, data) {
        uq.Commands.Append(
            App.NewPrepareCommand(data),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })

})(App)