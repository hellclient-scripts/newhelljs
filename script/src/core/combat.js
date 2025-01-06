//战斗模块
(function (App) {
    let combatModule = App.RequireModule("helllibjs/combat/combat.js")
    let actionModule = App.RequireModule("helllibjs/conditions/action.js")
    App.Core.Combat = {}
    // 战斗配置的块结构
    class Block {
        Name = ""
        Conditions = []
        Actions = []
    }
    //战斗参数结构
    class Option {
        constructor(quest) {
            this.Quest = quest
        }
        //战斗任务
        Quest = ""
        //战斗标签
        Tags = {}
        //战斗指令
        Command = ""
        //战斗时额外执行的计划
        Plan = null
        // 按组发送击杀指令
        KillInGroup = false
        // 打带跑
        HitAndRun = ""
        Ticker = 0
        //链式调用
        WithHitAndRun(val) {
            this.HitAndRun = val
            return this
        }
        //链式调用
        WithKillInGroup(val) {
            this.KillInGroup = val
            return this
        }
        //链式调用
        WithTags(...tags) {
            tags.forEach(tag => {
                this.Tags[tag] = true
            })
            return this
        }
        //链式调用
        WithCommand(cmd) {
            this.Command = cmd
            return this
        }
        //链式调用
        WithPlan(plan) {
            this.Plan = plan
            return this
        }
    }
    //战斗的配置列表
    App.Core.Combat.Actions = null
    //战斗的区块列表
    App.Core.Combat.Blocks = []
    //判断当前战斗是否能否停止
    App.Core.Combat.CanStop = () => {
        return App.Combat.Data.HitAndRun == ""
    }
    //创建新的战斗参数
    App.NewCombat = function (quest) {
        return new Option(quest)
    }
    let reDamage = /^【伤害统计】:你对(.+)的气血造成(.+)点伤害! $/
    //战斗是否失败
    App.Core.Combat.Fail = false
    let Plan = new App.Plan(App.Positions["Combat"],
        function (task) {
            App.Core.Combat.Fail = false
            App.Combat.Position.Term.Set("core.combat.damage", 0)
            //确定战斗是否还在进行
            task.AddTrigger("一边打架一边驯兽？你真是活腻了！", function () {
                OmitOutput()
                return true
            })
            //内力不足
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
            task.AddTrigger("你的驭兽术还不纯熟，无法让野兽跟随你！", () => {
                OmitOutput()
                return !App.Core.Combat.CanStop()
            })
            task.AddTrigger("已经有野兽跟着你了！", () => {
                OmitOutput()
                return !App.Core.Combat.CanStop()
            })
            task.AddTrigger("你要让什么野兽跟随你？", () => {
                OmitOutput()
                return !App.Core.Combat.CanStop()
            })
            task.AddCatcher("core.combatstop", () => {
                return !App.Core.Combat.CanStop()
            })

            task.AddCatcher("disconnected").WithName("Disconnect")
            if (App.Combat.Data.Plan) {
                App.Combat.Data.Plan.Execute()
            }
            task.AddCatcher("core.onexit", () => {
                App.Combat.Data.HitAndRun = ""
                return true
            })
            task.AddCatcher("core.wrongway", () => {
                App.Core.Combat.Fail = true
                App.Combat.Data.HitAndRun = ""
                return true
            })

        }, function (result) {
            if (result.Name == "Disconnect") {
                return
            }
            App.Combat.Stop(App.Core.Combat.Fail ? "fail" : "")
        })
    //战斗实例
    App.Combat = new combatModule.Combat(App.Positions["Combat"], Plan)
    //战斗perform间隔
    App.Combat.Interval = 600
    let checkCombatCmd = "come"
    //待发指令
    App.Core.Combat.Pending = {}
    // peform函数
    App.Core.Combat.Perform = function () {
        if (App.Combat.Data.HitAndRun) {
            if (App.Combat.Data.Ticker > 1) {
                App.Send("halt")
                App.Send(App.Combat.Data.HitAndRun)
            }
            return
        }
        Object.keys(App.Core.Combat.Pending).forEach((c) => {
            App.Send(c)
        })
        App.Core.Combat.Pending = {}
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
    //战斗时的心跳
    App.Combat.Ticker = function (combat) {
        let msg = ""
        combat.Data.Ticker++
        msg = msg + Math.floor(combat.Duration() / 1000) + "秒 "
        msg = msg + (combat.Data.Quest)
        msg = msg + "[" + Object.keys(combat.Data.Tags).join(",") + "]"
        Note(msg)
        App.Core.Combat.Perform()
        App.Send(checkCombatCmd)
    }
    //战斗结束处理函数
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
    //叫杀函数
    App.Core.Combat.Kill = function (id, data) {
        data = (data || App.NewCombat("")).WithTags("kill")
        App.Core.Combat.DoCombat(id, data)
    }
    //反击函数
    App.Core.Combat.CounterAttack = function (id, data) {
        data = (data || App.NewCombat("")).WithTags("counterattack")
        App.Core.Combat.DoCombat(id, data)
    }
    //替换变量
    App.Core.Combat.ReplaceCommand = (data) => {
        data = data.replaceAll("$1", App.Combat.Target)
        data = data.replaceAll("$wpon", App.Core.Weapon.OnCommand())
        data = data.replaceAll("$wpoff", App.Core.Weapon.OffCommand())
        return data
    }
    //选用战术
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
    //将指令加入待发
    App.Core.Combat.Pend = (cmd) => {
        App.Core.Combat.Pending[cmd] = true
    }
    //开始战斗
    App.Core.Combat.DoCombat = function (id, data) {
        App.Combat.Target = id
        App.Combat.Data = data
        App.Core.Combat.Actions = null
        App.Core.Combat.Pending = {}
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
    //注册指令
    App.NewKillCommand = function (id, data) {
        return App.Commands.NewCommand("kill", { ID: id, Data: data })
    }
    App.Commands.RegisterExecutor("kill", function (commands, running) {
        running.OnStart = function (arg) {
            App.Core.Combat.Kill(running.Command.Data.ID, running.Command.Data.Data)
        }
    })
    //注册用户队列
    App.UserQueue.UserQueue.RegisterCommand("#kill", function (uq, data) {
        uq.Commands.Append(
            App.NewKillCommand(data, new Option("userqueue")),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })
    //注册指令
    App.NewCounterAttackCommand = function (id, data) {
        return App.Commands.NewCommand("counterattack", { ID: id, Data: data })
    }
    App.Commands.RegisterExecutor("counterattack", function (commands, running) {
        running.OnStart = function (arg) {
            App.Core.Combat.CounterAttack(running.Command.Data.ID, running.Command.Data.Data)
        }
    })
    //过滤指令
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
    //加载设置函数
    App.Core.Combat.Load = function () {
        App.Core.Combat.Blocks = []
        App.Core.Combat.Actions = null
        let currentBlock = new Block()
        currentBlock.Conditions.push(App.Quests.Conditions.Always)
        App.Core.Combat.Blocks.push(currentBlock)
        App.LoadVariable("combat").forEach(data => {
            let action = actionModule.Parse(data)
            switch (action.Command) {
                case "#block"://区块定义
                    currentBlock = new Block()
                    currentBlock.Name = action.Data
                    currentBlock.Conditions = [App.Quests.Conditions.Never]
                    App.Core.Combat.Blocks.unshift(currentBlock)
                    return
                case "#apply"://应用区块
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
    //注册ctype条件
    App.Quests.Conditions.RegisterMatcher(App.Quests.Conditions.NewMatcher("ctype", function (data, target) {
        return App.Combat.Data && App.Combat.Data.Quest == data.trim()
    }))
    //注册ctag条件
    App.Quests.Conditions.RegisterMatcher(App.Quests.Conditions.NewMatcher("ctag", function (data, target) {
        return App.Combat.Data && App.Combat.Data.Tags[data.trim()]
    }))
})(App)