(function (App) {
    let goodsModule = App.RequireModule("helllibjs/goods/goods.js")
    let actionModule = App.RequireModule("helllibjs/conditions/action.js")

    App.Core.Goods = {}
    App.Goods = new goodsModule.Goods()
    let file = "data/items.txt"
    Note("加载物品文件" + file)
    ReadLines(file).forEach(line => {
        line = line.trim()
        if (line && !line.startsWith("//")) {
            App.Goods.LoadCSV(line, '|')
        }
    });
    let buyer = function (good) {
        App.PushCommands(
            App.Move.NewToCommand(good.From),
            App.Commands.NewDoCommand(good.Command),
            App.Commands.NewDoCommand("i"),
            App.NewSyncCommand(),
            App.Commands.NewWaitCommand(1000),
        )
        App.Next()
    }
    App.Goods.RegisterBuyer("", buyer)
    App.Goods.RegisterBuyer("buy", buyer)
    App.Commands.RegisterExecutor("buy", function (commands, running) {
        running.OnStart = function (arg) {
            let good = App.Goods.GetGood(running.Command.Data)
            let gold = good ? good.Data : 0
            if (isNaN(gold)) { gold = 0 }
            App.Commands.PushCommands(
                App.NewPrepareMoneyCommand(gold),
                App.Commands.NewFunctionCommand(() => { App.Goods.Buy(running.Command.Data) })
            )
            App.Next()
        }
    })
    App.Goods.NewBuyCommand = function (key) {
        return App.Commands.NewCommand("buy", key)
    }
    let LastEat = 0
    let IntervalEat = 10000
    App.Eat = function (force) {
        let now = (new Date()).getTime()
        if (force || (now - LastEat > IntervalEat)) {
            App.Send(App.Params.FoodCommand)
            App.Send(App.Params.DrinkCommand)
            LastEat = now
        }
    }
    App.BindEvent("core.beforecheck", function (event) {
        App.Eat()
    })

    App.Core.Goods.Items = []
    App.Core.Goods.Load = function () {
        App.Core.Goods.Items = []
        let items = []
        App.Core.Assets.GoodsRules = []
        App.LoadVariable("items").forEach(data => {
            let item = actionModule.Parse(data).ParseNumber()
            if (item.Data) {
                if (item.Command == "") {
                    item.Command = "#buy"
                }
                switch (item.Command) {
                    case "#buy":
                        if (App.Goods.GetGood(item.Data) == null) {
                            Note("物品 " + item.Data + " 未找到。")
                            return
                        }
                        break
                    case "#fetch":
                    case "#qu":
                        break
                    default:
                        PrintSystem(`item变量有未知的道具指令${item.Command}`)
                }
                App.Core.Goods.Items.push(item)
                items.push(item.Data)
            }
        })
        if (items.length) {
            App.Core.Assets.GoodsRules = [App.Core.Assets.ParseRule("#carry " + items.join(","))]
        }
    }
    App.Core.Goods.Load()
    let fetch = (f, item) => {
        let num = item.Param - 0
        if (isNaN(num) || num < 0) {
            num = 1
        }
        if (num > f.GetData().Count) {
            num = f.GetData().Count
        }
        App.Commands.PushCommands(
            App.Commands.NewDoCommand(`fetch ${f.Key} ${num};i;l qiankun bag`),
            App.NewSyncCommand(),
        )
        App.Next()

    }
    App.Proposals.Register("item", App.Proposals.NewProposal(function (proposals, context, exclude) {
        for (item of App.Core.Goods.Items) {
            let num = isNaN(item.Number) ? 1 : (item.Number - 0)
            if (num == 0) {
                num = 1
            }
            switch (item.Command) {
                case "#buy":
                    var count = App.Data.Item.List.FindByID(App.Goods.GetGood(item.Data).ID).Sum()
                    if (count < num) {

                        return function () {
                            App.Commands.PushCommands(
                                App.Goods.NewBuyCommand(item.Data),
                                App.NewNobusyCommand(),
                            )
                            App.Next()
                        }
                    }
                    break
                case "#fetch":
                    var count = App.Data.Item.List.FindByIDLower(item.Data).Sum()
                    if (count < num) {
                        let f = App.Data.QiankunBag.FindByID(item.Data).First()
                        if (f) {
                            return () => {
                                fetch(f, item)
                            }
                        }
                    }
                    break
                case "#qu":
                    var count = App.Data.Item.List.FindByIDLower(item.Data).Sum()
                    if (count < num) {
                        let f = App.Data.QiankunBag.FindByID(item.Data).First()
                        if (f) {
                            return () => {
                                fetch(f, item)
                            }
                        } else {
                            return () => {
                                let num = item.Param - 0
                                if (isNaN(num) || num < 0) {
                                    num = 1
                                }
                                App.Commands.PushCommands(
                                    App.Move.NewToCommand("2682"),
                                    App.Commands.NewDoCommand(`take ${num} ${item.Data};i`),
                                    App.NewNobusyCommand(),
                                )
                                App.Next()

                            }
                        }
                    }
                    break
            }
        }
        return null
    }))

    App.UserQueue.UserQueue.RegisterCommand("#buy", function (uq, data) {
        let item = data.trim()
        if (!item || App.Goods.GetGood(item) == null) {
            PrintSystem("物品 " + data + "无效")
            uq.Next()
            return
        }
        uq.Commands.Append(
            App.Goods.NewBuyCommand(item),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })
})(App)