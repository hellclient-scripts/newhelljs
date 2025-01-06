//道具模块
(function (App) {
    let objectModule = App.RequireModule("helllibjs/object/object.js")

    App.Core.Item = {}
    App.Data.Item = {}
    App.Data.QiankunBag = new objectModule.List()
    App.Data.Item.List = new objectModule.List()
    App.Data.Item.Weight = 0
    App.Data.Item.Count = 0
    App.Data.Item.Money = null
    App.Core.Item.NoItem = function (event) {
        App.Data.Item = {}
        App.Data.Item.List = new objectModule.List()
        App.Data.Item.Weight = 0
        App.Data.Item.Count = 0
        App.Data.Item.Money = null
    }
    //计算现金
    App.Core.Item.GetMoney = function () {
        if (App.Data.Item.Money == null) {
            App.Data.Item.Money = App.Data.Item.List.FindByName("一千两银票").Sum() * 10 + App.Data.Item.List.FindByName("黄金").Sum()
        }
        return App.Data.Item.Money
    }
    //定义检查器i
    let checkerI = App.Checker.Register("i", "i", 30000)

    App.BindEvent("core.noitem", App.Core.Item.NoItem)
    App.Core.Item.OnItem = function (event) {
        checkerI.Reset()
        event.Context.Propose(function () {
            App.Data.Item = {}
            App.Data.Item.List = new objectModule.List()
            App.Data.Item.Weight = event.Data.Wildcards["0"] - 0
            App.Data.Item.Count = 0
            App.Data.Item.Money = null
            PlanOnItem.Execute()
        })
    }
    App.BindEvent("core.item", App.Core.Item.OnItem)
    let matcheritem = /^(  |□|○)(.+)\(([^\(\)]+)\)$/
    let matcherend = /^目前携带了(.+)件物品。$/
    //道具统计的计划
    let PlanOnItem = new App.Plan(
        App.Positions.Connect,
        function (task) {
            let data = {}
            task.AddTrigger(matcheritem, function (task, result, event) {
                let item = new objectModule.Object(result[2], result[3], App.History.CurrentOutput)
                let index = data[item.IDLower]
                if (index == null) {
                    index = 1
                }
                switch (result[1]) {
                    case "□":
                        item.Mode = 1
                        break
                    case "○":
                        item.Mode = 2
                        break
                    default:
                        item.Mode = 0
                }
                item.WithKey(item.IDLower + " " + index)
                App.Data.Item.List.Append(item)
                data[item.IDLower] = index + 1
                return true
            })
            task.AddTrigger(matcherend, function (task, result, event) {
                App.Data.Item.Count = objectModule.CNumber.ParseNumber(result[1])
            })
        },
        function (result) {
            checkerI.Reset()
        },
    )
    //检查乾坤袋
    App.Core.Item.CheckQiankunBag = function () {
        if (App.Data.Item.List.FindByID("qiankun bag").First()) {
            App.Send("l qiankun bag of me")
        }
        checkerQiankunBag.Reset()
    }
    //qianunbag的检查
    let checkerQiankunBag = App.Checker.Register("qiankunbag", App.Core.Item.CheckQiankunBag, 600000)
    //[ 1]  丹玉磨(danyu mo)                          1          
    let matcherQiankunBag = /^\[\s*(\d+)\]\s*(\S+)\((.+)\)\s*(\d+)\s*$/
    //统计乾坤袋的计划
    let PlanQiankunBag = new App.Plan(App.Positions.Connect,
        function (task) {
            let mode = 0
            task.AddTrigger("目前没有存放任何物品在如意乾坤袋里。")
            task.AddTrigger(matcherQiankunBag, (tri, result) => {
                let obj = App.Data.QiankunBag.NewObject(result[2], result[3]).WithKey(result[1])
                let data = obj.GetData(true)
                data.Name = result[2]
                data.Count = result[4] - 0
                App.Data.QiankunBag.Append(obj)
                return true
            })
            task.AddTrigger("----------------------------------------------------", () => {
                mode++
                return mode == 1
            })
        },
        function (result) {
            checkerQiankunBag.Reset()
        }
    )
    App.Core.Item.OnQiankunBag = function (event) {
        event.Context.Propose(function () {
            App.Data.QiankunBag = new objectModule.List()
            PlanQiankunBag.Execute()
        })
    }
    App.BindEvent("core.qiankunbag", App.Core.Item.OnQiankunBag)
    App.BindEvent("core.qiankunbagchange", () => {
        checkerQiankunBag.Force()
    })
})(App)