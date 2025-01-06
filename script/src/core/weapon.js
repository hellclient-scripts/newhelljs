//武器模块
(function (App) {
    let actionModule = App.RequireModule("helllibjs/conditions/action.js")
    App.Core.Weapon = {}
    App.Core.Weapon.Wield = []
    App.Core.Weapon.Named = {}
    App.Core.Weapon.Repair = []
    App.Core.Weapon.Touch = ""
    App.Core.Weapon.Last = 0
    App.Core.Weapon.Duration = {}
    App.Core.Weapon.NoSummon = false
    //修理信息
    class Repair {
        constructor(action) {
            action.ParseNumber()
            this.ID = action.Data.trim()
            this.Gold = isNaN(action.Number) ? 0 : (action.Number - 0)
        }
        ID = ""
        Gold = 0
    }
    //武器信息
    class Weapon {
        constructor(action) {
            this.Name = action.Param
            this.Command = action.Command
            this.ID = action.Data.trim()
        }
        Name = ""
        Command = ""
        ID = ""
        OnCommand() {
            return (this.Command == "#wield" ? "wield " : "wear ") + this.ID
        }
        OffCommand() {
            return (this.Command == "#wield" ? "unwield " : "remove ") + this.ID
        }
        SummonCommand() {
            return `summon ${this.ID}`
        }
        HideCommand() {
            return `hide ${this.ID}`
        }
    }
    let reDruation = /^耐 久 值 :\s*(\d+)\/\d+\s*$/
    let reLevel = /^(.+)的等级：(\d+)\/(\d+)$/
    let reLevel10 = /^(.+)的等级：无上神品  LV10$/
    let reDamage = /^装备效果 : (兵器|空手)伤害力 \+(\d+)$/
    //检查耐久的计划
    let PlanDuation = new App.Plan(App.Positions["Connect"],
        function (task) {
            App.Core.Weapon.Duration = {}
            let current = null
            let duration = null
            let level = null
            let damage = null
            let name = null
            task.AddTrigger(reLevel, function (trigger, result) {
                name = result[1]
                level = result[2] - 0
                return true
            })
            task.AddTrigger(reLevel10, function (trigger, result) {
                name = result[1]
                level = 10
                return true
            })
            task.AddTrigger(reDamage, function (trigger, result) {
                damage = result[2]
                return true
            })
            task.AddTrigger(reDruation, function (trigger, result) {
                if (current != null) {
                    duration = result[1] - 0
                }
                return true
            })
            task.AddTrigger("那里没有这样东西。", function () {
                current = null
                return true
            })
            let setduration = () => {
                if (current != null) {
                    let repair = App.Core.Weapon.Repair[current - 0]
                    App.Core.Weapon.Duration[current] = {
                        ID: repair ? repair.ID : "",
                        Duration: duration,
                        Damage: damage,
                        Name: name,
                        Level: level,
                    }
                }

            }
            task.AddCatcher("core.echo.core.weapon.duration", function (catcher, event) {
                setduration()
                duration = null
                level = null
                damage = null
                name = null
                current = event.Data
                return true
            })
            task.AddCatcher("core.echo.core.weapon.duration.end", function () {
                setduration()
            })
            App.Core.Weapon.Repair.forEach((repair, index) => {
                App.Echo("core.weapon.duration", "" + index)
                App.Send("l " + repair.ID + " of me")
            })
            App.Echo("core.weapon.duration.end")
        },
        function (result) {
            checkerDuration.Reset()
        }
    )
    //检查武器耐久
    App.Core.Weapon.CheckDuration = function () {
        PlanDuation.Execute()
    }
    //检查武器耐久的checker
    let checkerDuration = App.Checker.Register("weaponduration", App.Core.Weapon.CheckDuration, 3 * 60 * 1000)
    //捡起并装备第一个武器
    App.Core.Weapon.PickWeapon = function () {
        if (App.Core.Weapon.Wield.length) {
            App.Send("get " + App.Core.Weapon.Wield[0].ID)
            App.Send(App.Core.Weapon.OnCommand())
        }
    }
    //打印武器设置
    App.Core.Weapon.Print = function () {
        if (App.Core.Weapon.Wield.length) {
            Note("装备清单：")
            Note("  #wpon :" + App.Core.Weapon.Wield[0].OnCommand() + " |  #wpoff :" + App.Core.Weapon.Wield[0].OffCommand())
            Object.keys(App.Core.Weapon.Named).sort().forEach(key => {
                Note("  #wpon " + key + " :" + App.Core.Weapon.Named[key].OnCommand() + " | #wpoff " + key + " :" + App.Core.Weapon.Named[key].OffCommand())
            })
        } else {
            Note("未设置装备。")
        }
        if (App.Core.Weapon.Repair.length) {
            Note("修理清单")
            App.Core.Weapon.Repair.forEach(item => {
                msg = "  " + item.ID
                if (item.Gold) {
                    msg += " 修理费" + item.Gold + " Gold。"
                }
                Note(msg)
            })
        } else {
            Note("未设置修理")
        }
    }
    //获取指定武器
    App.Core.Weapon.GetWeapon = function (name) {
        if (App.Core.Weapon.Wield.length) {
            if (!name) {
                return App.Core.Weapon.Wield[0]
            }
            return App.Core.Weapon.Named[name.trim()]
        }
        return null
    }
    //装备指定武器的指令
    App.Core.Weapon.OnCommand = function (name) {
        let weapon = App.Core.Weapon.GetWeapon(name)
        return weapon ? weapon.OnCommand() : ""
    }
    //解除指定武器的指令
    App.Core.Weapon.OffCommand = function (name) {
        let weapon = App.Core.Weapon.GetWeapon(name)
        return weapon ? weapon.OffCommand() : ""
    }
    //召唤指定武器的指令
    App.Core.Weapon.SummonCommand = function (name) {
        let weapon = App.Core.Weapon.GetWeapon(name)
        return weapon ? weapon.SummonCommand() : ""
    }
    //隐藏指定武器的指令
    App.Core.Weapon.HideCommand = function (name) {
        let weapon = App.Core.Weapon.GetWeapon(name)
        return weapon ? weapon.HideCommand() : ""
    }
    //解除所有武器的指令
    App.Core.Weapon.UnwieldAllCommand = function () {
        let result = []
        App.Core.Weapon.Wield.forEach(weapon => {
            if (weapon.Command == "#wield") {
                result.push(weapon.OffCommand())
            }
        })
        return result.join(";")
    }
    //加载设置
    App.Core.Weapon.Load = function () {
        App.Core.Weapon.Wield = []
        App.Core.Weapon.Named = {}
        App.Core.Weapon.Touch = ""
        let named = {}
        App.Core.Weapon.Repair = []
        let index = 1
        App.LoadVariable("weapon").forEach(data => {
            let action = actionModule.Parse(data)
            if (action.Command == "#repair") {
                let repair = new Repair(action)
                if (repair.Data == "") {
                    PrintSystem("无效的武器指令:" + action.Line)
                    return
                }
                App.Core.Weapon.Repair.push(repair)
                return
            }
            if (action.Command == "#touch") {
                App.Core.Weapon.Touch = action.Data.trim()
                return
            }
            if (action.Command.trim() == "") { action.Command = "#wield" }
            if ((action.Command != "#wield" && action.Command != "#wear") || action.Data.trim() == "") {
                PrintSystem("无效的武器指令:" + action.Line)
                return
            }
            let weapon = new Weapon(action)
            App.Core.Weapon.Wield.push(weapon)
            App.Core.Weapon.Named[index + ""] = weapon
            if (weapon.Name) {//武器可以有别名，比如#wield.sowrd my sword
                named[weapon.Name] = weapon
            }
            index++
        })
        for (let key in named) {
            App.Core.Weapon.Named[key] = named[key]
        }
        App.Core.Weapon.Print()
    }
    App.Core.Weapon.Load()
    //注册装备武器的用户队列
    App.UserQueue.UserQueue.RegisterCommand("#wpon", function (uq, data) {
        uq.Commands.Append(
            App.Commands.NewDoCommand(App.Core.Weapon.OnCommand(data)),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })
    //注册解除武器的用户队列
    App.UserQueue.UserQueue.RegisterCommand("#wpoff", function (uq, data) {
        uq.Commands.Append(
            App.Commands.NewDoCommand(App.Core.Weapon.OffCommand(data)),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })
    //注册解除所有武器的用户队列
    App.UserQueue.UserQueue.RegisterCommand("#unwield", function (uq, data) {
        uq.Commands.Append(
            App.Commands.NewDoCommand(App.Core.Weapon.UnwieldAllCommand(data)),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })
    //注册装备武器的别名
    App.Sender.RegisterAlias("#wpon", function (data) {
        App.Send(App.Core.Weapon.OnCommand(data))
    })
    //注册解除武器的别名
    App.Sender.RegisterAlias("#wpoff", function (data) {
        App.Send(App.Core.Weapon.OffCommand(data))
    })
    //注册解除所有武器的别名
    App.Sender.RegisterAlias("#unwield", function (data) {
        App.Send(App.Core.Weapon.UnwieldAllCommand(data))
    })
    //注册捡武器的别名
    App.Sender.RegisterAlias("#pickwp", function (data) {
        App.Core.Weapon.PickWeapon()
    })
    //注册召唤武器的别名
    App.Sender.RegisterAlias("#summon", function (data) {
        App.Send(App.Core.Weapon.SummonCommand(data))
    })
    //注册隐藏武器的别名
    App.Sender.RegisterAlias("#hide", function (data) {
        App.Send(App.Core.Weapon.HideCommand(data))
    })
    //注册修武器的准备
    App.Proposals.Register("repair", App.Proposals.NewProposal(function (proposals, context, exclude) {
        let dur = context.WeaponDurationMin || App.Params.WeaponDurationMin
        for (var index in App.Core.Weapon.Duration) {
            if (App.Core.Weapon.Duration[index].Duration < dur) {
                let repair = App.Core.Weapon.Repair[index - 0]
                if (repair) {
                    return function () {
                        App.Commands.PushCommands(
                            App.NewPrepareMoneyCommand(repair.Gold),
                            App.Move.NewToCommand(App.Params.LocRepair),
                            App.Commands.NewDoCommand("repair " + repair.ID),
                            App.Commands.NewDoCommand("repair " + repair.ID),
                            App.Commands.NewDoCommand("i"),
                            App.Commands.NewFunctionCommand(() => {
                                checkerDuration.Force()
                                App.Next()
                            }),
                            App.NewNobusyCommand(),
                        )
                        App.Next()
                    }
                }
            }
        }
        return null
    }))
    //注册召唤主武器的准备
    App.Proposals.Register("summon", App.Proposals.NewProposal(function (proposals, context, exclude) {
        if (App.Core.Weapon.Wield.length && App.Core.Weapon.Wield[0].ID.indexOf(" ") == -1 && !App.Core.Weapon.NoSummon) {
            if (App.Data.Item.List.FindByIDLower(App.Core.Weapon.Wield[0].ID).First() == null) {
                return () => {
                    App.Commands.PushCommands(
                        App.Commands.NewDoCommand(`summon ${App.Core.Weapon.Wield[0].ID};i`),
                        App.NewNobusyCommand(),
                    )
                    App.Next()
                }
            }
        }
        if (App.Core.Weapon.Touch && App.Data.Item.List.FindByIDLower(App.Core.Weapon.Touch).First() == null) {
            return () => {
                App.Commands.PushCommands(
                    App.Commands.NewDoCommand(`summon ${App.Core.Weapon.Wield[0].ID};i`),
                    App.NewNobusyCommand(),
                )
                App.Next()
            }
        }
        return null
    }))
    //注册丢垃圾武器的准备
    App.Proposals.Register("dropwp", App.Proposals.NewProposal(function (proposals, context, exclude) {
        if (App.Core.Weapon.Wield.length && App.Core.Weapon.Wield[0].ID.indexOf(" ") != -1) {
            if (App.Data.Item.List.FindByIDLower(App.Core.Weapon.Wield[0].ID).Sum() > 1) {
                return () => {
                    App.Commands.PushCommands(
                        App.Commands.NewDoCommand(`${App.Core.Weapon.OffCommand()};drop ${App.Core.Weapon.Wield[0].ID};i`),
                        App.NewNobusyCommand(),
                    )
                    App.Next()
                }
            }
        }
        return null
    }))

    App.Engine.SetFilter("core.needweapon", function (event) {
        if (App.Map.Room.ID) {
            App.Core.Stage.Raise("wpon-" + App.Map.Room.ID)
        }
        App.Send("#wpon")
        App.RaiseEvent(event)
    })
    App.BindEvent("core.disarmed", (e) => {
        App.Core.Weapon.PickWeapon()
    })
    App.BindEvent("core.onhurt", (e) => {
        App.Core.Combat.Pend("#pickwp")
    })
    App.BindEvent("core.summonfail", () => {
        App.Core.Weapon.NoSummon = true
    })
})(App)