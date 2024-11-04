$.Module(function (App) {
    let Xuemo = {}
    Xuemo.Data = {
        Step: 0,
        "僵尸": false,
        "骷髅": false,
        "幽灵": false,
    }
    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            task.AddTrigger("杀死 僵尸: 8/8。", () => {
                Xuemo.Data.僵尸 = true
                return true
            })
            task.AddTrigger("杀死 骷髅: 8/8。", () => {
                Xuemo.Data.骷髅 = true
                return true
            })
            task.AddTrigger("杀死 幽灵: 8/8。", () => {
                Xuemo.Data.幽灵 = true
                return true
            })
        }
    )
    Xuemo.Start = () => {
        Xuemo.Data = {
            Step: 0,
            "僵尸": false,
            "骷髅": false,
            "幽灵": false,
        }
        PlanQuest.Execute()
        Xuemo.Enter()
    }
    Xuemo.Enter = () => {
        $.PushCommands(
            $.Prepare(),
            $.To("2977"),
            $.Plan(PlanEnter)
        )
        $.Next()
    }
    let PlanEnter = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.AddTrigger("祝你好运气！", (tri, result) => {
                task.Data = "ok"
                return true
            })
            App.Send("unride;enter door")
            App.Sync()

        },
        (result) => {
            if (result.Task.Data == "ok") {
                Xuemo.Entered()
                return
            }
            Note("进入失败")
            Quest.Cooldown(120000)
            App.Fail()
        }
    )
    Xuemo.Entered = () => {
        Note("进入副本，打探地图")
        Quest.Cooldown(120000)
        $.PushCommands(
            $.Prepare(),
            $.Path(["s"]),
            $.Function(App.Core.Fuben.LoadMazeMap),
            $.Path(["n"]),
            $.Function(Xuemo.FindDingyi),
        )
        $.Next()
    }
    Xuemo.AddApth = () => {
        App.Core.Fuben.Current.AddPath("2979", App.Core.Fuben.Current.Landmark["entry"], "s")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["entry"], "2979", "n")
        App.Core.Fuben.Current.AddPath("2980", App.Core.Fuben.Current.Landmark["exit"], "n")
        App.Core.Fuben.Current.AddPath(App.Core.Fuben.Current.Landmark["exit"], "2980", "s")
    }
    let PlanFindDingyi = new App.Plan(
        App.Positions["Connect"],
        (task, plan, data) => {
            task.AddTrigger("丁一有气无力地说道：这位壮士，能听我一言吗？(answer yes/no)", function (tri, result) {
                App.Send("answer yes")
                $.RaiseStage("wait")
                return true
            })
            task.AddTrigger("丁一说道：你可愿意帮我们对付血魔？(accept yes/no)", function (tri, result) {
                plan.Position.Wait(1000, 0, () => {
                    App.Send("halt")
                    App.Send("accept yes")
                })
                return true
            })
            task.AddTrigger("丁一说道：就请你证明尚未被血魔诱惑: 杀八个骷髅，八个幽灵，八个僵尸。", function (tri, result) {
                Xuemo.Data.Step = 1
            }).WithName("start")
            task.AddTimer(60000)
            App.Send("push coffin")
        },
        (result) => {
            if (result.Name == "start") {
                Note("开始杀")
                Xuemo.Search()
                return
            }
            Xuemo.Leave()
        }
    )
    Xuemo.FindDingyi = () => {
        App.Map.Room.ID = "2978"
        Xuemo.AddApth()
        if (App.Map.Room.Data.Objects.FindByID("Ding yi").First()) {
            Note("已经有丁一了，不是新副本，尝试离开")
            Xuemo.Leave()
            return
        }
        if (App.Core.Fuben.Current == null) {
            Quest.Cooldown(120000)
            App.Send("quit")
            return
        }
        PlanFindDingyi.Execute()
    }
    Xuemo.Leave = () => {
        $.PushCommands(
            $.To("2981"),
            $.Function(() => { }),
        )
        $.Next()
    }
    Xuemo.KillAll = () => {
        let snap = App.Map.Snap()
        let cmd = []
        App.Map.Room.Data.Objects.Items.forEach(obj => {
            if (obj.ID.indexOf(" ") > -1) {
                cmd.push(`kill ${obj.IDLower}`)
            }
        });
        App.Commands.Insert(
            App.NewKillCommand("", App.NewCombat("xuemo").WithCommand(cmd.join("\n"))),
            $.Rest(),
            $.Function(() => {
                App.Map.Rollback(snap)
                App.Map.Move.Walk(App.Map)
            })
        )
        App.Next()

    }
    Xuemo.Wanted = (move, map, step) => {
        move.Option.MutlipleStep = false
        move.OnArrive = function (move, map) {
            let objs = App.Map.Room.Data.Objects
            if (objs.Sum() > 5) {
                move.Walk(map)
                return
            }
            switch (Xuemo.Data.Step) {
                case 1:
                    Note("寻找第一步NPC")
                    if ((Xuemo.Data.僵尸 == false && objs.SearchName("僵尸").First()) || (Xuemo.Data.骷髅 == false && objs.SearchName("骷髅").First()) || (Xuemo.Data.幽灵 == false && objs.SearchName("幽灵").First())) {
                        Xuemo.KillAll()
                        return
                    }
                    move.Walk(map)
                    return
            }
        }
    }

    Xuemo.Search = () => {
        $.RaiseStage("prepare")
        $.PushCommands(
            $.Rooms(App.Core.Fuben.Current.Rooms, Xuemo.Wanted),
        )
        $.Next()
    }

    let Quest = App.Quests.NewQuest("xuemo")
    Quest.Name = "血魔副本"
    Quest.Desc = ""
    Quest.Intro = ""
    Quest.Help = ""
    Quest.OnHUD = () => {
        return null
    }
    Quest.OnSummary = () => {
        return null
    }
    Quest.OnReport = () => {
        return null
    }
    Quest.Start = function (data) {
        Xuemo.Start()
    }
    App.Quests.Register(Quest)
    App.Quests.Xuemo = Xuemo
})