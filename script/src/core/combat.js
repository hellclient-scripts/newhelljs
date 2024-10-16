(function (App) {
    let combatModule = App.RequireModule("helllibjs/combat/combat.js")
    let actionModule = App.RequireModule("helllibjs/conditions/action.js")

    App.Core.Combat = {}
    class Option {
        constructor(quest) {
            this.Quest = quest
        }
        Quest = ""
        Tags = {}
        Command = ""
        WithTags(...tags) {
            tags.forEach(tag => {
                this.Tags[tag] = true
            })
            return this
        }
        WithCommand(cmd) {
            this.Command = cmd
        }
    }
    App.Core.Combat.Actions = []

    App.NewCombat = function (quest) {
        return new Option(quest)
    }
    let reDamage = /^【伤害统计】:你对(.+)的气血造成(.+)点伤害! $/
    let Plan = new App.Plan(App.Positions["Combat"],
        function (task) {
            App.Combat.Position.Term.Set("core.combat.damage", 0)
            task.AddTrigger("一边打架一边驯兽？你真是活腻了！", function () {
                OmitOutput()
                return true
            })
            task.AddTrigger(reDamage, function (trigger, result) {
                let dam = result[2] - 0
                App.Combat.Position.Term.Set("core.combat.damage", App.Combat.Position.Term.Get("core.combat.damage") + dam)
                return true
            })
            task.AddTrigger("你的驭兽术还不纯熟，无法让野兽跟随你！")
            task.AddTrigger("已经有野兽跟着你了！")
            task.AddTrigger("你要让什么野兽跟随你？")
            task.AddCatcher("disconnected").WithName("Disconnect")
        }, function (result) {
            if (result.Name == "Disconnect") {
                return
            }
            App.Combat.Stop()
        })
    App.Combat = new combatModule.Combat(App.Positions["Combat"], Plan)
    let checkCombatCmd = "come"
    App.Core.Combat.Perform = function () {
        App.Core.Combat.FilterActions("#send","#wpon","wpoff").forEach(action=>{
            switch(action.Command){
                case "#send":
                    App.Send(action.Data.replaceAll("$1",App.Combat.Target))
                    return
                case "#wpoff":
                case "#wpon":
                    App.Send(action.Command+action.Data?(" "+action.Data):"")
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
    App.Combat.OnStop = function (combat) {
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
        data = (data || App.NewCombat()).WithTags("kill")
        App.Core.Combat.DoCombat(id, data)
    }
    App.Core.Combat.CounterAttack = function (id, data) {
        data = (data || App.NewCombat()).WithTags("counterattack")
        App.Core.Combat.DoCombat(id, data)

    }
    App.Core.Combat.DoCombat = function (id, data) {
        if (data.Command) {
            App.Send(data.Command)
        }else if (id) {
            App.Send("kill " + id)
        }
        App.Core.Combat.FilterActions("#start").forEach(action=>{
            App.Send(action.Data.replaceAll("$1",App.Combat.Target))
        })
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
    App.Core.Combat.FilterActions=function(...commands){
        let filter={}
        commands.forEach(c=>{filter[c]=true})
        let result=[]
        App.Core.Combat.Actions.forEach(action=>{
            if (filter[action.Command]){
                result.push(action)
            }
        })
        return result
    }
    App.Core.Combat.Load = function () {
        App.Core.Combat.Actions = []
        App.LoadVariable("combat").forEach(data => {
            let action = actionModule.Parse(data)
            if (action.Command == "") { action.Command = "#send" }
            App.Core.Combat.Actions.push(action)
        })
    }
    App.Core.Combat.Load()
})(App)