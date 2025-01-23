//打血魔的任务模块
$.Module(function (App) {
    let Xuemo = {}
    Xuemo.All = 0
    Xuemo.Success = 0
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
        Finish: false,
    }
    //全局计划，统计每一种npc是否打完
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
            task.AddTrigger("杀死 幽冥之眼: 3/3。", () => {
                Xuemo.Data.幽灵之眼 = true
                return true
            })
            task.AddTrigger("杀死 幽冥之火: 3/3。", () => {
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
            task.AddTrigger("超度 亡灵: 10/10 。", () => {
                Xuemo.Data.Finish = true
                return true
            })

            task.AddCatcher("core.onexit", () => {
                if (!App.Map.Room.ID) {
                    if (App.Map.Room.Name == "聚灵法阵" && Xuemo.Data.聚灵法阵) {
                        App.Map.Room.ID = Xuemo.Data.聚灵法阵
                    }
                }
                return true
            })
            task.AddCatcher("core.fubenfail", () => {
                Quest.Cooldown(120000)
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

        },
        (result) => {
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
            Finish: false,

        }
        PlanQuest.Execute()
        Xuemo.Enter()
    }
    Xuemo.Enter = () => {
        App.Checker.GetCheck("weaponduration").Force()
        $.PushCommands(
            $.Prepare("commonWithStudy", { WeaponDurationMin: 80 }),
            $.To("2977"),
            $.Plan(PlanEnter)
        )
        $.Next()
    }
    //进副本
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
    //检查地图
    Xuemo.Entered = () => {
        Xuemo.All++
        Note("进入副本，打探地图")
        Quest.Cooldown(120000)
        App.Core.Fuben.Last = $.Now()
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
    let macherAnswer = /^丁一有气无力地说道：这位.+，能听我一言吗？\(answer yes\/no\)$/
    //找丁一的计划
    let PlanFindDingyi = new App.Plan(
        App.Positions["Connect"],
        (task, plan, data) => {
            task.AddTrigger(macherAnswer, function (tri, result) {
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
            task.AddTrigger("你推开了棺材，但是里面什么都没有。").WithName("fail")
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
    //找丁一
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
    //离开副本
    Xuemo.Leave = () => {
        $.PushCommands(
            $.To("2981"),
            $.Path(["out"]),
            $.Function(() => {
                Quest.Cooldown(120000)
                App.Next()
            })
        )
        $.Next()
    }
    //杀npc
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
                $.RaiseStage("prepare")
                $.Sync(),
                    App.Map.Rollback(snap)
                switch (Xuemo.Data.Step) {
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
    //检查是否有巫妖
    Xuemo.ChecSkeletonLich = () => {
        if (App.Map.Room.Name != "聚灵法阵") {
            App.Commands.Insert(
                $.To(Xuemo.Data.聚灵法阵),
                $.Function(Xuemo.KillSkeletonLich)
            )
            App.Next()
            return
        }
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
    //杀巫妖
    Xuemo.KillSkeletonLich = () => {
        let sklive = App.Map.Room.Data.Objects.FindByName("巫妖").First()
        let killcmd
        if (sklive) {
            killcmd = "kill skeleton lich"
        } else {
            let cmds = []
            App.Map.Room.Data.Objects.Items.forEach((item) => {
                if (item.IDLower != "ding yi") {
                    cmds.push(`kill ${item.IDLower}`)
                }
            })
            killcmd = cmds.join(";")
        }
        App.Commands.Insert(
            App.NewKillCommand("", App.NewCombat("xuemo").WithCommand(killcmd).WithTags(sklive ? "sklich" : `step-${Xuemo.Data.Step}`).WithKillInGroup(sklive)),
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
    //遍历
    Xuemo.Wanted = (move, map, step) => {
        move.Option.MultipleStep = false
        move.OnArrive = function (move, map) {
            if (!Xuemo.Data.聚灵法阵 && App.Map.Room.Name == "聚灵法阵") {
                Xuemo.Data.聚灵法阵 = App.Map.Room.ID
            }
            let objs = App.Map.Room.Data.Objects.ExcludeID("Corpse")
            switch (Xuemo.Data.Step) {
                case 4:
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
                    if (App.Map.Room.Data.Objects.FindByName("巫妖").First() == null) {
                        let cmds = []
                        if (Xuemo.Data.僵尸 == false && objs.FindByName("僵尸").First()) {
                            cmds.push("kill zombie")
                        }
                        if (Xuemo.Data.骷髅 == false && objs.FindByName("骷髅").First()) {
                            cmds.push("kill skeleton")
                        }
                        if (Xuemo.Data.幽灵 == false && objs.FindByName("幽灵").First()) {
                            cmds.push("kill ghost")
                        }
                        if (cmds.length) {
                            Xuemo.KillAll(cmds.join(";"))
                            return
                        }
                    }
                    move.Walk(map)
                    return
                case 2:
                    Note("寻找第二步NPC")
                    if (App.Map.Room.Data.Objects.FindByName("巫妖").First() == null) {
                        let cmds = []
                        if (Xuemo.Data.骷髅武士 == false && objs.FindByName("骷髅武士").First()) {
                            cmds.push("kill skeleton fighter")
                        }
                        if (Xuemo.Data.骷髅法师 == false && objs.FindByName("骷髅法师").First()) {
                            cmds.push("kill skeleton mage")
                        }
                        if (Xuemo.Data.幽灵之眼 == false && objs.FindByName("幽冥之眼").First()) {
                            cmds.push("kill ghost eye")
                        }
                        if (Xuemo.Data.幽灵之火 == false && objs.FindByName("幽冥之火").First()) {
                            cmds.push("kill ghost fire")
                        }
                        if (Xuemo.Data.血僵尸 == false && objs.FindByName("血僵尸").First()) {
                            cmds.push("kill blood zombie")
                        }
                        if (Xuemo.Data.尸煞 == false && objs.FindByName("尸煞").First()) {
                            cmds.push("kill power zombie")
                        }
                        if (cmds.length) {
                            Xuemo.KillAll(cmds.join(";"))
                            return
                        }
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
    //搜索逻辑
    Xuemo.Search = () => {
        $.RaiseStage("prepare")
        $.Sync(),
            $.PushCommands(
                $.Rooms(App.Core.Fuben.Current.Rooms, Xuemo.Wanted),
                $.To("2978"),
                $.Function(() => {
                    if (Xuemo.Data.Step == 4) {
                        App.Send("give all to ding yi")
                    }
                    PlanReport.Execute()

                })
            )
        $.Next()

    }
    //Report给丁一作下一步的计划
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
            task.AddTrigger("丁一说道：法阵那里可能还有些血魔的手下......你从前面带路吧！", function (tri, result) {
                Xuemo.Data.Step = 5
            }).WithName("start")
            task.AddTrigger("丁一狂笑道：我丁一，现在就是血魔！血魔就是我！", function (tri, result) {
                Xuemo.Data.Step = 7
            }).WithName("start")
            if (Xuemo.Data.Step == 3) {
                App.Send("give spirit tower to ding yi")
            }
            task.AddTrigger("你委屈的说道：“我头上好多的小包包。”说完眼泪就掉了下来，一片凄惨。").WithName("fail")
            App.Send("report")
        },
        (result) => {
            App.Send("halt")
            if (result.Name == "start") {
                if (Xuemo.Data.Step == 5) {
                    $.PushCommands(
                        $.Wait(2000),
                        $.To(Xuemo.Data.聚灵法阵),
                        $.Wait(3000),
                        $.Do("team talk 血魔副本杀亡灵"),
                        $.Function(() => {
                            App.Look()
                            $.Next()
                        }),
                        $.Sync(),
                        $.Function(Xuemo.Clean),
                        $.Do("report"),
                        $.Plan(PlanSkeleton),
                    )
                    App.Next()
                    return
                }
                if (Xuemo.Data.Step == 7) {
                    Xuemo.KillDingyi()
                    return
                }
                Note("开始杀")
                Xuemo.Search()
                return
            }
            Xuemo.Leave()
        }
    )
    //杀骷髅的计划
    let PlanSkeleton = new App.Plan(
        App.Positions["Connect"],
        (task, plan, data) => {
            task.AddTrigger("聚灵塔上光华一闪，一个鬼灵被吸了过来！")
            Xuemo.Data.Step = 6
        },
        (result) => {
            Xuemo.KillSkeleton()
        })
    //杀光房间的计划
    Xuemo.Clean = () => {
        $.PushCommands(
            $.Function(() => {
                App.Look()
                $.Next()
            }),
            $.Sync(),
            $.Function(() => {
                let sklive = false
                let killcmd = []
                App.Map.Room.Data.Objects.Items.forEach((item) => {
                    if (item.IDLower == "skeleton lich") {
                        sklive = true
                    }
                    if (item.IDLower != "ding yi" && item.IDLower != "corpse") {
                        killcmd.push(`kill ${item.IDLower}`)
                    }
                })
                $.Insert(
                    App.NewKillCommand("", App.NewCombat("xuemo").WithCommand(killcmd.join(";")).WithTags(sklive ? "sklich" : `step-${Xuemo.Data.Step}`)),
                )
                App.Next()
            })
        )
        App.Next()
    }
    //杀骷髅
    Xuemo.KillSkeleton = () => {
        $.PushCommands(
            $.Function(Xuemo.Clean),
            $.Function(() => {
                if (Xuemo.Data.Finish) {
                    PlanReport.Execute()
                } else {
                    PlanSkeleton.Execute()
                }
            })
        )
        App.Next()
    }
    //杀丁一
    Xuemo.KillDingyi = () => {
        $.Insert(
            $.Do("team talk 血魔副本杀丁一"),
            App.NewKillCommand("", App.NewCombat("xuemo").WithCommand("kill ding yi").WithTags(`boss`)),
            $.Nobusy(),
            $.Do("get all;drop long sword;drop cloth;drop corpse;drop skeleton;i"),
            $.Function(() => {
                Xuemo.Success++
                Xuemo.Leave()
            })
        )
        $.Next()
    }
    App.BindEvent("core.queststart", (e) => {
        Xuemo.All = 0
        Xuemo.Success = 0
    })
    //任务实例
    let Quest = App.Quests.NewQuest("xuemo")
    Quest.Name = "血魔副本"
    Quest.Desc = ""
    Quest.Intro = ""
    Quest.Help = ""
    Quest.OnHUD = () => {
        return [
            new App.HUD.UI.Word("血魔:"),
            new App.HUD.UI.Word(App.HUD.UI.ShortNumber(Xuemo.Success), 5, true),
        ]
    }
    Quest.OnSummary = () => {
        return [
            new App.HUD.UI.Word("血:"),
            new App.HUD.UI.Word(App.HUD.UI.ShortNumber(Xuemo.Success), 5, true),
        ]
    }
    Quest.OnReport = () => {
        let rate = Xuemo.All > 0 ? (Xuemo.Success * 100 / Xuemo.All).toFixed(0) + "%" : "-"
        return [`血魔-成功 ${Xuemo.Success}次 共计 ${Xuemo.All}次 成功率 ${rate}`]
    }
    Quest.Start = function (data) {
        Xuemo.Start()
    }
    App.Quests.Register(Quest)
    App.Quests.Xuemo = Xuemo
})