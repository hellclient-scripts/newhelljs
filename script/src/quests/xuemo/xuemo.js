$.Module(function (App) {
    let Xuemo = {}
    Xuemo.Data = {
        Step: 0,
        "僵尸": false,
        "骷髅": false,
        "幽灵": false,
        "骷髅武士": false,
        "骷髅法师": false,
        "幽灵之眼": false,
        "幽灵之火": false,
        "血僵尸": false,
        "尸煞": false,
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
            task.AddTrigger("杀死 骷髅武士: 3/3。", () => {
                Xuemo.Data.骷髅武士 = true
                return true
            })
            task.AddTrigger("杀死 骷髅法师: 3/3。", () => {
                Xuemo.Data.骷髅法师 = true
                return true
            })
            task.AddTrigger("杀死 幽灵之眼: 3/3。", () => {
                Xuemo.Data.幽灵之眼 = true
                return true
            })
            task.AddTrigger("杀死 幽灵之火: 3/3。", () => {
                Xuemo.Data.幽灵之火 = true
                return true
            })
            task.AddTrigger("杀死 血僵尸: 3/3。", () => {
                Xuemo.Data.血僵尸 = true
                return true
            })
            task.AddTrigger("杀死 尸煞: 3/3。", () => {
                Xuemo.Data.尸煞 = true
                return true
            })
            task.AddTrigger("你吓得扭头就跑! ", () => {
                App.Map.Room.ID = ""
                return true
            })
            task.AddTrigger("巫妖扑在地上挣扎了几下，腿一伸，口中喷出几口鲜血，死了！", () => {
                App.Send("get bone staff;i")
                return true
            })
            task.AddTrigger("僵尸王扑在地上挣扎了几下，腿一伸，口中喷出几口鲜血，死了！", () => {
                App.Send("get zombie blood;i")
                return true
            })
            task.AddTrigger("幽冥魔扑在地上挣扎了几下，腿一伸，口中喷出几口鲜血，死了！", () => {
                App.Send("get ghost fire;i")
                return true
            })

            Dump("开始血魔任务")
        },
        (result) => {
            Dump("退出血魔任务")
        }
    )
    Xuemo.Start = () => {
        Xuemo.Data = {
            Step: 0,
            "巫妖": false,
            "僵尸": false,
            "骷髅": false,
            "幽灵": false,
            "骷髅武士": false,
            "骷髅法师": false,
            "幽灵之眼": false,
            "幽灵之火": false,
            "血僵尸": false,
            "尸煞": false,

        }
        PlanQuest.Execute()
        Xuemo.Enter()
    }
    Xuemo.Enter = () => {
        App.Checker.GetCheck("weaponduration").Force()
        $.PushCommands(
            $.Prepare("", { WeaponDurationMin: 80 }),
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
                // Xuemo.Data.Step = 1
                Xuemo.Data.Step = 0
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
            $.Path(["out"]),
            $.Function(() => { }),
        )
        $.Next()
    }
    Xuemo.KillAll = (killcmd) => {
        let snap = App.Map.Snap()
        if (!killcmd) {
            let cmd = []
            App.Map.Room.Data.Objects.Items.forEach(obj => {
                cmd.push(`kill ${obj.IDLower}`)
            });
            killcmd = cmd.join("\n")
        }
        if (App.Map.Room.ID) {
            Xuemo.Data.LastCombatRoom = App.Map.Room.ID
        }
        App.Commands.Insert(
            App.NewKillCommand("", App.NewCombat("xuemo").WithCommand(killcmd).WithTags(`step-${Xuemo.Data.Step}`)),
            $.Do("i"),
            $.Rest(),
            $.Sync(),
            $.Function(() => {
                App.Map.Rollback(snap)
                switch (Xuemo.Data.Step) {
                    case 0:
                        if (App.Map.Room.Name = "聚灵法阵") {

                        }
                        break
                    case 1:
                        if (Xuemo.Data.僵尸 && Xuemo.Data.骷髅 && Xuemo.Data.幽灵) {
                            App.Map.FinishMove()
                            return
                        }
                        break
                    case 2:
                        if (
                            Xuemo.Data.骷髅武士 &&
                            Xuemo.Data.骷髅法师 &&
                            Xuemo.Data.幽灵之眼 &&
                            Xuemo.Data.幽灵之火 &&
                            Xuemo.Data.血僵尸 &&
                            Xuemo.Data.尸煞
                        ) {
                            App.Map.FinishMove()
                            return
                        }
                        break
                    case 3:
                        App.Send("get spirit tower from corpse;get spirit tower")
                        App.Map.FinishMove()
                        return
                    case 4:
                        return
                }
                if (App.Map.Room.ID) {
                    App.Map.Move.Walk(App.Map)
                } else {
                    Note("跑开了，重新定位")
                    App.Map.Retry()
                }
                Xuemo.Data.LastCombatRoom = ""
            })
        )
        App.Next()

    }
    Xuemo.ChecSkeletonLich = () => {
        if (App.Map.Room.Data.Objects.FindByName("巫妖").First() ||
            App.Map.Room.Data.Objects.FindByName("幽冥魔").First() ||
            App.Map.Room.Data.Objects.FindByName("僵尸王").First()) {
            Xuemo.KillSkeletonLich()
            return
        }
        Xuemo.Data.巫妖 = true
        App.Map.Rollback(Xuemo.Data.Snap)
        App.Map.FinishMove()
    }
    Xuemo.KillSkeletonLich = () => {
        let sklive = App.Map.Room.Data.Objects.FindByName("巫妖").First()
        let killcmd = sklive ? "kill skeleton lich" : "kill lord zombie;kill ghost devil"
        App.Commands.Insert(
            App.NewKillCommand("", App.NewCombat("xuemo").WithCommand(killcmd).WithTags(`step-${Xuemo.Data.Step}`).WithKillInGroup(sklive)),
            $.Rest(),
            $.To(Xuemo.Data.聚灵法阵),
            $.Function(() => {
                App.Send("get bone staff;get zombie blood;get ghost fire;i")
                App.Look()
                $.Next()
            }),
            $.Sync(),
            $.Function(Xuemo.ChecSkeletonLich)
        )
        App.Next()
    }
    Xuemo.Wanted = (move, map, step) => {
        move.Option.MutlipleStep = false
        move.OnArrive = function (move, map) {
            if (!Xuemo.Data.聚灵法阵 && App.Map.Room.Name == "聚灵法阵") {
                Xuemo.Data.聚灵法阵 = App.Map.Room.ID
            }
            let objs = App.Map.Room.Data.Objects.ExcludeID("Corpse")
            switch (Xuemo.Data.Step) {
                case 0:
                    Note("寻找巫妖")
                    if (App.Map.Room.Name == "聚灵法阵") {
                        Xuemo.Data.Snap = App.Map.Snap()
                        Xuemo.KillSkeletonLich()
                        return
                    }
                    move.Walk(map)
                    return
                case 1:
                    Note("寻找第一步NPC")
                    if ((Xuemo.Data.僵尸 == false && objs.FindByName("僵尸").First()) || (Xuemo.Data.骷髅 == false && objs.FindByName("骷髅").First()) || (Xuemo.Data.幽灵 == false && objs.FindByName("幽灵").First())) {
                        Xuemo.KillAll()
                        return
                    }
                    move.Walk(map)
                    return
                case 2:
                    Note("寻找第二步NPC")
                    if ((Xuemo.Data.骷髅武士 == false && objs.FindByName("骷髅武士").First()) ||
                        (Xuemo.Data.骷髅法师 == false && objs.FindByName("骷髅法师").First()) ||
                        (Xuemo.Data.幽灵之眼 == false && objs.FindByName("幽冥之眼").First()) ||
                        (Xuemo.Data.幽灵之火 == false && objs.FindByName("幽冥之火").First()) ||
                        (Xuemo.Data.血僵尸 == false && objs.FindByName("血僵尸").First()) ||
                        (Xuemo.Data.尸煞 == false && objs.FindByName("尸煞").First())
                    ) {
                        Xuemo.KillAll()
                        return
                    }
                    move.Walk(map)
                    return
                case 3:
                    Note("寻找第三步NPC")
                    if (App.Map.Room.Name == "荒庙") {
                        App.Send("push coffin")
                        App.PushCommands(
                            $.Function($ => { Xuemo.KillAll("kill xin wu") }),
                        )
                        App.Next()
                        return
                    }
                    move.Walk(map)
                    return
                case 4:
                    Note("寻找第四步NPC")
                    if (App.Map.Room.Name == "聚灵法阵") {
                        Xuemo.KillAll()
                        return
                    }
                    move.Walk(map)
                    return
            }
        }
    }

    Xuemo.Search = () => {
        if (Xuemo.Data.Step == 4) {
            App.Send("give all to ding yi")
            PlanReport.Execute()
            return
        }
        $.RaiseStage("prepare")
        $.PushCommands(
            $.Rooms(App.Core.Fuben.Current.Rooms, Xuemo.Wanted),
            $.To("2978"),
            $.Function(() => {
                if (Xuemo.Data.Step == 0 && Xuemo.Data.巫妖) {
                    Xuemo.Data.Step = 1
                    Xuemo.Search()
                } else {
                    PlanReport.Execute()
                }
            })
        )
        $.Next()

    }
    let PlanReport = new App.Plan(
        App.Positions["Connect"],
        (task, plan, data) => {
            task.AddTrigger("丁一说道：好...做得不错!", function (tri, result) {
                $.RaiseStage("wait")
                return true
            })
            task.AddTrigger("丁一说道：去尝试着杀掉三个骷髅武士，三个骷髅法师，三个幽灵之眼，三个幽灵之火，三个血僵尸，和三个尸煞。", function (tri, result) {
                Xuemo.Data.Step = 2
            }).WithName("start")
            task.AddTrigger("丁一说道：去找到那些堕落的少林和尚，杀了他们。他们手中有个法器，可以对付血魔。", function (tri, result) {
                Xuemo.Data.Step = 3
            }).WithName("start")
            task.AddTrigger("丁一说道：巫妖的骨杖，幽冥魔的幽冥之火，僵尸王的僵尸血，各取一样来！", function (tri, result) {
                Xuemo.Data.Step = 4
            }).WithName("start")
            if (Xuemo.Data.Step == 3) {
                App.Send("give spirit tower to ding yi")
            }
            App.Send("report")
        },
        (result) => {
            App.Send("halt")
            if (result.Name == "start") {
                Note("开始杀")
                Xuemo.Search()
                return
            }
            Xuemo.Leave()

        }
    )
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