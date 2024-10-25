(function (App) {
    let module = {}
    let re = /\|/g
    let DefaultSpliter = function (str) {
        return str.split(re)
    }
    module.Wait = function (uq, data) {
        uq.Commands.Append(
            uq.Commands.NewWaitCommand(data - 0),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    }
    module.Loop = function (uq, data) {
        uq.Remain = [...uq.All]
        uq.Commands.Append(
            uq.Commands.NewWaitCommand(1000),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    }
    module.Do = function (uq, data) {
        uq.Commands.Append(
            uq.Commands.NewDoCommand(data),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    }
    class QueueItem {
        constructor(command, data) {
            this.Data = data
            this.Command = command
        }
        Command = null
        Data = ""
    }
    class UserQueue {
        All = []
        Remain = []
        constructor(commands) {
            this.Commands = commands
        }
        Commands = null
        Stopped = false
        CommandPrefix = "#"
        Spliter = DefaultSpliter
        #registerCommands = {}
        ListCommand() {
            return Object.keys(this.#registerCommands)
        }
        RegisterCommand(name, fn) {
            this.#registerCommands[name] = fn
        }
        Exec(str) {
            this.Stopped = false
            let data = this.Spliter(str)
            this.All = []
            data.forEach(text => {
                if (text.startsWith(this.CommandPrefix)) {
                    let result = SplitN(text, " ", 2)
                    let cmd = this.#registerCommands[result[0]]
                    if (cmd) {
                        this.All.push(new QueueItem(cmd, text.slice(result[0].length).trim()))
                        return
                    }
                }
                this.All.push(new QueueItem(module.Do, text))
            });
            this.Remain = [...this.All]
            this.Commands.Push().WithFailCommand(
                this.Commands.NewFunctionCommand(() => {
                    this.Next()
                }))
            this.Next()
        }
        Stop() {
            this.Stopped = true
        }
        Next() {
            if (!this.Stopped) {
                if (this.Remain.length) {
                    let item = this.Remain.shift()
                    this.Commands.Append(
                        this.Commands.NewFunctionCommand(() => {
                            item.Command(this, item.Data)
                        })
                    )
                } else {
                    this.Stopped = true
                }
            }
            this.Commands.Next()
        }
    }
    module.UserQueue = UserQueue
    return module
})