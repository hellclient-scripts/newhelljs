(function (App) {
    let module = {}
    let DefaultExecute = function (check) {
        return check.Command
    }
    class Check {
        constructor(id) {
            this.#id = id
        }
        #id = ""
        Interval = 0
        #last = 0
        Execute = DefaultExecute
        Command = null
        WithExecute(fn) {
            this.Execute = fn ? fn : DefaultExecute
        }
        ID() {
            return this.#id
        }
        WithCommand(cmd) {
            if (typeof (cmd) != "function") {
                this.Command = function () { App.Send(cmd) }
            } else {
                this.Command = cmd
            }
            return this
        }
        WithInterval(interval) {
            interval = interval - 0
            if (isNaN(interval)) {
                interval = 0
            }
            this.Interval = interval
            return this
        }
        InCooldown() {
            return (new Date()).getTime() - this.Interval < this.#last
        }
        Reset() {
            this.#last = (new Date()).getTime()
        }
        Force() {
            this.#last = 0
        }
    }
    class Checker {
        #items = {}
        Register(id, command, interval) {
            let check = new Check(id).WithCommand(command).WithInterval(interval)
            this.#items[id] = check
            return check
        }
        GetCheck(id) {
            return this.#items[id]
        }
        Check() {
            let result = []
            for (let id in this.#items) {
                let item = this.#items[id]
                if (!item.InCooldown()) {
                    let cmd = item.Execute(item)
                    if (cmd) {
                        result.push(cmd)
                    }
                }
            }
            return result
        }
    }
    module.Checker = Checker
    return module
})