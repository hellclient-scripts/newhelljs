(function (App) {
    App.Core.Heal = {}
    App.Core.Heal.LastSleep = 0
    App.Core.Heal.SleepInterval = 121 * 1000
    let reSleepFail = /^你想合上眼睛好好睡上一觉，可是/
    let PlanSleep = new App.Plan(App.Positions["Connect"], function (task) {
        task.AddTrigger("这里不是你能睡的地方！")
        task.AddTrigger("战斗中不能睡觉！")
        task.AddTrigger("你正忙着呢！")
        task.AddTrigger("你现在接近昏迷，睡不着觉。")
        task.AddTrigger(reSleepFail)
        task.AddTrigger("你迷迷糊糊的睁开双眼，爬了起来。")
        task.AddTrigger("你一觉醒来，只觉精力充沛。该活动一下了。").WithName("ok")
        task.AddTimer(30000).WithName("timeout")
        App.Send("sleep")
        App.Core.Heal.LastSleep = (new Date()).getTime()
    }, function (result) {
        if (result.Type == "cancel") {
            return
        }
        switch (result.Name) {
            case "ok":
                App.Data.Player.HP["当前气血"] = App.Data.Player.HP["气血上限"]
                App.Data.Player.HP["当前精气"] = App.Data.Player.HP["精气上限"]
                App.Data.Player.HP["当前内力"] = App.Data.Player.HP["内力上限"]
                break
            case "timeout":
                App.Append(
                    App.NewNobusyCommand()
                )
                break
        }
        App.Next()
    })
    App.Proposals.Register("dazuo", App.Proposals.NewProposal(function (proposals, exclude) {
        if ((App.Data.Player.HP["当前内力"] * 100 / App.Data.Player.HP["内力上限"]) <= App.Params.NeiliMin) {
            if ((new Date()).getTime() - App.Core.Heal.LastSleep > App.Core.Heal.SleepInterval) {
                return function () {
                    App.Commands.PushCommands(
                        App.Move.NewToCommand(App.Params.LocSleep),
                        App.Commands.NewPlanCommand(PlanSleep)
                    )
                    App.Next()
                }
            } else {
                return function () {
                    let num = App.Params.NumDazuo > 0 ? App.Params.NumDazuo :  ((App.Data.Player.HP["内力上限"] - App.Data.Player.HP["当前内力"]) * 0.8).toFixed()
                    if (num >= App.Data.Player.HP["当前气血"]) { num = App.Data.Player.HP["当前气血"] }
                    if (num < 10) { num = 10 }
                    App.Commands.PushCommands(
                        App.Move.NewToCommand(App.Params.LocDazuo),
                        App.Commands.NewDoCommand("dazuo " + num),
                        App.NewNobusyCommand(),
                        App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                        App.NewSyncCommand(),
                    )
                    App.Next()
                }
            }
        }
        return null
    }))
    App.Proposals.Register("jinchuanyao", App.Proposals.NewProposal(function (proposals, exclude) {
        if (App.Data.Player.HP["气血百分比"] <= 20) {
            return function () {
                App.Commands.PushCommands(
                    App.Commands.NewDoCommand("eat jinchuang yao;yun recover;yun regenerate;hp;i"),
                    App.NewNobusyCommand(),
                )
                if (!App.Data.Item.List.FindByIDLower("jinchuang yao").First()) {
                    App.Commands.Insert(App.Goods.NewBuyCommand("jin chuangyao"),)
                }
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("heal", App.Proposals.NewProposal(function (proposals, exclude) {
        if (App.Data.Player.HP["气血百分比"] <= App.Params.HealBelow) {
            return function () {
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocDazuo),
                    App.Commands.NewDoCommand("yun heal"),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                    App.NewSyncCommand(),
                )
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("tuna", App.Proposals.NewProposal(function (proposals, exclude) {
        if ((App.Data.Player.HP["当前精力"] * 100 / App.Data.Player.HP["精力上限"]) <= App.Params.JingliMin) {
            return function () {
                let num = App.Params.NumTuna > 0 ? App.Params.NumTuna : (App.Data.Player.HP["精力上限"] - App.Data.Player.HP["当前精力"])
                if (num >= App.Data.Player.HP["当前精气"]) { num = App.Data.Player.HP["当前精气"] }
                if (num < 10) { num = 10 }
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocDazuo),
                    App.Commands.NewDoCommand("dazuo " + num),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                    App.NewSyncCommand(),
                )
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("yangjingdan", App.Proposals.NewProposal(function (proposals, exclude) {
        if (App.Data.Player.HP["精气百分比"] <= 34) {
            return function () {
                App.Commands.PushCommands(
                    App.Commands.NewDoCommand("eat yangjing dan;yun recover;yun regenerate;hp;i"),
                    App.NewNobusyCommand(),
                )
                if (!App.Data.Item.List.FindByIDLower("yangjing dan").First()) {
                    App.Commands.Insert(App.Goods.NewBuyCommand("yangjing dan"))
                }
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("inspire", App.Proposals.NewProposal(function (proposals, exclude) {
        if (App.Data.Player.HP["精气百分比"] <= App.Params.InspireBelow) {
            return function () {
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocDazuo),
                    App.Commands.NewDoCommand("yun inspire"),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                    App.NewSyncCommand(),
                )
                App.Next()
            }
        }
        return null
    }))
    App.Core.Heal.NewRestCommand = function () {
        return App.Commands.NewCommand("rest")
    }
    App.Commands.RegisterExecutor("rest", function (commands, running) {
        running.OnStart = function (arg) {
            if ((App.Data.Player.HP["当前内力"] * 100 / App.Data.Player.HP["内力上限"]) <= App.Params.NeiliMin) {
                let num = App.Params.NumDazuo > 0 ? App.Params.NumDazuo : ((App.Data.Player.HP["内力上限"] - App.Data.Player.HP["当前内力"]) * 0.8).toFixed()
                if (num >= App.Data.Player.HP["当前气血"]) { num = App.Data.Player.HP["当前气血"] }
                if (num < 10) { num = 10 }
                App.Commands.PushCommands(
                    App.Commands.NewDoCommand("dazuo " + num),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                    App.NewSyncCommand(),
                    App.Core.Heal.NewRestCommand(),
                )
            } else if (App.Data.Player.HP["气血百分比"] <= App.Params.HealBelow) {
                App.Commands.PushCommands(
                    App.Commands.NewDoCommand("yun heal"),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                    App.NewSyncCommand(),
                    App.Core.Heal.NewRestCommand(),
                )
            } else if (App.Core.Dispel.Need) {
                return function () {
                    App.Commands.PushCommands(
                        App.Commands.NewDoCommand("yun dispel;hp"),
                        App.NewNobusyCommand(),
                        App.Core.Heal.NewRestCommand(),
                    )
                }
            }
            App.Next()
        }
    })
})(App)