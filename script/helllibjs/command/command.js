(function (App) {
    let module = {}
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
        }
        Context = {}
        Name = ""
        Data = null
        OnEvent = null
    }
    class Queue {
        constructor(entrycmd) {
            this.EntryCommand = entrycmd
        }
        Context = {}
        FinishCommand = null
        FailCommand = null
        EntryCommand = null
        Commands = []
        Flush() {
            this.Commands = []
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
            return new Queue(this.EntryCommand).
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
        NeedEntry=false
        Queues = []
        #registeredExecutor = {}
        #registeredOnEvent = {}
        CommandNameFunction = "function"
        CommandNameDo = "do"
        CommandNameWait = "wait"
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
        NewFunctionCommand(fn){
            return this.NewCommand(this.CommandNameFunction,fn)
        }

        NewDoCommand(cmd){
            return this.NewCommand(this.CommandNameDo,cmd)
        }
        NewWaitCommand(delay){
            return this.NewCommand(this.CommandNameWait,delay)
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
            this.NeedEntry=true
        }
        #pop() {
            if (this.Queues.length) {
                this.Queues.pop()
                this.PositionQueue.StartNewTerm()
                this.#enter()
            }
        }
        #push(queue){
            this.Queues.push(queue)
            this.#enter()
        }
        Next() {
            let queue = this.CurrentQueue()
            if (queue) {
                if (this.NeedEntry){
                    this.NeedEntry=false
                    if (queue.EntryCommand){
                        this.Execute(queue.EntryCommand)
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
                    queue.Flush()
                    this.Execute(queue.FailCommand)
                    return
                }
                this.#pop()
            }
        }
        Pop() {
            let queue = this.CurrentQueue()
            if (queue) {
                if (queue.FinishCommand) {
                    queue.Flush()
                    this.Execute(queue.FinishCommand)
                    return
                }
                this.#pop()
                App.Next()
            }
        }
        NewQueue(entrycmd){
            return new Queue(entrycmd)
        }
        Push(queue){
            if (!queue){
                queue=new Queue()
            }
            this.#push(queue)
            return queue
        }
        PushCommands(...cmd){
            let queue=new Queue()
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
            let delay = running.Command.Data - 0
            if (isNaN(delay)) {
                delay = 0
            }
            commands.PositionCommand.Wait(delay, result => {
                commands.Next()
            })
        }
    }

    module.Commands = Commands
    return module
})