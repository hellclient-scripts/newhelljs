(function (App) {
    let module = {}
    module.Parse = function (line) {
        let result = []
        line.split(",").forEach(cond => {
            cond = cond.trim()
            if (cond == "") {
                return
            }
            let condition = new Condition()
            if (cond[0] == "!") {
                condition.Exclude = true
                cond = cond.slice(1)
            }
            let data = SplitN(cond, " ", 2)
            condition.Type = data[0]
            condition.Data = data.length > 1 ? data[1] : ""
            result.push(condition)
        });
        return result
    }
    class Matcher {
        constructor(id, match) {
            this.ID = id
            this.Match = match
        }
        ID = ""
        Match = null
    }
    class Condition {
        Type = ""
        Data = ""
        Exclude = false
    }
    let NeverCondition = new Condition()
    NeverCondition.Type = "never"

    class Conditions {
        #registered = []
        Parse = module.Parse
        NewMatcher(id, match) {
            return new Matcher(id, match)
        }
        NewCondition() {
            return new Condition()
        }
        RegisterMatcher(matcher) {
            this.#registered[matcher.ID] = matcher
        }
        Check(conditions, target) {
            for (let condition of conditions) {
                let matcher = this.#registered[condition.Type]
                let result = (matcher == null) ? false : matcher.Match(condition.Data, target)
                if (condition.Exclude) { result = !result }
                if (!result) {
                    return false
                }
            }
            return true
        }
        CheckLine(line, target) {
            return this.Check(this.Parse(line), target)
        }
        NewChecker(line, target) {
            let conditions = this.Parse(line)
            return () => {
                return this.Check(conditions, target)
            }
        }
        Never = [NeverCondition]
        Always = []
    }
    module.Condition = Condition
    module.Conditions = Conditions
    return module
})