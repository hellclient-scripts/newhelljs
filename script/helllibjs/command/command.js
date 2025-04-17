(function (App) {
    let module = {}
    module.Debug = false;
    class RunningCommand {
        constructor(cmd) {
            this.Command = cmd
            this.onEvent = Command.OnEvent
        }
        OnEvent = null
        Command = null
        OnStart = null
    }
    class Command {
        constructor(name, data) {
            this.Name = name
            this.Data = data
            if (module.Debug) {
                this.Stack = (new Error()).stack
            }
        }
        Context = {}
        Name = ""
        Stack = ""
        Data = null
        OnEvent = null
    }
    class Queue {
        constructor(readycmd) {
            this.ReadyCommand = readycmd
        }
        Context = {}
        FinishCommand = null
        FailCommand = null
        ReadyCommand = null
        Commands = []
        Flush() {
            this.Commands = []
            this.ReadyCommand = null
            this.FinishCommand = null
            this.FailCommand = null
            return this
        }
        WithFinishCommand(cmd) {
            this.FinishCommand = cmd
            return this
        }
        WithFailCommand(cmd) {
            this.FailCommand = cmd
            return this
        }
        WithReadyCommand(cmd) {
            this.ReadyCommand = cmd
            return this
        }
        WithContext(ctx) {
            this.Context = ctx
            return this
        }
        Append(...commands) {
            this.Commands = this.Commands.concat(commands)
            return this
        }
        Insert(...commands) {
            this.Commands = commands.concat(this.Commands)
            return this
        }
        Clone() {
            return new Queue(this.ReadyCommand).
                WithFinishCommand(this.FinishCommand).
                WithFailCommand(this.FailCommand).
                WithContext(this.Context)
        }
    }
    class Commands {
        constructor() { }
        EmptyCommand = null
        PositionCommand = null
        PositionQueue = null
        Current = null
        NeedReady = false
        Queues = []
        #registeredExecutor = {}
        #registeredOnEvent = {}
        CommandNameFunction = "function"
        CommandNameDo = "do"
        CommandNameWait = "wait"
        CommandNamePlan = "plan"
        OnEvent(event) {
            if (this.Current) {
                let onEvent = this.Current.Command.OnEvent
                if (typeof (onEvent) == "function") {
                    return onEvent(event)
                }
                if (!onEvent) {
                    onEvent = ""
                }
                let handler = this.#registeredOnEvent[onEvent]
                if (!handler) {
                    handler = this.#registeredOnEvent[""]
                }
                if (handler) {
                    return handler(event)
                }
            }
        }
        CurrentQueue(autocreate) {
            if (this.Queues.length == 0) {
                if (!autocreate) {
                    return null
                }
                this.#push(new Queue())
            }
            return this.Queues[this.Queues.length - 1]
        }
        NewCommand(name, data) {
            if (this.#registeredExecutor[name] == null) {
                throw new Error("Command executor[" + name + "] not registered")
            }
            return new Command(name, data)
        }
        NewFunctionCommand(fn) {
            return this.NewCommand(this.CommandNameFunction, fn)
        }

        NewDoCommand(cmd) {
            return this.NewCommand(this.CommandNameDo, cmd)
        }
        NewWaitCommand(delay, offset) {
            return this.NewCommand(this.CommandNameWait, { Delay: delay, Offset: offset })
        }
        NewPlanCommand(plan) {
            return this.NewCommand(this.CommandNamePlan, plan)
        }
        RegisterExecutor(name, executor) {
            this.#registeredExecutor[name] = executor
        }
        Execute(command, arg) {
            let executor = this.#registeredExecutor[command.Name]
            if (!executor) {
                throw "Command executor[" + command.Name + "] not registered"
            }
            this.PositionCommand.StartNewTerm()
            let running = new RunningCommand(command)
            this.Current = command
            executor(this, running)
            if (running.OnStart) {
                running.OnStart(arg)
            }
        }
        Insert(...commands) {
            this.CurrentQueue(true).Insert(...commands)
        }
        Append(...commands) {
            this.CurrentQueue(true).Append(...commands)
        }
        #enter() {
            this.NeedReady = true
        }
        #pop() {
            if (this.Queues.length) {
                this.Queues.pop()
                this.PositionQueue.StartNewTerm()
                this.#enter()
            }
        }
        #push(queue) {
            this.Queues.push(queue)
            this.#enter()
        }
        Discard() {
            this.Queues = []
        }
        Next() {
            let queue = this.CurrentQueue()
            if (queue) {
                if (this.NeedReady) {
                    this.NeedReady = false
                    if (queue.ReadyCommand) {
                        this.Execute(queue.ReadyCommand)
                        return
                    }
                }
                if (queue.Commands.length) {
                    this.Execute(queue.Commands.shift())
                    return
                }
                this.Pop()
            } else {
                this.Execute(this.EmptyCommand)
            }
        }
        Fail() {
            let queue = this.CurrentQueue()
            if (queue) {
                if (queue.FailCommand) {
                    let cmd = queue.FailCommand
                    queue.Flush()
                    this.Execute(cmd)
                    return
                }
                this.#pop()
                this.Next()
            }
        }
        Pop() {
            let queue = this.CurrentQueue()
            if (queue) {
                if (queue.FinishCommand) {
                    let cmd = queue.FinishCommand
                    queue.Flush()
                    this.Execute(cmd)
                    return
                }
                this.#pop()
                this.Next()
            }
        }
        Drop() {
            let queue = this.CurrentQueue()
            if (queue) {
                this.#pop()
            }
        }
        NewQueue(readycmd) {
            return new Queue(readycmd)
        }
        Push(queue) {
            if (!queue) {
                queue = new Queue()
            }
            this.#push(queue)
            return queue
        }
        PushCommands(...cmd) {
            let queue = new Queue()
            queue.Append(...cmd)
            this.#push(queue)
            return queue
        }
        Rollback(snap) {
            this.Queues = snap.Queues
            let queue = this.CurrentQueue()
            if (queue) {
                this.#enter()
            }
        }
        Snap(arg) {
            let result = {}
            result.Arg = arg
            result.Queues = []
            this.Queues.forEach(q => {
                result.Queues.push(q.Clone())
            })
            if (result.Queues.length == 0) {
                result.Queues.push(new Queue())
            }
            if (this.Current) {
                result.Queues[result.Queues.length - 1].push(this.Current.Command)
            }
            return result
        }
        InitCommon() {
            if (this.CommandNameFunction) {
                this.RegisterExecutor(this.CommandNameFunction, module.ExecutorFunction)
            }
            if (this.CommandNameDo) {
                this.RegisterExecutor(this.CommandNameDo, module.ExecutorDo)
            }
            if (this.CommandNameWait) {
                this.RegisterExecutor(this.CommandNameWait, module.ExecutorWait)
            }
            if (this.CommandNamePlan) {
                this.RegisterExecutor(this.CommandNamePlan, module.ExecutorPlan)
            }
        }
    }
    module.ExecutorFunction = function (commands, running) {
        running.OnStart = function (arg) {
            running.Command.Data()
        }
    }
    module.ExecutorDo = function (commands, running) {
        running.OnStart = function (arg) {
            App.Send(running.Command.Data)
            commands.Next()
        }
    }
    module.ExecutorWait = function (commands, running) {
        running.OnStart = function (arg) {
            let delay = running.Command.Data.Delay - 0
            if (isNaN(delay)) {
                delay = 0
            }
            let offset = running.Command.Data.Offset - 0
            if (isNaN(offset)) {
                offset = 0
            }
            commands.PositionCommand.Wait(delay, offset, result => {
                commands.Next()
            })
        }
    }
    module.ExecutorPlan = function (commands, running) {
        running.OnStart = function (arg) {
            running.Command.Data.Execute()
        }
    }
    module.Commands = Commands
    return module
})