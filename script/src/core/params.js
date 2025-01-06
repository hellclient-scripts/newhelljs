//参数加载模块
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
    //设置参数函数，第一个参数为变量名,第二个参数为变量值
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
    //设置任务参数函数，第一个参数为变量名,第二个参数为变量值
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
    //加载参数
    App.Core.Params.Load()
})(App)