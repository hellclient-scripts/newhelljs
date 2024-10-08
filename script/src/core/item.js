(function (app) {
    let objectModule = app.RequireModule("helllibjs/object/object.js")

    App.Core.Item = {}
    App.Data.Item = {}
    App.Data.Item.List = new objectModule.List()
    App.Data.Item.Weight = 0
    App.Data.Item.Count = 0
    App.Core.Item.NoItem=function(event){
        App.Data.Item = {}
        App.Data.Item.List = new objectModule.List()
        App.Data.Item.Weight = 0
        App.Data.Item.Count = 0
    }
    App.BindEvent("core.noitem", App.Core.Item.NoItem)
    App.Core.Item.OnItem = function (event) {
        event.Context.Propose("", function () {
            App.Data.Item = {}
            App.Data.Item.List = new objectModule.List()
            App.Data.Item.Weight = event.Data.Wildcards["0"] - 0
            App.Data.Item.Count = 0
            PlanOnItem.Execute()
        })
    }
    App.BindEvent("core.item", App.Core.Item.OnItem)
    let matcheritem = /^(  |□|○)(.+)\(([^\(\)]+)\)$/
    let matcherend = /^目前携带了(.+)件物品。$/
    let PlanOnItem = new app.Plan(
        App.Positions.Connect,
        function (task) {
            task.NewTrigger(matcheritem, function (task, result, event) {
                let item=new objectModule.Object(result[2],result[3],app.History.CurrentOutput)
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
                App.Data.Item.List.Append(item)
                return true
            })
            task.NewTrigger(matcherend, function (task, result, event) {
                App.Data.Item.Count=objectModule.CNumber.ParseNumber(result[1])
            })
        },
        function (result) {
        },
    )
})(App)