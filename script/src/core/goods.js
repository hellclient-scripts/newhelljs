(function (App) {
    let goodsModule=App.RequireModule("helllibjs/goods/goods.js")
    App.Core.Goods={}
    App.Goods=new goodsModule.Goods()
    let file="data/items.txt"
    Note("加载物品文件"+file)
    ReadLines(file).forEach(line => {
        line=line.trim()
        if (line && !line.startsWith("//")){
            App.Goods.LoadCSV(line,'|')
        }
    });
    let buyer=function(good){
        App.PushCommands(
            App.Move.NewToCommand(good.From),
            App.Commands.NewDoCommand(good.Command),
            App.Commands.NewDoCommand("i"),
            App.NewSyncCommand(),
            App.Commands.NewWaitCommand(1000),
        )
        App.Next()
    }
    App.Goods.RegisterBuyer("",buyer)
    App.Goods.RegisterBuyer("buy",buyer)
    App.Commands.RegisterExecutor("buy", function (commands, running) {
        running.OnStart = function (arg) {
            App.Goods.Buy(running.Command.Data)
        }
    })
    App.Goods.NewBuyCommand=function(key){
        return App.Commands.NewCommand("buy",key)
    }
})(App)