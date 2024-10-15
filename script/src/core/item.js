(function (App) {
    let objectModule = App.RequireModule("helllibjs/object/object.js")

    App.Core.Item = {}
    App.Data.Item = {}
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
    App.Core.Item.GetMoney = function () {
        if (App.Data.Item.Money == null) {
            App.Data.Item.Money = App.Data.Item.List.FindByName("一千两银票").Sum() * 10 + App.Data.Item.List.FindByName("黄金").Sum()
        }
        return App.Data.Item.Money
    }
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
})(App)