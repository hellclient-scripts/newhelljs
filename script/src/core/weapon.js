(function (App) {
    let actionModule = App.RequireModule("helllibjs/conditions/action.js")
    App.Core.Weapon = {}
    App.Core.Weapon.Wield = []
    App.Core.Weapon.Named = {}
    App.Core.Weapon.Repair = []
    App.Core.Weapon.Last = 0
    App.Core.Weapon.Duration = {}
    class Repair {
        constructor(action) {
            action.ParseNumber()
            this.ID = action.Data.trim()
            this.Gold = isNaN(action.Number) ? 0 : (action.Number - 0)
        }
        ID = ""
        Gold = 0
    }
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
    }
    let reDruation = /^耐 久 值 :\s*(\d+)\/\d+\s*$/
    let reLevel = /^(.+)的等级：(\d+)\/(\d+)$/
    let reDamage = /^装备效果 : (兵器|空手)伤害力 \+(\d+)$/

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
    App.Core.Weapon.CheckDuration = function () {
        PlanDuation.Execute()
    }
    let checkerDuration = App.Checker.Register("weaponduration", App.Core.Weapon.CheckDuration, 5 * 60 * 1000)
    App.Core.Weapon.PickWeapon = function () {
        if (App.Core.Weapon.Wield.length) {
            App.Send("get " + App.Core.Weapon.Wield[0].ID)
        }
    }
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
    App.Core.Weapon.GetWeapon = function (name) {
        if (App.Core.Weapon.Wield.length) {
            if (!name) {
                return App.Core.Weapon.Wield[0]
            }
            return App.Core.Weapon.Named[name.trim()]
        }
        return null
    }
    App.Core.Weapon.OnCommand = function (name) {
        let weapon = App.Core.Weapon.GetWeapon(name)
        return weapon ? weapon.OnCommand() : ""
    }
    App.Core.Weapon.OffCommand = function (name) {
        let weapon = App.Core.Weapon.GetWeapon(name)
        return weapon ? weapon.OffCommand() : ""
    }
    App.Core.Weapon.UnwieldAllCommand = function () {
        let result = []
        App.Core.Weapon.Wield.forEach(weapon => {
            if (weapon.Command == "#wield") {
                result.push(weapon.OffCommand())
            }
        })
        return result.join(";")
    }
    App.Core.Weapon.Load = function () {
        App.Core.Weapon.Wield = []
        App.Core.Weapon.Named = {}
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
            if (action.Command.trim() == "") { action.Command = "#wield" }
            if ((action.Command != "#wield" && action.Command != "#wear") || action.Data.trim() == "") {
                PrintSystem("无效的武器指令:" + action.Line)
                return
            }
            let weapon = new Weapon(action)
            App.Core.Weapon.Wield.push(weapon)
            App.Core.Weapon.Named[index + ""] = weapon
            if (weapon.Name) {
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

    App.UserQueue.UserQueue.RegisterCommand("#wpon", function (uq, data) {
        uq.Commands.Append(
            App.Commands.NewDoCommand(App.Core.Weapon.OnCommand(data)),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })

    App.UserQueue.UserQueue.RegisterCommand("#wpoff", function (uq, data) {
        uq.Commands.Append(
            App.Commands.NewDoCommand(App.Core.Weapon.OffCommand(data)),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })
    App.UserQueue.UserQueue.RegisterCommand("#unwield", function (uq, data) {
        uq.Commands.Append(
            App.Commands.NewDoCommand(App.Core.Weapon.UnwieldAllCommand(data)),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })
    App.Sender.RegisterAlias("#wpon", function (data) {
        App.Send(App.Core.Weapon.OnCommand(data))
    })
    App.Sender.RegisterAlias("#wpoff", function (data) {
        App.Send(App.Core.Weapon.OffCommand(data))
    })
    App.Sender.RegisterAlias("#unwield", function (data) {
        App.Send(App.Core.Weapon.UnwieldAllCommand(data))
    })

    App.Proposals.Register("repair", App.Proposals.NewProposal(function (proposals, context, exclude) {
        for (var index in App.Core.Weapon.Duration) {
            if (App.Core.Weapon.Duration[index].Duration < App.Params.WeaponDurationMin) {
                let repair = App.Core.Weapon.Repair[index - 0]
                if (repair) {
                    return function () {
                        App.Commands.PushCommands(
                            App.NewPrepareMoneyCommand(repair.Gold),
                            App.Move.NewToCommand(App.Params.LocRepair),
                            App.Commands.NewDoCommand("repair " + repair.ID),
                            App.Commands.NewDoCommand("repair " + repair.ID),
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
    App.Engine.SetFilter("core.needweapon", function (event) {
        if (App.Map.Room.ID) {
            App.Core.Stage.Raise("wpon-" + App.Map.Room.ID)
        }
        App.Send("#wpon")
        App.RaiseEvent(event)
    })
    App.BindEvent("core.disarmed",(e)=>{
        App.Core.Weapon.PickWeapon()
        App.Send(App.Core.Weapon.OnCommand())
    })
})(App)