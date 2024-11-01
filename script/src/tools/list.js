(function (App) {
    let List = {
        To: "",
        ID: "",
        Items: [],
    }
    let matcherItem = /^\(.+\)(\S+)\((.+)\)\s*：每.(.+)(两|文)(.+)\(现货.+\)$/
    let PlanList = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.AddTrigger(matcherItem, (tri, result) => {
                let item = [result[2], result[2], result[1], "buy", List.To, `buy ${result[1]} from ${List.ID}`, result[5] == "黄金" ? App.CNumber.ParseNumber(result[3]) : ""].join("|")
                List.Items.push(item)
                return true
            })
            App.Send(`list ${List.ID}`)
            App.Sync()
        },
        (result) => {
            Note(List.Items.join("\n"))
        }
    )
    App.Tools.List = (to, id) => {
        List = {
            To: to,
            ID: id,
            Items: [],
        }
        $.PushCommands(
            $.To(to),
            $.Nobusy(),
            $.Plan(PlanList),
        )
        $.Next()
    }
})(App)