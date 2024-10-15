(function (App) {
    let combatModule = App.RequireModule("helllibjs/combat/combat.js")
    App.Core.Combat = {}
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
            if (result.Name=="Disconnect"){
                return
            }
            App.Combat.Stop()
        })
    App.Combat = new combatModule.Combat(App.Positions["Combat"], Plan)
    let checkCombatCmd = "come"
    App.Combat.Perform = function () {
        App.Send(GetVariable("combat"))
    }
    App.Combat.Ticker = function (combat) {
        let msg = ""
        msg = msg + Math.floor(combat.Duration() / 1000) + "秒 "
        msg = msg + "[" + Object.keys(combat.Tags).join(",") + "]"
        Note(msg)
        App.Combat.Perform()
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
        App.Send("hp")
        App.Commands.Execute(App.NewSyncCommand())
        App.Next()
    }
    App.Core.Combat.Kill = function (id, tags) {
        App.Core.Combat.CounterAttack(id, tags)
    }
    App.Core.Combat.CounterAttack = function (id, tags) {
        if (id) {
            App.Send("kill " + id)
        }
        App.Send(checkCombatCmd)
        App.Combat.Start(id).WithTags(tags)
    }

    App.NewKillCommand = function (id, tags) {
        return App.Commands.NewCommand("kill", { ID: id, Tags: tags })
    }
    App.Commands.RegisterExecutor("kill", function (commands, running) {
        running.OnStart = function (arg) {
            App.Core.Combat.Kill(running.Command.Data.ID, running.Command.Data.Tags)
        }
    })
    App.UserQueue.UserQueue.RegisterCommand("#kill", function (uq, data) {
        uq.Commands.Append(
            App.NewKillCommand(data),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })
    App.NewCounterAttackCommand = function (id, tags) {
        return App.Commands.NewCommand("counterattack", { ID: id, Tags: tags })
    }
    App.Commands.RegisterExecutor("counterattack", function (commands, running) {
        running.OnStart = function (arg) {
            App.Core.Combat.CounterAttack(running.Command.Data.ID, running.Command.Data.Tags)
        }
    })

})(App)