$.Module(function (App) {
    let relgtfloor = /^灵感.*塔\.第(.*)层$/
    let matcherNext = /^杨小邪\(yang xiaoxie\)偷偷告诉你：据说上面关押的是：(.*)，/
    let matcherWuchi = /^(看起来武痴想杀死你！|武痴左手两指|武痴双手虚虚实实|武痴轻轻地往上方一飘|武痴凝神闭息|武痴扬手|武痴身形忽然变得诡秘异常|武痴身子忽进忽退|武痴深深吸进一口气|武痴随手抓出)/
    let matcherLeft = /^\(你还有(\d+)张灵符\)$/
    let LGT = {}
    LGT.LastLevel = 0
    LGT.Last = 0
    LGT.Data = {
        Level: 0,
        灵符: 0,
        Ready: 0,//0需要等待,1可以Check
        Entry: [],
    }
    LGT.Connect = () => {
        PlanQuest.Execute()
        $.PushCommands(
            $.Function(LGT.Kill),
        )
        $.Next()
    }
    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            task.AddTrigger(relgtfloor, (tri, result) => {
                LGT.Data.Level = App.CNumber.ParseNumber(result[1])
                LGT.LastLevel = LGT.Data.Level
                if (LGT.Data.Level == 2) {
                    LGT.Data.Ready = 1
                    LGT.Last = $.Now()
                } else {
                    LGT.Data.Ready = 0
                }
                return true
            })
            task.AddTrigger(matcherWuchi, (tri, result) => {
                App.Reconnect(0, LGT.Connect)
                return true
            })
            task.AddTrigger(matcherLeft, (tri, result) => {
                LGT.Data.灵符 = result[1] - 0
                if (LGT.Data.Ready == 0) {
                    LGT.Data.Ready = 1
                } else {
                    App.Commands.Drop()
                    LGT.Check()
                }
                return true
            })
            task.AddTrigger("你听到无数天魔在耳边吟唱嘶吼，莫大的压力使你开始神智迷糊了...", (tri, result) => {
                // LGT.Check()
                return true
            })
        }
    )
    let PlanEnter = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.AddTrigger("本日闯关你已经试过了，明天中午十二点后请早。", () => {
                task.Data = "nextday"
                return true
            })
            App.Send("unride")
            App.Send(LGT.Data.Entry.shift())
            App.Sync()
        },
        (result) => {
            switch (result.Task.Data) {
                case "nextday":
                    Quest.Cooldown(8 * 60 * 60 * 1000)
                    App.Next()
                    return
                default:
                    if (LGT.Data.Level > 0) {
                        Note("进入成功，等待传送")
                        return
                    } else {
                        if (LGT.Data.Entry.length > 0) {
                            $.PushCommands(
                                $.Nobusy(),
                                $.Plan(PlanEnter),
                            )
                            $.Next()
                            return
                        } else {
                            Quest.Cooldown(30 * 60 * 1000)
                            App.Next()
                            return
                        }
                    }

            }
        }
    )
    LGT.Check = () => {
        if (LGT.Data.灵符 >= 2) {
            LGT.Next()
        } else {
            App.Checker.GetCheck("weaponduration").Force()
            App.Checker.GetCheck("i").Force()
            $.PushCommands(
                $.Nobusy(),
                $.Do("knock zhong;i"),
                $.Sync(),
                $.Wait(3000),
                $.Nobusy(),
                $.Prepare(),
            )
            $.Next()
        }
    }
    LGT.Next = () => {
        $.PushCommands(
            $.Nobusy(),
            $.Function(() => {
                App.Send("yun recover;yun regenerage")
                $.RaiseStage("prepare")
                $.Next()
            }),
            $.Path(["u"]),
            $.Function(LGT.Kill)
        )
        $.Next()
    }
    LGT.Wait = () => {
        if (LGT.Data.Ready == 0) {
            LGT.Data.Ready = 1
        } else {
            LGT.Check()
        }
    }
    LGT.Kill = () => {
        let tags = []
        for (i = 0; i <= LGT.Data.Level; i = i + 10) {
            tags.push(`lgt-${i}`)
        }
        $.PushCommands(
            $.CounterAttack("qiu tu", $.NewCombat("lgt").WithTags(...tags)),
            $.Function(() => {
                App.Core.Weapon.PickWeapon()
                $.Next()
            }),
            $.Rest(),
            $.Function(LGT.Wait),
        ).WithFailCommand($.Function(LGT.Wait))
        $.Next()
    }
    LGT.Start = function () {
        PlanQuest.Execute()
        LGT.Go()
    }
    LGT.Go = function () {
        LGT.Data.Entry = ["wu", "nu", "eu", "su", "u"]
        LGT.Data.Level = 0
        LGT.Data.灵符 = 0
        $.PushCommands(
            $.Prepare("", { WeaponDurationMin: 80 }),
            $.To("2902"),
            $.Nobusy(),
            $.Plan(PlanEnter),
        )
        $.Next()
    }
    let Quest = App.Quests.NewQuest("lgt")
    Quest.Name = "灵感塔爬塔"
    Quest.Desc = ""
    Quest.Intro = ""
    Quest.Help = ""
    Quest.OnHUD = () => {
        let last = LGT.Last ? App.HUD.UI.FormatTime($.Now() - LGT.Last, true) : "-"
        return [
            new App.HUD.UI.Word("上次爬塔:"),
            new App.HUD.UI.Word(last, 5, true),
        ]
    }
    Quest.OnSummary = () => {
        let last = LGT.Last ? App.HUD.UI.FormatTime($.Now() - LGT.Last, true) : "-"
        return [
            new App.HUD.UI.Word("塔:"),
            new App.HUD.UI.Word(last, 5, true),
        ]
    }
    Quest.OnReport = () => {
        let last = LGT.Last ? App.HUD.UI.FormatTime($.Now() - LGT.Last) : "-"
        return [`灵感塔-上次爬塔 ${last} 层数 ${LGT.LastLevel}`]
    }

    // Quest.GetReady = function (q, data) {
    //     return
    // }
    Quest.Start = function (data) {
        LGT.Start(data)
    }
    App.Quests.Register(Quest)
    App.Quests.LGT = LGT
})