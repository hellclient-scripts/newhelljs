(function (App) {
    let module = {}
    let actionModule = App.RequireModule("helllibjs/conditions/action.js")
    module.DefaultParse=function(data,matcher){
        let action=actionModule.Parse(data)
        action.ParseNumber().ParseName()
        action.UserData=[]
        action.Data.split(",").forEach(data=>{
            action.UserData.push(data.trim())
        })
        let rule=new Rule(matcher,action)
        return rule

    }
    class Result {
        constructor(command, asset) {
            this.Command = command
            this.Asset = asset
        }
        Command = null
        Asset = null
    }
    class Rule {
        constructor(match, data) {
            this.Match = match
            this.Data = data
        }
        Data = null
        Match = null
    }
    class Evaluation {
        Data = {}
    }
    class Asset {
        constructor(item) {
            this.Item = item
        }
        Item = null
        Evaluation = new Evaluation()
    }
    class Evaluator {
        constructor(fn) {
            this.Evaluate = fn
        }
        Evaluate = null
    }
    class Assets {
        #evaluators = []
        NewRule = function (match, data) {
            return new Rule(match, data)
        }
        NewEvaluator = function (fn) {
            return new Evaluator(fn)
        }
        AddEvaluator(evaluator) {
            this.#evaluators.push(evaluator)
        }
        Evaluate(item) {
            let asset = new Asset(item)
            this.#evaluators.forEach(e => {
                e.Evaluate(asset)
            })
            return asset
        }
        Maintain(item, ...rulelists) {
            let asset = this.Evaluate(item)
            for (let rulelist of rulelists) {
                for (let rule of rulelist) {
                    let command = rule.Match(rule, asset)
                    if (command!=null) {
                        return new Result(command, asset)
                    }
                }
            }
            return null
        }
        Parse=module.DefaultParse
    }
    module.Assets = Assets
    return module
})