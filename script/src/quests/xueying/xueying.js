$.Module(function (App) {
    let Xueying = {}
    const XueyingCooldown = 120000
    Xueying.Data = {
        Success: 0,
        All: 0,
        Finished: false,
        Start: 0,
    }
    //血影魔窟建功，你获得了二万点经验、一点潜能、一点实战体会、二百点江湖阅历、能力得到了提升。
    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            task.AddCatcher("core.giftbouns", (catcher, event) => {
                if (event.Data.prompt == "血影魔窟建功") {
                    Xueying.Data.Finished = true
                    App.Core.Analytics.Add(Quest.ID, App.CNumber.ParseNumber(event.Data.exp), App.CNumber.ParseNumber(event.Data.pot), App.CNumber.ParseNumber(event.Data.tihui))
                    Xueying.Data.Success++
                }
                return true
            })
            task.AddCatcher("core.fubenfail", (catcher, event) => {
                if (Xueying.Data.Finished) {
                    event.Context.Set("callback", () => {
                        Note("离开副本")
                        Quest.Cooldown(XueyingCooldown)
                    })
                } else {
                    Note("副本失败")
                }
                Quest.Cooldown(XueyingCooldown)
                return true
            })
        })
    Xueying.Start = () => {
        Xueying.Data.Finished = false
        PlanQuest.Execute()
        Xueying.Enter()
    }
    Xueying.Enter = () => {
        $.PushCommands(
            $.Prepare("commonWithExp"),
            // $.Timeslice("天牢"),
            $.To("fuben"),
            $.Plan(PlanEnter)
        )
        $.Next()
    }
    let PlanEnter = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.AddTrigger("祝你好运气！", (catcher, result) => {
                //成功进入副本
                task.Data = "ok"
                return true
            })
            App.Send("unride;enter xueying")
            App.Sync()

        },
        (result) => {
            if (result.Task.Data == "ok") {
                Xueying.Entered()
                return
            }
            Note("进入失败")
            // App.Core.Timeslice.Change("")
            Quest.Cooldown(XueyingCooldown)
            App.Fail()
        }
    )
    let matcherAnswerYes = /^镇窟老道一见你，便如见救星：这位.+，可愿听老身一言？（answer yes）$/
    let matcherAcceptYes = /^老道这点微末道行已镇它不住，壮士可愿深入魔窟，斩了那血影魔君，绝此后患？（应承请说 accept yes）$/
    let PlanAccept = new App.Plan(
        App.Positions["Room"],
        (task) => {
            task.AddTrigger(matcherAnswerYes, (tri, result) => {
                App.Send("answer yes")
                return true
            })
            task.AddTrigger(matcherAcceptYes, (tri, result) => {
                App.Send("accept yes")
            })
            task.AddTimer(10000)
            $.RaiseStage("wait")
        },
        (result) => {
            App.Send("halt")
            App.Next()
        })
    Xueying.Entered = () => {
        Xueying.Data.Start = $.Now()
        Note("进入副本，打探地图")
        Quest.Cooldown(XueyingCooldown)
        App.Core.Fuben.Last = $.Now()
        Xueying.LastRoom = ""
        Xueying.Data.All++
        $.PushCommands(
            $.Plan(PlanAccept),
            $.Path(["s"]),
            $.Function(App.Core.Fuben.LoadMazeMap),//加载地图
            $.Function(Xueying.Maze)
        )
        $.Next()
    }
    Xueying.Maze = () => {
        App.Map.Room.ID = $.RID("fuben-xueying-entry2")
        if (App.Core.Fuben.Current == null) {
            Quest.Cooldown(XueyingCooldown)
            $.PushCommands(
                $.To("gc"),
            )
            $.Next()
            return
        }
        Xueying.AddApth()
        Xueying.Go()
    }
    Xueying.AddApth = () => {
        let entry = $.RID("fuben-xueying-entry2")
        let exit = $.RID("fuben-xueying-exit")
        App.Core.Fuben.Current.AddPath(entry, App.Core.Fuben.Current.Landmark["entry"], "s")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["entry"], entry, "n")
        App.Core.Fuben.Current.AddPath(exit, App.Core.Fuben.Current.Landmark["exit"], "n")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["exit"], exit, "s")
    }
    Xueying.Go = () => {
        $.PushCommands(
            $.To(["fuben-xueying-exit"], App.Map.SingleStep(), App.Core.Fuben.InFuben, App.Core.Fuben.OnBox),
            $.Function(() => {
                $.RaiseStage("prepare")
                $.Next()
            }),
            $.Kill("xueyingjun", App.NewCombat("xueying").WithTags("xueyingjun").WithKillInGroup(true)),
            $.Do("get silver from corpse;get gold from corpse"),
            $.Function(() => {
                App.Look()
                $.Next()
            }),
            $.Sync(),
            $.Function(() => {
                App.Map.Room.Data.Objects.Items.forEach(item => {
                    switch (item.IDLower) {
                        case "corpse":
                        case "skeleton":
                        case "long sword":
                            break
                        default:
                            App.Send(`get ${item.IDLower}`)//捡道具
                    }
                })
                App.Send("i")
                $.Next()
            }),
            $.To(["fuben-xueying-entry"], App.Map.SingleStep(), App.Core.Fuben.InFuben, App.Core.Fuben.OnBox),
            $.Do("report tai"),
            $.Sync(),
            $.Function(Xueying.Leave),
        ).WithFailCommand($.Function(Xueying.Leave))
        $.Next()
    }
    Xueying.Leave = () => {
        $.PushCommands(
            $.To(["fuben-xueying-exit2"], App.Map.SingleStep(), App.Core.Fuben.InFuben, App.Core.Fuben.OnBox),
            $.Path(["out"]),
            $.Function(() => {
                Quest.Cooldown(XueyingCooldown)
                App.Next()
            }),
            $.Prepare("commonWithExp"),
        )
        $.Next()
    }

    let Quest = App.Quests.NewQuest("xueying")
    Quest.Name = "血影"
    Quest.Desc = ""
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Group = "xueying"
    Quest.OnHUD = () => {
        return [
            new App.HUD.UI.Word("血影:"),
            new App.HUD.UI.Word(App.HUD.UI.ShortNumber(Xueying.Data.Success), 5, true),
        ]

    }
    Quest.OnSummary = () => {
        return [
            new App.HUD.UI.Word("血:"),
            new App.HUD.UI.Word(App.HUD.UI.ShortNumber(Xueying.Data.Success), 5, true),
        ]

    }
    Quest.OnReport = () => {
        let gift = []
        let giftdata = []
        for (var name in Xueying.Data.Gifts) {
            let rate = (Xueying.Data.Gifts[name] * 100 / Xueying.Data.Box).toFixed(2) + "%"
            giftdata.push({ label: `${name}:${Xueying.Data.Gifts[name]}件 (${rate})`, sum: Xueying.Data.Gifts[name] })
        }
        if (giftdata.length > 0) {
            giftdata.sort((a, b) => {
                return b.sum - a.sum
            })
            gift = giftdata.map(v => v.label)
        }
        let d = $.Now() - App.Quests.StartAt
        let eff = d > 0 ? (Xueying.Data.Success * 3600 * 1000 / d).toFixed(0) + "次/小时" : "-"
        let successrate = Xueying.Data.All > 0 ? (Xueying.Data.Success * 100 / Xueying.Data.All).toFixed(2) + "%" : "-"
        return [`血影-成功:${Xueying.Data.Success}次 成功率:${successrate} 毛效率:${eff}`]
    }
    Quest.Start = function (data) {
        Xueying.Start()
    }
    App.Core.Quest.AppendInitor((e) => {
        Xueying.Data = {
            Success: 0,
            All: 0,
            Gifts: {},
            Finished: false,
            Start: 0,
            Box: 0,
            GoodBox: 0,
            Migong: [],
        }
    })
    App.Quests.Register(Quest)
    App.Quests.Xueying = Xueying
    Quest.TimeCost = 30
    App.Core.Analytics.RegisterTask(Quest.ID, Quest.Name, Quest.Timeslice ? Quest.Timeslice : Quest.Name)

})