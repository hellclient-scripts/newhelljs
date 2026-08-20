$.Module(function (App) {
    let Leize = {}
    const LeizeCooldown = 120000
    class Context {
        constructor() {
            this.Leipo = 0
        }
    }
    Leize.Data = {
        Success: 0,
        All: 0,
        Finished: false,
        Context: null,
        Start: 0,
    }
    //雷泽·九霄雷渊建功，你获得了二万点经验、一点潜能、一点实战体会、二百点江湖阅历、能力得到了提升。
    let matcherLeipo = "雷魄妖卒扑在地上挣扎了几下，腿一伸，口中喷出几口鲜血，死了！"
    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            task.AddCatcher("core.giftbouns", (catcher, event) => {
                if (event.Data.prompt == "雷泽·九霄雷渊建功") {
                    Leize.Data.Finished = true
                    App.Core.Analytics.Add(Quest.ID, App.CNumber.ParseNumber(event.Data.exp), App.CNumber.ParseNumber(event.Data.pot), App.CNumber.ParseNumber(event.Data.tihui))
                    Leize.Data.Success++
                }
                return true
            })
            task.AddTrigger(matcherLeipo, (result) => {
                Leize.Data.Context.Leipo++
                return true
            });
            task.AddCatcher("core.fubenfail", (catcher, event) => {
                if (Leize.Data.Finished) {
                    event.Context.Set("callback", () => {
                        Note("离开副本")
                        Quest.Cooldown(LeizeCooldown)
                    })
                } else {
                    Note("副本失败")
                }
                Quest.Cooldown(LeizeCooldown)
                return true
            })
        })
    Leize.Start = () => {
        Leize.Data.Finished = false
        Leize.Data.Context = new Context()
        PlanQuest.Execute()
        Leize.Enter()
    }
    Leize.Enter = () => {
        $.PushCommands(
            $.Prepare("commonWithExp"),
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
            App.Send("unride;enter leize")
            App.Sync()

        },
        (result) => {
            if (result.Task.Data == "ok") {
                Leize.Entered()
                return
            }
            Note("进入失败")
            // App.Core.Timeslice.Change("")
            Quest.Cooldown(LeizeCooldown)
            App.Fail()
        }
    )
    let matcherAnswerYes = /^守泽雷叟一见你，便如见救星：这位壮士，可愿听老身一言？（answer yes）$/
    let matcherAcceptYes = /^壮士可有此胆识？（应承请说 accept yes）$/
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
    Leize.Entered = () => {
        Leize.Data.Start = $.Now()
        Note("进入副本，打探地图")
        Quest.Cooldown(LeizeCooldown)
        App.Core.Fuben.Last = $.Now()
        Leize.LastRoom = ""
        Leize.Data.All++
        $.PushCommands(
            $.Plan(PlanAccept),
            $.Path(["s"]),
            $.Function(App.Core.Fuben.LoadMazeMap),//加载地图
            $.Function(Leize.Maze)
        )
        $.Next()
    }
    Leize.Maze = () => {
        App.Map.Room.ID = $.RID("fuben-leize-entry2")
        if (App.Core.Fuben.Current == null) {
            Quest.Cooldown(LeizeCooldown)
            $.PushCommands(
                $.To("gc"),
            )
            $.Next()
            return
        }
        Leize.AddApth()
        Leize.Search()
    }
    Leize.AddApth = () => {
        let entry = $.RID("fuben-leize-entry2")
        let exit = $.RID("fuben-leize-exit")
        App.Core.Fuben.Current.AddPath(entry, App.Core.Fuben.Current.Landmark["entry"], "s")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["entry"], entry, "n")
        App.Core.Fuben.Current.AddPath(exit, App.Core.Fuben.Current.Landmark["exit"], "n")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["exit"], exit, "s")
    }
    Leize.KillLeipo = (snap) => {
        if (Leize.Data.Context.Leipo >= 4) {
            App.Map.Rollback(snap)
            App.Map.FinishMove()
            return
        }
        if (App.Map.Room.Data.Objects.FindByIDLower("leipo").First() == null) {
            App.Map.Rollback(snap)
            App.Map.Move.Walk(App.Map)
            return
        }
        $.RaiseStage("prepare")
        App.Commands.Insert(
            App.NewKillCommand("leipo", App.NewCombat("leize").WithTags(`leipo`)),
            $.Do("i"),
            $.Function(() => {
                App.Look()
                $.Next()
            }),
            $.Rest(),
            $.Sync(),
            $.Function(() => { Leize.KillLeipo(snap) })
        )
        App.Next()
    }

    Leize.Wanted = (move, map, step) => {
        move.Option.MultipleStep = false
        move.OnArrive = function (move, map) {
            if (App.Map.Room.Data.Objects.FindByLabel("宝箱").First()) {
                App.Send("open bao xiang;get all from bao xiang")
            }
            if (Leize.Data.Context.Leipo < 4 && App.Map.Room.Data.Objects.FindByIDLower("leipo").First()) {
                Leize.KillLeipo(App.Map.Snap())
                return
            }
            move.Walk(map)

        }
    }
    Leize.Search = () => {
        $.RaiseStage("prepare")
        $.Sync(),
            $.PushCommands(
                $.Rooms(App.Core.Fuben.Current.Rooms, App.Core.Fuben.InFuben, Leize.Wanted),
                $.Function(Leize.Go)
            )
        $.Next()
    }
    Leize.Go = () => {
        $.PushCommands(
            $.To(["fuben-leize-exit"], App.Map.SingleStep(), App.Core.Fuben.InFuben, App.Core.Fuben.OnBox),
            $.Function(() => {
                $.RaiseStage("prepare")
                $.Next()
            }),
            $.Kill("leishou", App.NewCombat("leize").WithTags("leishou").WithKillInGroup(true)),
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
            $.To(["fuben-leize-entry"], App.Map.SingleStep(), App.Core.Fuben.InFuben, App.Core.Fuben.OnBox),
            $.Do("report yuweng"),
            $.Sync(),
            $.Function(Leize.Leave),
        ).WithFailCommand($.Function(Leize.Leave))
        $.Next()
    }
    Leize.Leave = () => {
        $.PushCommands(
            $.To(["fuben-leize-exit2"], App.Map.SingleStep(), App.Core.Fuben.InFuben, App.Core.Fuben.OnBox),
            $.Path(["out"]),
            $.Function(() => {
                Quest.Cooldown(LeizeCooldown)
                App.Next()
            }),
            $.Prepare("commonWithExp"),
        )
        $.Next()
    }

    let Quest = App.Quests.NewQuest("leize")
    Quest.Name = "雷泽"
    Quest.Desc = ""
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Group = "leize"
    Quest.OnHUD = () => {
        return [
            new App.HUD.UI.Word("雷泽:"),
            new App.HUD.UI.Word(App.HUD.UI.ShortNumber(Leize.Data.Success), 5, true),
        ]

    }
    Quest.OnSummary = () => {
        return [
            new App.HUD.UI.Word("雷:"),
            new App.HUD.UI.Word(App.HUD.UI.ShortNumber(Leize.Data.Success), 5, true),
        ]

    }
    Quest.OnReport = () => {
        let gift = []
        let giftdata = []
        for (var name in Leize.Data.Gifts) {
            let rate = (Leize.Data.Gifts[name] * 100 / Leize.Data.Box).toFixed(2) + "%"
            giftdata.push({ label: `${name}:${Leize.Data.Gifts[name]}件 (${rate})`, sum: Leize.Data.Gifts[name] })
        }
        if (giftdata.length > 0) {
            giftdata.sort((a, b) => {
                return b.sum - a.sum
            })
            gift = giftdata.map(v => v.label)
        }
        let d = $.Now() - App.Quests.StartAt
        let eff = d > 0 ? (Leize.Data.Success * 3600 * 1000 / d).toFixed(0) + "次/小时" : "-"
        let successrate = Leize.Data.All > 0 ? (Leize.Data.Success * 100 / Leize.Data.All).toFixed(2) + "%" : "-"
        return [`雷泽-成功:${Leize.Data.Success}次 成功率:${successrate} 毛效率:${eff}`]
    }
    Quest.Start = function (data) {
        Leize.Start()
    }
    App.Core.Quest.AppendInitor((e) => {
        Leize.Data = {
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
    App.Quests.Leize = Leize
    Quest.TimeCost = 30
    App.Core.Analytics.RegisterTask(Quest.ID, Quest.Name, Quest.Timeslice ? Quest.Timeslice : Quest.Name)

})