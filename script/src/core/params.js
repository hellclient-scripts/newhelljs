(function (App) {
    let actionModule = App.RequireModule("helllibjs/conditions/action.js")
    App.Core.Params = {}
    App.Core.Params.Data = {}
    App.Core.Params.QuestData = {}
    App.Core.Params.Load = () => {
        App.Core.Params.Data = {}
        App.Core.Params.QuestData = {}
        App.LoadVariable("params").forEach(data => {
            let action = actionModule.Parse(data)
            if (action.Command) {
                App.Core.Params.Data[action.Command.slice(1)] = action.Data
            }
        })
        App.NamedParams.SetStringValues(App.Core.Params.Data)
        App.LoadVariable("quest_params").forEach(data => {
            let action = actionModule.Parse(data)
            if (action.Command) {
                App.Core.Params.QuestData[action.Command.slice(1)] = action.Data
            }
        })
        App.QuestNamedParams.SetStringValues(App.Core.Params.QuestData)
    }
    App.Core.Params.Set = (id, val) => {
        let result = []
        let matched = false
        App.LoadVariable("params").forEach(data => {
            let action = actionModule.Parse(data)
            if (action.Command == `#${id}`) {
                if (val) {
                    matched = true
                    result.push(`#${id} ${val}`)
                }
            } else {
                result.push(data)
            }
        })
        if (!matched && val) {
            result.push(`#${id} ${val}`)
        }
        SetVariable("params", result.join("\n"))
        App.ReloadVariable()
    }
    App.Core.Params.SetQuest = (id, val) => {
        let result = []
        let matched = false
        App.LoadVariable("quest_params").forEach(data => {
            let action = actionModule.Parse(data)
            if (action.Command == `#${id}`) {
                if (val) {
                    matched = true
                    result.push(`#${id} ${val}`)
                }
            } else {
                result.push(data)
            }
        })
        if (!matched && val) {
            result.push(`#${id} ${val}`)
        }
        SetVariable("quest_params", result.join("\n"))
        App.ReloadVariable()
    }

    App.Core.Params.Load()
})(App)