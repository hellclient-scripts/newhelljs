//assist模块 被辅助
$.Module(function (App) {
    let Assisted = {}
    //任务NPC实例
    class NPC {
        constructor(name) {
            this.Name = name
        }
        Name = ""
        ID = ""
        Zone = ""
        Times = 0
        Die = false
        Fled = false
        First = true
        NotKilled = true
        Info = []
        Farlist = null
        Head = false
        //设置NPC为逃跑
        Flee() {
            this.First = false
            this.Fled = true
            this.Info = [...Cities[this.Zone].Info]
        }
        //设置区域
        SetZone(zone) {
            this.Zone = zone
            this.Fled = false
            this.Info = []
            this.Farlist = null
            this.Times = 0
        }
        //设置下一个很远的城市
        NextFar() {
            this.Zone = this.Farlist.shift()
            this.Times = 0
            this.Fled = false
            this.Info = []
        }
    }
    let Cities = {}
    Assisted.Data = {
        Assist: "",
        Ready: false,
        kills: 0,
        helpded: 0,
        start: null,
        current: null,
        eff: 0,
    }
    let matchedRight = /^\S{1,6}决定帮助你一同完成任务，你是否同意\(right\|refuse (.+)\)？$/
    let matcherOK = /^ok (.+)-(.+)$/
    //在聊天室等待assist的计划
    let PlanWaitReady = new App.Plan(
        App.Positions["Room"],
        (task) => {
            let prefix = `quests.asssisting ${Assisted.Data.Assist} `
            task.AddCatcher("core.localBroadcast", (catcher, event) => {
                let msg = event.Data
                if (msg.startsWith(prefix)) {
                    let data = msg.slice(prefix.length)
                    Note(`收到广播 ${data}`)
                    if (data == "ready") {
                        if (Assisted.Data.NPC != null && !Assisted.Data.NPC.Died) {
                            Assisted.Report()
                            return true
                        }
                        catcher.WithName("ready")
                        return false
                    } else if (data == "cancel") {
                        catcher.WithName("cancel")
                        return false
                    } else if (data.startsWith("ok ")) {
                        let result = data.match(matcherOK)
                        if (result) {
                            Assisted.Data.NPC.Died = true
                            catcher.WithName("ok")
                            catcher.WithData({ Loc: result[1], ID: result[2] })
                            return false
                        }
                    }
                }
                return true
            })
            task.AddTrigger(matchedRight, (tri, result) => {
                if (result[1] == Assisted.Data.Assist) {
                    App.Send(`right ${Assisted.Data.Assist}`)
                }
                return true
            })
            task.AddTimer(30000).WithName("timeout")
            Assisted.Report()
            Assisted.Send("ready")
        },
        (result) => {
            switch (result.Name) {
                case "ok":
                    Assisted.Kill(result.Data.Loc, result.Data.ID)
                    return
                case "ready":
                    Assisted.Data.Ready = true
                    Assisted.Verify()
                    return
                case "cancel":
                    Assisted.Data.Ready = false
                    // Assisted.Data.NPC = null
                    Assisted.GiveHead()
                    return
            }
            Assisted.Prepare()
        }
    )
    //发送assist信息
    Assisted.Send = (data) => {
        let msg = `quests.asssisted ${GetVariable("id")} ${data}`
        Note(`发出广播 ${data}`)
        Broadcast(msg, false)
    }
    //等待ready
    Assisted.WaitReady = () => {
        $.PushCommands(
            $.To("2046"),
            $.Plan(PlanWaitReady)
        )
        $.Next()
    }
    //报告信息
    Assisted.Report = () => {
        if (Assisted.Data.NPC != null) {
            Assisted.Send(`npc ${Assisted.Data.NPC.Name}-${Assisted.Data.NPC.Zone}-${Assisted.Data.NPC.Fled ? "t" : "f"}`)
            return true
        }
        return false
    }
    Assisted.OnNpcDie = function () {
        $.RaiseStage("npcdie")
    }
    Assisted.OnNpcFaint = function () {
        $.RaiseStage("npcfaint")
    }
    //验证任务信息
    Assisted.Verify = () => {
        if (!App.Quests.Stopped) {
            if (Assisted.Data.Ready) {
                $.PushCommands(
                    $.To(App.Params.LocMaster),
                    $.Function(Assisted.AskQuest),
                )
            } else {
                Assisted.WaitReady()
                return
            }
        }
        $.Next()
    }
    //准备
    Assisted.Prepare = () => {
        $.PushCommands(
            $.Prepare("commonWithExp"),
            $.Function(Assisted.Verify),
        )
        $.Next()
    }
    //是否可以接信,这里永远不会
    Assisted.CanAccept = () => {
        return false
    }
    let reQuest = /^([^：()\[\]]{2,5})对你道：“我早就看(.*)不顺眼，听说他最近在(.*)，你去做了他，带他的人头来交差！/
    let reQuest2 = /^([^：()\[\]]{2,5})对你道：“(.*)(这个败类打家劫舍，无恶不作，听说他最近在|这个所谓大侠屡次和我派作对，听说他最近在)/
    let reStart = /^据说此人前不久曾经在(.*)出没。/
    let reFlee = /(.{2,5})在(.*)失踪了！现在不知道去了哪里！/
    let reFail = /^([^：()\[\]]{2,5})一脸怒容对你道：“我不是让你.+前杀了/
    let reNoMaster = "这里没有这个人，你怎么领任务？"
    let reNoQuest = "你现在没有领任何任务！"
    let reCurrent = /^师长交给你的任务，你已经连续完成了 (\d+) 个。$/
    //接任务的计划
    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            let fled = false
            Assisted.Data.NoMaster = false
            Assisted.Data.NPC = null
            Assisted.Data.current = null
            task.AddTrigger(reQuest, (tri, result) => {
                Assisted.Data.NPC = new NPC(result[2])
                return true
            })
            task.AddTrigger(reQuest2, (tri, result) => {
                Assisted.Data.NPC = new NPC(result[2])
                return true
            })
            task.AddTrigger(reStart, (tri, result) => {
                if (Assisted.Data.NPC) {
                    Assisted.Data.NPC.Zone = result[1].slice(0, 2)
                    if (fled) {
                        Assisted.Data.NPC.Flee()
                    }
                }
            })
            task.AddTrigger(reFlee, (tri, result) => {
                if (Assisted.Data.NPC && result[1].endsWith(Assisted.Data.NPC.Name)) {
                    Note("NPC跑了。")
                    fled = true
                }
                return true
            })
            task.AddTrigger(reFail, () => {
                App.Send("quest cancel")
            })
            task.AddTrigger(reNoMaster, () => {
                Assisted.Data.NoMaster = true
                return true
            })
            task.AddTrigger(reCurrent, (tri, result) => {
                Assisted.Data.current = result[1] - 0
                return true
            })
            task.AddTrigger(reNoQuest)
            task.AddTrigger(/你现在没有领任何任务！/)
            task.AddTimer(3000)
            App.Send("give head to " + App.Params.MasterID + ";drop head")
            $.RaiseStage("mqbefore")
            App.Send("quest " + App.Params.MasterID)
            App.Send("quest")
        },
        (result) => {
            if (result != "cancel") {
                Assisted.Data.Ready = false
                $.Next()
            }
        }
    )
    //交头
    Assisted.GiveHead = () => {
        $.PushCommands(
            $.To(App.Params.LocMaster),
            $.Do("give head to " + App.Params.MasterID + ";drop head"),
        )
        $.Next()
    }
    //接任务
    Assisted.AskQuest = () => {
        $.PushCommands(
            $.To(App.Params.LocMaster),
            $.Plan(PlanQuest),
            $.Function(() => {
                if (Assisted.Data.NoMaster) {
                    Quest.Cooldown(300000)
                    Note("师傅没了，任务冷却5分钟")
                    App.Log("师傅没了")
                } else if (Assisted.Data.NPC) {
                    $.Insert($.Function(Assisted.Ready))
                } else {
                    $.Insert(
                        $.Wait(1000),
                        $.Function(Assisted.Ready),
                    )
                }
                App.Next()
            }),
        )
        $.Next()
    }
    //开始任务
    Assisted.Ready = () => {
        if (Assisted.Data.NPC) {
            $.PushCommands(
                $.Function(App.Check),
                $.Function(function () {
                    Assisted.GiveHead()
                }),
                $.Function(Assisted.WaitReady)
            )
            $.Next()
            return
        }
        Note("准备")
        Assisted.Prepare()
    }
    //叫杀
    Assisted.Kill = (loc, id) => {
        Assisted.Data.NPC.ID = id
        $.Insert(
            $.To(loc),
            $.Kill(Assisted.Data.NPC.ID, App.NewCombat("mq").WithPlan(PlanCombat).WithKillInGroup(Assisted.Data.NPC.NotKilled)),
            $.Function(() => {
                Assisted.Data.NPC = null
                $.Next()
            }),
            $.Function(Assisted.GiveHead)
        )
        $.Next()
    }
    //出帮手重连
    Assisted.Connect = () => {
        planQuest.Execute()
        $.PushCommands(
            $.Function(App.Core.Emergency.CheckDeath),
            $.Function(Assisted.KillLoc)
        )
        $.Next()
    }
    let matcherDie = /^(.+)扑在地上挣扎了几下，腿一伸，口中喷出几口鲜血，死了！$/
    let matcherFaint = /^(.+)脚下一个不稳，跌在地上一动也不动了。$/
    //战斗的计划
    let PlanCombat = new App.Plan(
        App.Positions["Combat"],
        (task) => {
            task.AddTrigger(matcherDie, (tri, result) => {
                if (Assisted.Data.NPC && Assisted.Data.NPC.Name == result[1]) {
                    Assisted.Data.NPC.Died = true
                    App.Send("cut head from corpse;get head")
                    Assisted.OnNpcDie()
                }
                return true
            })
            task.AddTrigger(matcherFaint, (tri, result) => {
                if (Assisted.Data.NPC && Assisted.Data.NPC.Name == result[1]) {
                    Assisted.Data.NPC.Died = true
                    Assisted.OnNpcFaint()
                }
                return true
            })
        },
        (result) => {
        })
    //定义任务
    let Quest = App.Quests.NewQuest("assisted")
    Quest.Name = "师门任务(被协助)"
    Quest.Desc = ""
    Quest.Intro = ""
    Quest.Help = ""
    Quest.OnHUD = () => {
        return [
            new App.HUD.UI.Word("任务效率:"),
            new App.HUD.UI.Word(Assisted.Data.kills > 3 ? Assisted.Data.eff.toFixed(0) : "-", 5, true),
        ]
    }
    Quest.OnSummary = () => {
        return [
            new App.HUD.UI.Word("效:"),
            new App.HUD.UI.Word(Assisted.Data.kills > 3 ? Assisted.Data.eff.toFixed(0) : "-", 5, true),
        ]
    }
    Quest.OnReport = () => {
        let eff = Assisted.Data.kills > 3 ? Assisted.Data.eff.toFixed(0) + "个/小时" : "-"
        let rate = Assisted.Data.kills > 3 ? (Assisted.Data.helpded * 100 / Assisted.Data.kills).toFixed(0) + "%" : "-"
        return [`MQ-总数:${Assisted.Data.kills} 效率:${eff} 线报率:${rate} 连续任务:${Assisted.Data.current || 0}`]
    }
    let matcherHead = /^你捡起一颗(.+)的人头。$/
    let matcherreward = /^通过这次锻炼，你获得了/
    //全局计划，统计数据
    let planQuest = new App.Plan(App.Quests.Position,
        (task) => {
            task.AddTrigger(matcherHead, (tri, result) => {
                if (Assisted.Data.NPC && Assisted.Data.NPC.Name == result[1]) {
                    Assisted.Data.NPC.Head = true
                }
                return true
            })
            task.AddTrigger(matcherreward, (tri, result) => {
                let msg = "任务成功"
                if (Assisted.Data.kills == 0) {
                    Assisted.Data.start = $.Now()
                }
                Assisted.Data.kills++
                if (Assisted.Data.kills > 3) {
                    Assisted.Data.eff = Assisted.Data.kills * 3600 * 1000 / ($.Now() - Assisted.Data.start)
                    msg += " 任务效率：" + Assisted.Data.eff.toFixed() + " 个/小时,共计" + Assisted.Data.kills + "个任务," + "线报率 " + (Assisted.Data.helpded * 100 / Assisted.Data.kills).toFixed(2) + "%"
                }
                Note(msg)
                return true
            })
        },
    )
    Quest.Start = function (data) {
        if (!App.Params.MasterID) {
            PrintSystem("掌门ID " + App.Params.MasterID + " 无效")
            return
        }
        if (!App.Params.LocMaster) {
            PrintSystem("掌门位置 " + App.Params.LocMaster + " 无效")
            return
        }
        data = data.trim()
        if (!data) {
            PrintSystem(`协助人${data}无效`)
            return
        }
        Assisted.Data.Assist = data
        Assisted.Data.NPC = null
        Assisted.Data.Ready = false
        planQuest.Execute()
        Assisted.Prepare()
    }
    //#start后清零
    App.BindEvent("core.queststart", (e) => {
        Assisted.Data.kills = 0
        Assisted.Data.helpded = 0
        Assisted.Data.start = null
        Assisted.Data.current = null
        Assisted.Data.eff = 0
    })
    App.Quests.Register(Quest)
})