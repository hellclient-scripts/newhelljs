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
    let DefaultOnHUD = () => {
        return null
    }
    let DefaultOnSummary = () => {
        return null
    }
    let DefaultOnReport = () => {
        return null
    }
    let DefaultOnStart = (quests) => {

    }
    let DefaultOnStop = (quests) => {

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
        Start = null
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
        Param = ""
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
        #nextcommand = null
        Position = null
        Commands = null
        Conditions = null
        Queue = []
        Remain = []
        Delay = 1000
        Stopped = true
        Parser = module.DefaultParser
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
            if (quests.length) {
                this.Stopped = false
                this.Queue = quests
                this.Remain = [...this.Queue]
                this.Commands.Push().WithReadyCommand(this.#nextcommand).WithFailCommand(this.#nextcommand)
            }
            this.OnStart(this)
            this.Commands.Next()
        }
        Restart() {
            this.Remain = [...this.Queue]
            this.Commands.Push().WithReadyCommand(this.#nextcommand).WithFailCommand(this.#nextcommand)
            this.Commands.Next()
        }
        Next() {
            if (this.Stopped) {
                this.Queue = []
                this.OnStop(this)
                this.Commands.Next()
                return
            }
            this.Position.StartNewTerm()
            while (this.Remain.length) {
                let r = this.Remain.shift()
                if (this.#registered[r.ID] && !this.#registered[r.ID].InCooldown() && r.Checker()) {
                    this.Commands.PushCommands(
                        this.Commands.NewFunctionCommand(() => {
                            let q = this.#registered[r.ID]
                            if (q == null) {
                                throw new Error("Quest " + r.ID + " not found")
                            }
                            q.Start(r.Data)
                        }),
                        this.Commands.NewFunctionCommand(() => {
                            this.Loop()
                        })
                    )
                    App.Next()
                    return
                }
            }
            this.Loop()
        }
        Loop() {
            this.Remain = [...this.Queue]
            this.Commands.PushCommands(
                this.Commands.NewWaitCommand(this.Delay),
                this.#nextcommand,
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
    return module
})