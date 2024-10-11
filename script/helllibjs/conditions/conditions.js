(function (App) {
    let module={}
    module.Parse=function(line){
        let result=[]
        line.split(line,",").forEach(cond => {
            cond=cond.trim()
            if (cond==""){
                return
            }
            let condition=new Condition()
            if (cond[0]=="!"){
                condition.Exclude=true
                cond=cond.slice(1)
            }
            let data=SplitN(cond," ",2)
            condition.Type=data[0]
            condition.Data=data.length>1?data[1]:""
            result.push(condition)
        });
        return result
    }
    class Matcher {
        constructor(id,matcher){
            this.ID=id
            this.Matcher=matcher
        }
        ID = ""
        Match = null
    }
    class Condition {
        Type = ""
        Data = ""
        Exclude = false
    }
    class Conditions {
        #registered = []
        Parse=module.Parse
        NewMatcher(id,matcher){
            return new Matcher(id,matcher)
        }
        NewCondition(){
            return new Condition()
        }
        RegisterMatcher(matcher){
            this.#registered[matcher.ID]=matcher
        }
        Check(...conditions) {
            for (let condition of conditions) {
                let matcher = this.#registered[condition.Type]
                let result = matcher == null ? false : matcher.Match(condition.Data)
                if (condition.Exclude) { result = !result }
                if (!result){
                    return false
                }
            }
            return true
        }
        CheckLine(line){
            return this.Check(this.Parse(line))
        }
        NewChecker(line){
            let conditions=this.Parse(line)
            return ()=>{
                return Conditions.Check(conditions)
            }
        }
    }
    module.Condition=Condition
    module.Conditions=Conditions
    return module
})