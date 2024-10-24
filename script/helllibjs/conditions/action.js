(function (App) {
    let conditionModule = App.RequireModule("helllibjs/conditions/conditions.js")
    let module = {}
    module.Parse = function (line) {
        let action = new Action(line)
        let data = SplitN(line, ":", 2)
        let param
        if (data.length == 1) {
            param = line
        } else {
            action.Strategy = data[0]
            param = data[1]
        }
        data = SplitN(param, ">", 2)
        let cmd = ""
        if (data.length == 1) {
            cmd = param
        } else {
            action.ConditionsLine = data[0].trim()
            action.Conditions = conditionModule.Parse(action.ConditionsLine)
            cmd = data[1]
        }
        if (cmd) {
            if (cmd[0] == "#") {
                data = SplitN(cmd, " ", 2)
                let command = SplitN(data[0], ".", 2)
                action.Command = command[0]
                if (command.length > 1) {
                    action.Param = command[1]
                }
                if (data.length > 1) {
                    action.Data = data[1]
                }
            } else {
                action.Data = cmd
            }
        }
        return action
    }
    class Action {
        constructor(line) {
            this.Line = line
        }
        ParseNumber(sep) {
            sep = sep || "*"
            let data = SplitN(this.Data, sep, 2)
            if (data.length == 2) {
                this.Data = data[0].trim()
                this.Number = data[1] ? data[1].trim() : ""
            }
            return this
        }
        ParseName(sep) {
            sep = sep || "="
            let data = SplitN(this.Data, sep, 2)
            this.Name =data[0].trim()
            this.Data=data[1]?data[1]:""
            return this
        }
        Strategy = ""
        Conditions = []
        ConditionsLine = ""
        Command = ""
        Param = ""
        Data = ""
        Line = ""
        Number = ""
        Name = ""
        UserData = null
    }
    module.Action = Action
    return module
})