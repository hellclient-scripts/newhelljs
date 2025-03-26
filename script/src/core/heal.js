//疗伤模块
(function (App) {
    App.Core.Heal = {}
    App.Core.Heal.LastSleep = 0
    App.Core.Heal.SleepInterval = 121 * 1000
    let reSleepFail = /^你想合上眼睛好好睡上一觉，可是/
    //睡觉的计划
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
    //打坐(恢复内力)的准备
    App.Proposals.Register("dazuo", App.Proposals.NewProposal(function (proposals, context, exclude) {
        let neimin = context.NeiliMin || App.Params.NeiliMin
        if (neimin > App.Params.NeiliMin) {
            neimin = App.Params.NeiliMin
        }
        let jifaForce = App.Data.Player.Jifa["force"] ? App.Data.Player.Jifa["force"].Level : 0
        if ((App.Data.Player.HP["当前内力"] * 100 / App.Data.Player.HP["内力上限"]) <= neimin) {//touch
            if (App.Core.Weapon.Touch) {
                return function () {
                    App.Commands.PushCommands(
                        App.Commands.NewDoCommand(`touch ${App.Core.Weapon.Touch};yun recover;yun regenerate;hp`),
                        App.NewNobusyCommand(),
                    )
                    App.Next()
                }
            }
            if ((new Date()).getTime() - App.Core.Heal.LastSleep > App.Core.Heal.SleepInterval) {//sleep
                return function () {
                    App.Commands.PushCommands(
                        App.Move.NewToCommand(App.Params.LocSleep),
                        App.Commands.NewPlanCommand(PlanSleep)
                    )
                    App.Next()
                }
            } else {
                if (jifaForce < 120) {//发呆
                    return function () {
                        Note("有效内功过低，发呆等恢复")
                        App.Commands.PushCommands(
                            App.Commands.NewWaitCommand(3000),
                            App.Commands.NewDoCommand("hp"),
                            App.NewSyncCommand(),
                        )
                        App.Next()
                    }
                }
                return function () {//打坐
                    if (neimin < 50) {
                        neimin = 50
                    }
                    let num = App.Params.NumDazuo > 0 ? App.Params.NumDazuo : (App.Data.Player.HP["内力上限"] * neimin / 100 - App.Data.Player.HP["当前内力"]).toFixed()
                    if (num >= App.Data.Player.HP["当前气血"]) { num = App.Data.Player.HP["当前气血"] }
                    if (App.Core.Dispel.Need) {
                        num = (num / 2).toFixed()
                    }
                    if (num < 10) { num = 10 }
                    App.Commands.PushCommands(
                        App.Commands.NewDoCommand("dazuo " + num),
                        App.Commands.NewWaitCommand(1000),
                        App.NewNobusyCommand(),
                        App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                        App.NewSyncCommand(),
                    )
                    if (App.Map.Room.Data["NoFight"] || App.Map.Room.ID == App.Params.LocMaster) {
                        App.Insert(App.Move.NewToCommand(App.Params.LocDazuo),)
                    }
                    App.Next()
                }
            }
        }
        return null
    }))
    //吃金疮药的准备
    App.Proposals.Register("jinchuanyao", App.Proposals.NewProposal(function (proposals, context, exclude) {
        if (App.Core.Dispel.Need && App.Data.Player.HP["经验"] > 100000) {
            //防止在药铺卡到晕不去解毒大米位置
            return null
        }
        if (App.Data.Player.HP["气血百分比"] <= 20) {
            return function () {
                App.Commands.PushCommands(
                    App.Commands.NewDoCommand((App.Core.Dispel.Need ? "yun dispel;" : "") + "eat jinchuang yao;yun recover;yun regenerate;hp;i"),
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
    //疗伤的准备
    App.Proposals.Register("heal", App.Proposals.NewProposal(function (proposals, context, exclude) {
        let jifaForce = App.Data.Player.Jifa["force"] ? App.Data.Player.Jifa["force"].Level : 0
        let healBelow = context["HealBelow"] != null ? context["HealBelow"] : App.Params.HealBelow
        if (App.Data.Player.HP["气血百分比"] <= healBelow && jifaForce > 20) {
            return function () {
                App.Commands.PushCommands(
                    App.Commands.NewDoCommand(App.Core.Dispel.Need ? "yun heal;yun dispel" : "yun heal"),//避免因为中毒不吃药卡住
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                    App.NewSyncCommand(),
                )
                if (App.Map.Room.ID == App.Params.LocMaster || App.Core.Dispel.Need) {
                    App.Insert(App.Move.NewToCommand(App.Params.LocDazuo),)
                }
                App.Next()
            }
        }
        return null
    }))
    //吐纳的准备
    App.Proposals.Register("tuna", App.Proposals.NewProposal(function (proposals, context, exclude) {
        if (App.Data.Player.HP["当前精力"] < App.Params.NumJingliMin && App.Data.Player.HP["精力上限"] > 2 * App.Params.NumJingliMin) {
            return function () {
                let num = App.Params.NumTuna > 0 ? App.Params.NumTuna : ((App.Data.Player.HP["精力上限"] - App.Data.Player.HP["当前精力"]) / 2).toFixed()
                if (num >= App.Data.Player.HP["当前精气"]) { num = App.Data.Player.HP["当前精气"] }
                if (num < 10) { num = 10 }
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocDazuo),
                    App.Commands.NewDoCommand("tuna " + num),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                    App.NewSyncCommand(),
                )
                if (App.Map.Room.ID == App.Params.LocMaster) {
                    App.Insert(App.Move.NewToCommand(App.Params.LocDazuo),)
                }
                App.Next()
            }
        }
        return null
    }))
    //吃养精丹的准备
    App.Proposals.Register("yangjingdan", App.Proposals.NewProposal(function (proposals, context, exclude) {
        if (App.Core.Dispel.Need && App.Data.Player.HP["经验"] > 100000) {
            return null
        }
        if (App.Data.Player.HP["精气百分比"] <= 50 || (App.Data.Player.HP["精气百分比"] < 100 && App.Data.Player.HP["精气上限"] < 100)) {
            return function () {
                App.Commands.PushCommands(
                    App.Commands.NewDoCommand((App.Core.Dispel.Need ? "yun dispel;" : "") + "eat yangjing dan;yun recover;yun regenerate;hp;i"),
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
    // inspire的准备
    App.Proposals.Register("inspire", App.Proposals.NewProposal(function (proposals, context, exclude) {
        if (App.Data.Player.Score["任督"] && (App.Data.Player.HP["精气百分比"] <= App.Params.InspireBelow)) {
            return function () {
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocDazuo),
                    App.Commands.NewDoCommand(App.Core.Dispel.Need ? "yun heal;yun inspire" : "yun inspire"),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                    App.NewSyncCommand(),
                )
                if (App.Map.Room.ID == App.Params.LocMaster) {
                    App.Insert(App.Move.NewToCommand(App.Params.LocDazuo),)
                }
                App.Next()
            }
        }
        return null
    }))
    //注册rest指令
    App.Core.Heal.NewRestCommand = function () {
        return App.Commands.NewCommand("rest")
    }
    App.Commands.RegisterExecutor("rest", function (commands, running) {
        running.OnStart = function (arg) {
            if (App.Data.Player.HP["内力上限"] == 0 && (App.Data.Player.HP["当前气血"] * 100 / App.Data.Player.HP["气血上限"]) <= App.Params.NeiliMin) {//发呆
                Note("无内力，发呆等恢复")
                App.Commands.PushCommands(
                    App.Commands.NewWaitCommand(3000),
                    App.Commands.NewDoCommand("hp"),
                    App.NewSyncCommand(),
                )
            }
            else if (App.Data.Player.HP["当前精力"] < App.Params.NumJingliMin && App.Data.Player.HP["精力上限"] > 2 * App.Params.NumJingliMin) {//tuna
                let num = App.Params.NumTuna > 0 ? App.Params.NumTuna : ((App.Data.Player.HP["精力上限"] - App.Data.Player.HP["当前精力"]) / 2).toFixed()
                if (num >= App.Data.Player.HP["当前精气"]) { num = App.Data.Player.HP["当前精气"] }
                if (num < 10) { num = 10 }
                App.Commands.PushCommands(
                    App.Commands.NewDoCommand("tuna " + num),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                    App.NewSyncCommand(),
                    App.Core.Heal.NewRestCommand(),

                )
            } else if (App.Core.Weapon.Touch && App.Data.Item.List.FindByIDLower(App.Core.Weapon.Touch).First() == null) {//summon
                App.Commands.PushCommands(
                    App.Commands.NewDoCommand(`summon ${App.Core.Weapon.Wield[0].ID};i`),
                    App.NewNobusyCommand(),
                )
            } else if ((App.Data.Player.HP["当前内力"] * 100 / App.Data.Player.HP["内力上限"]) <= App.Params.NeiliMin) {//内力
                if (App.Core.Weapon.Touch) {//touch
                    App.Commands.PushCommands(
                        App.Commands.NewDoCommand(`touch ${App.Core.Weapon.Touch};yun recover;yun regenerate;hp`),
                        App.NewNobusyCommand(),
                        App.Core.Heal.NewRestCommand(),
                    )
                    App.Next()
                    return
                }
                let jifaForce = App.Data.Player.Jifa["force"] ? App.Data.Player.Jifa["force"].Level : 0
                if (jifaForce < 120) {//发呆
                    Note("有效内功过低，发呆等恢复")
                    App.Commands.PushCommands(
                        App.Commands.NewWaitCommand(3000),
                        App.Commands.NewDoCommand("hp"),
                        App.NewSyncCommand(),
                        App.Core.Heal.NewRestCommand(),
                    )
                    App.Next()
                    return
                }
                //dazuo
                let num = App.Params.NumDazuo > 0 ? App.Params.NumDazuo : (App.Data.Player.HP["内力上限"] * App.Params.NeiliMin / 100 - App.Data.Player.HP["当前内力"]).toFixed()
                if (num >= App.Data.Player.HP["当前气血"]) { num = App.Data.Player.HP["当前气血"] }
                if (num < 10) { num = 10 }
                App.Commands.PushCommands(
                    App.Commands.NewDoCommand("dazuo " + num),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                    App.NewSyncCommand(),
                    App.Core.Heal.NewRestCommand(),
                )
            } else if (App.Data.Player.HP["气血百分比"] <= 20) {//失败
                let eatyao = App.Core.Medicine.EatYao("回血")
                if (eatyao) {
                    App.Commands.PushCommands(
                        App.Commands.NewFunctionCommand(eatyao),
                        App.Core.Heal.NewRestCommand(),//重试
                    )
                } else {
                    App.Fail()
                    return
                }
            } else if (App.Data.Player.HP["气血百分比"] <= App.Params.HealBelow) {//yun heal
                App.Commands.PushCommands(
                    App.Commands.NewDoCommand("yun heal"),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                    App.NewSyncCommand(),
                    App.Core.Heal.NewRestCommand(),
                )
            } else if (App.Data.Player.HP["精气百分比"] <= 34) {//失败
                App.Fail()
                return
            } else if (App.Data.Player.Score["任督"] && App.Data.Player.HP["精气百分比"] <= App.Params.InspireBelow) {//inspire
                App.Commands.PushCommands(
                    App.Commands.NewDoCommand("yun inspire"),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
                    App.NewSyncCommand(),
                    App.Core.Heal.NewRestCommand(),
                )
            } else if (App.Core.Dispel.Need && App.Data.Player.HP["内力上限"] >= 300) {//dispel
                App.Commands.PushCommands(
                    App.Commands.NewDoCommand("yun dispel;hp"),
                    App.Commands.NewWaitCommand(1000),
                    App.NewNobusyCommand(),
                    App.Core.Heal.NewRestCommand(),
                )
            }
            App.Next()
        }
    })
})(App)