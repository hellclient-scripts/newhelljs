$.Module(function (App) {
    let Canghai = {}
    const CanghaiCooldown = 120000
    Canghai.Data = {
        Success: 0,
        All: 0,
        Finished: false,
        Start: 0,
    }
    //苍海窟建功，你获得了二万点经验、一点潜能、一点实战体会、二百点江湖阅历、能力得到了提升。
    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            task.AddCatcher("core.giftbouns", (catcher, event) => {
                if (event.Data.prompt == "苍海窟建功") {
                    Canghai.Data.Finished = true
                    App.Core.Analytics.Add(Quest.ID, App.CNumber.ParseNumber(event.Data.exp), App.CNumber.ParseNumber(event.Data.pot), App.CNumber.ParseNumber(event.Data.tihui))
                    Canghai.Data.Success++
                }
                return true
            })
            task.AddCatcher("core.fubenfail", (catcher, event) => {
                if (Canghai.Data.Finished) {
                    event.Context.Set("callback", () => {
                        Note("离开副本")
                        Quest.Cooldown(CanghaiCooldown)
                    })
                } else {
                    Note("副本失败")
                }
                Quest.Cooldown(CanghaiCooldown)
                return true
            })
        })
    Canghai.Start = () => {
        Canghai.Data.Finished = false
        PlanQuest.Execute()
        Canghai.Enter()
    }
    Canghai.Enter = () => {
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
            App.Send("unride;enter canghaiku")
            App.Sync()

        },
        (result) => {
            if (result.Task.Data == "ok") {
                Canghai.Entered()
                return
            }
            Note("进入失败")
            // App.Core.Timeslice.Change("")
            Quest.Cooldown(CanghaiCooldown)
            App.Fail()
        }
    )
    let matcherAnswerYes = /^老渔翁一见你，便如见救星：这位.+，可愿听老身一言？（answer yes）$/
    let matcherAcceptYes = /^（应承请说 accept yes）$/
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
    Canghai.Entered = () => {
        Canghai.Data.Start = $.Now()
        Note("进入副本，打探地图")
        Quest.Cooldown(CanghaiCooldown)
        App.Core.Fuben.Last = $.Now()
        Canghai.LastRoom = ""
        Canghai.Data.All++
        $.PushCommands(
            $.Plan(PlanAccept),
            $.Path(["s"]),
            $.Function(App.Core.Fuben.LoadMazeMap),//加载地图
            $.Function(Canghai.Maze)
        )
        $.Next()
    }
    Canghai.Maze = () => {
        App.Map.Room.ID = $.RID("fuben-canghai-entry2")
        if (App.Core.Fuben.Current == null) {
            Quest.Cooldown(CanghaiCooldown)
            $.PushCommands(
                $.To("gc"),
            )
            $.Next()
            return
        }
        Canghai.AddApth()
        Canghai.Go()
    }
    Canghai.AddApth = () => {
        let entry = $.RID("fuben-canghai-entry2")
        let exit = $.RID("fuben-canghai-exit")
        App.Core.Fuben.Current.AddPath(entry, App.Core.Fuben.Current.Landmark["entry"], "s")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["entry"], entry, "n")
        App.Core.Fuben.Current.AddPath(exit, App.Core.Fuben.Current.Landmark["exit"], "n")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["exit"], exit, "s")
    }
    Canghai.Go = () => {
        $.PushCommands(
            $.To(["fuben-canghai-exit"], App.Map.SingleStep(), App.Core.Fuben.InFuben, App.Core.Fuben.OnBox),
            $.Function(() => {
                $.RaiseStage("prepare")
                $.Next()
            }),
            $.Kill("haimo", App.NewCombat("canghai").WithTags("haimo").WithKillInGroup(true)),
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
            $.To(["fuben-canghai-entry"], App.Map.SingleStep(), App.Core.Fuben.InFuben, App.Core.Fuben.OnBox),
            $.Do("report yuweng"),
            $.Sync(),
            $.Function(Canghai.Leave),
        ).WithFailCommand($.Function(Canghai.Leave))
        $.Next()
    }
    Canghai.Leave = () => {
        $.PushCommands(
            $.To(["fuben-canghai-exit2"], App.Map.SingleStep(), App.Core.Fuben.InFuben, App.Core.Fuben.OnBox),
            $.Path(["out"]),
            $.Function(() => {
                Quest.Cooldown(CanghaiCooldown)
                App.Next()
            }),
            $.Prepare("commonWithExp"),
        )
        $.Next()
    }

    let Quest = App.Quests.NewQuest("canghai")
    Quest.Name = "苍海"
    Quest.Desc = ""
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Group = "canghai"
    Quest.OnHUD = () => {
        return [
            new App.HUD.UI.Word("苍海:"),
            new App.HUD.UI.Word(App.HUD.UI.ShortNumber(Canghai.Data.Success), 5, true),
        ]

    }
    Quest.OnSummary = () => {
        return [
            new App.HUD.UI.Word("苍:"),
            new App.HUD.UI.Word(App.HUD.UI.ShortNumber(Canghai.Data.Success), 5, true),
        ]

    }
    Quest.OnReport = () => {
        let gift = []
        let giftdata = []
        for (var name in Canghai.Data.Gifts) {
            let rate = (Canghai.Data.Gifts[name] * 100 / Canghai.Data.Box).toFixed(2) + "%"
            giftdata.push({ label: `${name}:${Canghai.Data.Gifts[name]}件 (${rate})`, sum: Canghai.Data.Gifts[name] })
        }
        if (giftdata.length > 0) {
            giftdata.sort((a, b) => {
                return b.sum - a.sum
            })
            gift = giftdata.map(v => v.label)
        }
        let d = $.Now() - App.Quests.StartAt
        let eff = d > 0 ? (Canghai.Data.Success * 3600 * 1000 / d).toFixed(0) + "次/小时" : "-"
        let successrate = Canghai.Data.All > 0 ? (Canghai.Data.Success * 100 / Canghai.Data.All).toFixed(2) + "%" : "-"
        return [`苍海-成功:${Canghai.Data.Success}次 成功率:${successrate} 毛效率:${eff}`]
    }
    Quest.Start = function (data) {
        Canghai.Start()
    }
    App.Core.Quest.AppendInitor((e) => {
        Canghai.Data = {
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
    App.Quests.Canghai = Canghai
    Quest.TimeCost = 30
    App.Core.Analytics.RegisterTask(Quest.ID, Quest.Name, Quest.Timeslice ? Quest.Timeslice : Quest.Name)

})