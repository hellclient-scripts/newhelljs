(function (App) {
    let combatModule = App.RequireModule("helllibjs/combat/combat.js")
    let actionModule = App.RequireModule("helllibjs/conditions/action.js")

    App.Core.Combat = {}
    class Block {
        Name = ""
        Conditions = []
        Actions = []
    }
    class Option {
        constructor(quest) {
            this.Quest = quest
        }
        Quest = ""
        Tags = {}
        Command = ""
        Plan = null
        KillInGroup = false
        WithKillInGroup(val) {
            this.KillInGroup = val
            return this
        }
        WithTags(...tags) {
            tags.forEach(tag => {
                this.Tags[tag] = true
            })
            return this
        }
        WithCommand(cmd) {
            this.Command = cmd
            return this
        }
        WithPlan(plan) {
            this.Plan = plan
            return this
        }
    }
    App.Core.Combat.Actions = null
    App.Core.Combat.Blocks = []
    App.NewCombat = function (quest) {
        return new Option(quest)
    }
    let reDamage = /^【伤害统计】:你对(.+)的气血造成(.+)点伤害! $/
    App.Core.Combat.Fail = false
    let Plan = new App.Plan(App.Positions["Combat"],
        function (task) {
            App.Core.Combat.Fail = false
            App.Combat.Position.Term.Set("core.combat.damage", 0)
            task.AddTrigger("一边打架一边驯兽？你真是活腻了！", function () {
                OmitOutput()
                return true
            })
            task.AddCatcher("core.needneili", () => {
                if (App.Core.Weapon.Touch) {
                    App.Send(`touch ${App.Core.Weapon.Touch}`)
                }
                return true
            })
            task.AddTrigger(reDamage, function (trigger, result) {
                let dam = result[2] - 0
                App.Combat.Position.Term.Set("core.combat.damage", App.Combat.Position.Term.Get("core.combat.damage") + dam)
                return true
            })
            task.AddTrigger("你现在没有力气战斗了。", (tri, result) => {
                App.Core.Combat.Fail = true
                return true
            })
            task.AddTrigger("你的驭兽术还不纯熟，无法让野兽跟随你！", () => { OmitOutput() })
            task.AddTrigger("已经有野兽跟着你了！", () => { OmitOutput() })
            task.AddTrigger("你要让什么野兽跟随你？", () => { OmitOutput() })
            task.AddCatcher("disconnected").WithName("Disconnect")
            if (App.Combat.Data.Plan) {
                App.Combat.Data.Plan.Execute()
            }
        }, function (result) {
            if (result.Name == "Disconnect") {
                return
            }
            App.Combat.Stop(App.Core.Combat.Fail ? "fail" : "")
        })
    App.Combat = new combatModule.Combat(App.Positions["Combat"], Plan)
    let checkCombatCmd = "come"
    App.Core.Combat.Perform = function () {
        App.Core.Combat.FilterActions("#send", "#wpon", "wpoff").forEach(action => {
            switch (action.Command) {
                case "#send":
                    App.Send(App.Core.Combat.ReplaceCommand(action.Data))
                    return
                case "#wpoff":
                case "#wpon":
                    App.Send(action.Command + action.Data ? (" " + action.Data) : "")
                    return
            }
        })
    }
    App.Combat.Ticker = function (combat) {
        let msg = ""
        msg = msg + Math.floor(combat.Duration() / 1000) + "秒 "
        msg = msg + (combat.Data.Quest)
        msg = msg + "[" + Object.keys(combat.Data.Tags).join(",") + "]"
        Note(msg)
        App.Core.Combat.Perform()
        App.Send(checkCombatCmd)
    }
    App.Combat.OnStop = function (combat, reason) {
        if (reason == "fail") {
            App.Send("yun recover;yun regenerate;hp;i")
            App.Fail()
            return
        }
        let duration = Math.floor(combat.Duration() / 1000)
        let msg = "战斗结束 共" + duration + "秒。"
        let dam = App.Combat.Position.Term.Get("core.combat.damage")
        if (dam) {
            msg += "总伤 " + dam + " 秒伤 " + (dam / duration).toFixed(2)
        }
        Note(msg)
        App.Send("yun recover;yun regenerate;hp;i")
        App.Commands.Execute(App.NewSyncCommand())
    }
    App.Core.Combat.Kill = function (id, data) {
        data = (data || App.NewCombat("")).WithTags("kill")
        App.Core.Combat.DoCombat(id, data)
    }
    App.Core.Combat.CounterAttack = function (id, data) {
        data = (data || App.NewCombat("")).WithTags("counterattack")
        App.Core.Combat.DoCombat(id, data)

    }
    App.Core.Combat.ReplaceCommand = (data) => {
        data = data.replaceAll("$1", App.Combat.Target)
        data = data.replaceAll("$wpon", App.Core.Weapon.OnCommand())
        data = data.replaceAll("$wpoff", App.Core.Weapon.OffCommand())
        return data
    }
    let pickActions = () => {
        if (App.Core.Combat.Actions == null) {
            App.Core.Combat.Actions = []
        }
        for (var i in App.Core.Combat.Blocks) {
            let block = App.Core.Combat.Blocks[i]
            for (var conditionindex in block.Conditions) {
                if (App.Quests.Conditions.Check(block.Conditions[conditionindex])) {
                    Note(`采用战术[${block.Name}]`)
                    App.Core.Combat.Actions = block.Actions
                    return
                }
            }
        }
    }
    App.Core.Combat.DoCombat = function (id, data) {
        App.Combat.Target = id
        App.Combat.Data = data
        App.Core.Combat.Actions = null
        pickActions()
        App.Core.Combat.FilterActions("#before").forEach(action => {
            App.Send(App.Core.Combat.ReplaceCommand(action.Data))
        })
        let commands = []
        if (data.Command) {
            commands.push(data.Command)
        } else if (id) {
            commands.push("kill " + id)
        }
        App.Core.Combat.FilterActions("#start").forEach(action => {
            commands.push(App.Core.Combat.ReplaceCommand(action.Data))
        })
        App.Send(commands.join(";"), data.KillInGroup)
        App.Send(checkCombatCmd)
        App.Combat.Start(id, data)
    }
    App.NewKillCommand = function (id, data) {
        return App.Commands.NewCommand("kill", { ID: id, Data: data })
    }
    App.Commands.RegisterExecutor("kill", function (commands, running) {
        running.OnStart = function (arg) {
            App.Core.Combat.Kill(running.Command.Data.ID, running.Command.Data.Data)
        }
    })
    App.UserQueue.UserQueue.RegisterCommand("#kill", function (uq, data) {
        uq.Commands.Append(
            App.NewKillCommand(data, new Option("userqueue")),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })
    App.NewCounterAttackCommand = function (id, data) {
        return App.Commands.NewCommand("counterattack", { ID: id, Data: data })
    }
    App.Commands.RegisterExecutor("counterattack", function (commands, running) {
        running.OnStart = function (arg) {
            App.Core.Combat.CounterAttack(running.Command.Data.ID, running.Command.Data.Data)
        }
    })
    App.Core.Combat.FilterActions = function (...commands) {
        if (App.Core.Combat.Actions == null) {
            pickActions()
        }
        let filter = {}
        commands.forEach(c => { filter[c] = true })
        let result = []
        App.Core.Combat.Actions.forEach(action => {
            if (App.Quests.Conditions.Check(action.Conditions)) {
                if (filter[action.Command]) {
                    result.push(action)
                }
            }
        })
        return result
    }
    App.Core.Combat.Load = function () {
        App.Core.Combat.Actions = null
        let currentBlock = new Block()
        currentBlock.Conditions.push(App.Quests.Conditions.Always)
        App.Core.Combat.Blocks.push(currentBlock)
        App.LoadVariable("combat").forEach(data => {
            let action = actionModule.Parse(data)
            switch (action.Command) {
                case "#block":
                    currentBlock = new Block()
                    currentBlock.Name = action.Data
                    currentBlock.Conditions = [App.Quests.Conditions.Never]
                    App.Core.Combat.Blocks.unshift(currentBlock)
                    return
                case "#apply":
                    currentBlock.Conditions.push(action.Conditions)
                    return
                case "":
                    action.Command = "#send"
                    break
            }
            currentBlock.Actions.push(action)
            // App.Core.Combat.Actions.push(action)
        })
    }
    App.Core.Combat.Load()
    App.Quests.Conditions.RegisterMatcher(App.Quests.Conditions.NewMatcher("ctype", function (data, target) {
        return App.Combat.Data && App.Combat.Data.Quest == data.trim()
    }))
    App.Quests.Conditions.RegisterMatcher(App.Quests.Conditions.NewMatcher("ctag", function (data, target) {
        return App.Combat.Data && App.Combat.Data.Tags[data.trim()]
    }))
})(App)