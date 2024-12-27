(function (app) {
    let module = {}
    module.Sep = /\|\||\n/
    module.DefaultParser = function (quests, line) {
        let result = []
        let data = line.split(module.Sep)
        data.forEach(q => {
            q = q.trim()
            if (q == null) {
                return
            }
            let r = new RunningQuest()
            let qdata = SplitN(q, ">>", 2)
            let qinfo = qdata.pop().trim()
            if (qdata.length) {
                r.Checker = quests.Conditions.NewChecker(qdata[0])
            }
            let qidparam = SplitN(qinfo, " ", 2)
            let qid = qidparam[0].trim()
            if (qid == "") {
                return
            }
            let qparam = qidparam.length == 1 ? "" : qidparam[1].trim()
            r.ID = qid
            r.Data = qparam
            result.push(r)
        });
        return result
    }
    class Ready {
        constructor(rq, execute, quest) {
            this.RunningQuest = rq
            this.Execute = execute
            this.Quest = quest
        }
        RunningQuest = null
        Quest = null
        Execute = null
    }
    let DefaultOnHUD = () => {
        return null
    }
    let DefaultOnSummary = () => {
        return null
    }
    let DefaultOnReport = () => {
        return null
    }
    let DefaultGetReady = (quest, data) => {
        return () => {
            quest.Start(data)
        }
    }
    let DefaultOnStart = (quests) => {

    }
    let DefaultOnStop = (quests) => {

    }
    let DefaultReadyCreator = (r, exec, q) => {
        return new Ready(r, exec, q)
    }
    class Quest {
        constructor(id) {
            this.ID = id
        }
        InCooldown() {
            return (new Date()).getTime() < this.CooldownTo
        }
        Cooldown(interval) {
            this.CooldownTo = (new Date()).getTime() + (interval ? interval : 0)
        }
        CooldownTo = 0
        ID = ""
        Name = ""
        Desc = ""
        Intro = ""
        Help = ""
        Group = ""
        Start = null
        GetReady = DefaultGetReady
        OnHUD = DefaultOnHUD
        OnSummary = DefaultOnSummary
        OnReport = DefaultOnReport
    }
    let DefaultChecker = function () {
        return true
    }
    class RunningQuest {
        constructor() { }
        ID = ""
        Data = ""
        Checker = DefaultChecker
    }
    class Quests {
        constructor(position, commands, conditions) {
            this.Position = position
            this.Commands = commands
            this.Conditions = conditions
            this.#nextcommand = this.Commands.NewFunctionCommand(() => {
                this.Next()
            })
        }
        OnStart = DefaultOnStart
        OnStop = DefaultOnStop
        Running = null
        #nextcommand = null
        Position = null
        Commands = null
        Conditions = null
        Queue = []
        Delay = 1000
        Stopped = true
        ReadyCreator = DefaultReadyCreator
        Parser = module.DefaultParser
        RegisteredQuests() {
            return this.#registered
        }
        Register = function (quest) {
            this.#registered[quest.ID] = quest
        }
        GetQuest(id) {
            return this.#registered[id]
        }
        Cooldown(id, interval) {
            let q = this.#registered[id]
            q.Cooldown(interval)
        }
        Stop() {
            this.Stopped = true
        }
        IsStopped() {
            return this.Queue == null || this.Queue.length == 0
        }
        StartRunningQuests(quests) {
            this.OnStart(this)
            if (quests.length) {
                this.Stopped = false
                this.Queue = quests
                this.Commands.Push().WithReadyCommand(this.#nextcommand).WithFailCommand(this.#nextcommand)
            }
            this.Commands.Next()
        }
        Restart() {
            this.Commands.Push().WithReadyCommand(this.#nextcommand).WithFailCommand(this.#nextcommand)
            this.Commands.Next()
        }
        GetReady() {
            for (let i in this.Queue) {
                let r = this.Queue[i]
                let q = this.#registered[r.ID]
                if (q == null) {
                    throw new Error("Quest " + r.ID + " not found")
                }
                if (q && !q.InCooldown() && r.Checker()) {
                    let exe = q.GetReady(q, r.Data)
                    if (exe) {
                        return this.ReadyCreator(r, exe, q)
                    }
                }
            }
            return null
        }
        ExecuteReady(ready) {
            if (ready) {
                this.Commands.PushCommands(
                    this.Commands.NewFunctionCommand(() => {
                        this.Running = ready.RunningQuest
                        ready.Execute()
                    }),
                    this.Commands.NewFunctionCommand(() => {
                        this.Loop()
                    })
                )
            }
            App.Next()
        }
        Next() {
            if (this.Stopped) {
                this.Queue = []
                this.Running=null
                this.OnStop(this)
                this.Commands.Next()
                return
            }
            this.Position.StartNewTerm()
            let ready = this.GetReady()
            if (ready) {
                this.ExecuteReady(ready)
                return
            }
            this.Loop()
        }
        Loop() {
            this.Commands.PushCommands(
                this.Commands.NewWaitCommand(this.Delay),
            )
            App.Next()
        }
        StartLine(line) {
            this.StartRunningQuests(this.Parser(this, line))
        }
        NewQuest(id) {
            return new Quest(id)
        }
        #registered = {}
    }
    module.RunningQuest = RunningQuest
    module.Quest = Quest
    module.Quests = Quests
    module.Ready = Ready
    return module
})