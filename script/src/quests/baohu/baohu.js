$.Module(function (App) {
    let Baohu = {}
    Baohu.Reconnect = false
    Baohu.Count = 0
    Baohu.Continuous = 0
    Baohu.NPCs = {}
    Baohu.Data = {}
    App.LoadLines("src/quests/baohu/npc.txt", "|").forEach((data) => {
        Baohu.NPCs[data[0]] = {
            Name: data[0],
            ID: data[1],
            Loc: data[2].split(",")
        }
    })
    Baohu.Fail = () => {
        $.PushCommands(
            $.To("174"),
            $.Ask("wang jiantong", "放弃保护"),
        )
        $.Next()
    }
    let matcherProtect = /^汪剑通点了点头，对你说道:蒙古人收买了一批武林败类,好象要暗杀(.*)，你去保护他一下。/
    Baohu.Check = () => {
        if (App.Data.Ask.Answers.length) {
            let answer = App.Data.Ask.Answers[0].Line
            if (answer == "汪剑通说道：襄阳的百姓岌岌可危，现在你能帮我筹备十两黄金吗？") {
                App.Send("give 10 gold to wang jiantong")
                Baohu.Start()
                return
            }
            let result = answer.match(matcherProtect)
            if (result) {
                Baohu.Data.Start = $.Now()
                Baohu.Go(result[1])
                return
            }
            if (answer == `汪剑通说道：${App.Data.Player.Score.名字}，你上一次的任务还没完成!`) {
                Baohu.Fail()
                return
            }
            Quest.Cooldown(60000)
            App.Fail()
            return
        }
        Quest.Cooldown(300000)
        App.Fail()
    }
    Baohu.Go = (npcname) => {
        let npc = Baohu.NPCs[npcname];
        if (!npc) {
            PrintSystem(`未知的保护npc${npcname}`)
            return
        }
        Baohu.Data.NPC = npc
        App.Zone.Wanted = $.NewIDLowerWanted(npc.ID)
        $.PushCommands(
            $.To(npc.Loc[0]),
            $.Rooms(npc.Loc, App.Zone.Finder),
            $.Function(Baohu.Arrive)
        )
        $.Next()
    }
    Baohu.Connect = () => {
        App.Commands.Drop()
        PlanQuest.Execute()
        $.PushCommands(
            $.Function(App.Core.Emergency.CheckDeath),
            $.Do("hp"),
            $.Nobusy(),
            $.Rest(),
            $.Kill(`${GetVariable("id")}'s ${Baohu.Data.ID}`, App.NewCombat("baohu").WithTags(`baohu-${Baohu.Data.Type}`)),
            $.Function(Baohu.Finish),
        )
        $.Next()
    }
    let matcherHalt = /^你(身行向后一跃，跳出战圈不打了。|现在停不下来。)$/

    let PlanCombat = new App.Plan(
        App.Positions["Combat"],
        (task) => {
            task.AddTrigger(matcherHalt, (tri, result) => {
                if (Baohu.Reconnect) {
                    App.Reconnect(0, Baohu.Connect)
                    return
                }
                return true
            })
        }
    )
    let matcherKill = /^你对(.+)的(黑衣人|邪派高手|绝世高手)喝道:大胆狂徒,竟敢在这撒野！！/
    let PlanProtect = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            task.AddTrigger(matcherKill, (tri, result) => {
                if (result[1] != App.Data.Player.Score.名字) {
                    return true;
                }
                App.Send("halt")
                let id
                switch (result[2]) {
                    case "黑衣人":
                        id = "heiyi ren"
                        break
                    case "邪派高手":
                        id = "xiepai gaoshou"
                        break
                    case "绝世高手":
                        id = "jueshi gaoshou"
                        break
                }
                Baohu.Data.ID = id
                Baohu.Data.Type = result[2]
                $.PushCommands(
                    $.CounterAttack(`${GetVariable("id")}'s ${id}`, App.NewCombat("baohu").WithTags(`baohu-${result[2]}`).WithPlan(PlanCombat)),
                    $.Function(Baohu.Finish),
                )
                $.Next()
            }).WithName("ok")
            let wait = Baohu.Data.Start + 28000 - $.Now()
            if (wait > 0) {
                task.AddTimer(wait, (timer) => {
                    Note("准备迎敌")
                    App.Send("halt")
                    $.RaiseStage("prepare")
                    $.RaiseStage("baohu-ready")
                    return true
                }).WithNoRepeat(true)
            }
            task.AddTimer(60000, () => {
                Note("等待超时")
                return false
            }).WithName("timeout")
            $.RaiseStage("wait")
        },
        (result) => {
            if (result.Name == "ok") {
                return
            }
            App.Send("halt")
            Baohu.Fail()
        }
    )
    Baohu.Finish = () => {
        $.PushCommands(
            $.To("174"),
            $.Ask("wang jiantong", "保护完成"),
            $.Function(() => {
                $.RaiseStage("wait")
                $.Next()
            }),
            $.Wait(2000),
            $.Do("halt;i"),
            $.Sync(),
            $.Prepare("commonWithExp"),
        )
        $.Next()
    }
    Baohu.Arrive = () => {
        if (App.Map.Room.Data.Objects.FindByIDLower(Baohu.Data.NPC.ID).First()) {
            Note("找到NPC,开始保护")
            PlanProtect.Execute()
            return
        }
        Note("找不到NPC,尝试等待")
        PlanProtect.Execute()
    }
    //汪剑通对你说道:你已经连续完成了二百十六次任务。
    let matcherSuccess = /^汪剑通对你说道:你已经连续完成了(.+)次任务。$/
    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            task.AddTrigger(matcherSuccess, (tri, result) => {
                Quest.Cooldown(60000)
                Baohu.Continuous = App.CNumber.ParseNumber(result[1])
                Note(Baohu.Continuous)
                Baohu.Count++
                return true
            })
        },
        (result) => {

        }
    )
    Baohu.Start = () => {
        Baohu.Data = {}
        PlanQuest.Execute()
        $.PushCommands(
            $.Prepare("", { GoldKeep: 10 }),
            $.To("174"),
            $.Ask("wang jiantong", "保护人质"),
            $.Function(Baohu.Check)
        )
        $.Next()
    }
    let Quest = App.Quests.NewQuest("baohu")
    Quest.Name = "保护任务"
    Quest.Desc = "可以加参数 recon,每次kill时重新连线"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Group = "baohu"
    Quest.OnHUD = () => {
        return [
            new App.HUD.UI.Word("保护:"),
            new App.HUD.UI.Word(`${Baohu.Continuous}`, 5, true),
        ]
    }
    Quest.OnSummary = () => {
        return [
            new App.HUD.UI.Word("保:"),
            new App.HUD.UI.Word(`${Baohu.Continuous}`, 5, true),
        ]
    }
    Quest.OnReport = () => {
        return [`保护任务- 连续保护 ${Baohu.Continuous} 共计 ${Baohu.Count}`]
    }

    Quest.Start = function (data) {
        Baohu.Reconnect = data.trim() == "recon"
        Baohu.Start()
    }
    App.Quests.Register(Quest)
    App.Quests.Baohu = Baohu
})