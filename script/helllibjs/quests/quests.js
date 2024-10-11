(function (app) {
    let module = {}
    module.Sep = /\|\||\n/

    module.DefaultParser = function (quests, line) {
        let result = []
        let data = line.Split(module.Sep)
        data.forEach(q => {
            q = q.trim()
            if (q == null) {
                return
            }
            let r = quests.NewRunningQuest()
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
    class Quest {
        constructor(id) {
            this.ID = id
        }
        InCooldown() {
            return (new Date()) < this.CooldownTo
        }
        CooldownTo = 0
        ID = ""
        Name = ""
        Desc = ""
        Intro = ""
        Help = ""
        Start = null
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
        #nextcommand
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
        Cooldown(id, interval) {
            let q = this.#registered[id]
            q.CooldownTo = (new Date()).getTime() + interval ? interval : 0
        }
        Stop() {
            this.Stopped = true
        }
        StartRunningQuests(quests) {
            if (quests.length) {
                this.Stopped = false
                this.Queue = quests
                this.Remain = [...this.Queue]
                this.Commands.Push(this.#nextcommand).WithFailCommand(this.#nextcommand)
            }
            this.Commands.Next()
        }
        Next() {
            if (this.Stopped){
                this.Commands.Next()
                return
            }
            this.Position.StartNewTerm()
            while(this.Remain.length) {
                let r=this.Remain.shift()
                if (r.Checker.Check()){
                    this.Commands.PushCommands(
                        this.Commands.NewFunctionCommand(function(){
                            let q=this.#registered[r.ID]
                            if (q==null){
                                throw new Error("Quest "+r.ID+" not found")
                            }
                            q.Start(r.Data)
                        })
                    )
                    App.Next()
                    return
                }
            }
            this.Loop()
        }
        Loop(){
            this.Remain=[...this.Queue]
            this.Commands.PushCommands(
                this.Commands.NewWaitCommand(this.Delay),
                this.#nextcommand,
            )
            App.Next()
        }
        StartLine(line) {
            this.StartRunningQuests(this.Parser(line))
        }
        NewQuest(id) {
            return new Quest(id)
        }
        #registered = {}
    }
    module.RunningQuest = RunningQuest
    module.Quest = Quest
    module.Quests=Quests
    return module
})