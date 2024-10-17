$.Module(function (App) {
    let MQ = {}
    class NPC {
        constructor(name) {
            this.Name = name
        }
        Name = ""
        ID = ""
        Zone = ""
        Times=0
        Die = false
        Flee = false
        First=true
    }
    let Cities = {}
    App.LoadLines("src/quests/mq/cities.txt", "|").forEach((data) => {
        Cities[data[0]] = {
            Name: data[0],
            Loc: data[1],
            ID: data[2],
            Path: data[3],
            Path1: data[4],
            Infos: data[5].split(";")
        }
    })
    MQ.Data = {}
    let MasterLoc = "2226"
    let MasterID = "feng buping"
    MQ.Prepare = () => {
        $.PushCommands(
            $.Prepare(),
            $.To(MasterLoc),
            $.Function(MQ.AskQuest),
        )
        $.Next()
    }
    let reQuest = /^([^：()\[\]]{2,5})对你道：“我早就看(.*)不顺眼，听说他最近在(.*)，你去做了他，带他的人头来交差！/
    let reQuest2 = /^([^：()\[\]]{2,5})对你道：“(.*)(这个败类打家劫舍，无恶不作，听说他最近在|这个所谓大侠屡次和我派作对，听说他最近在)/
    let reStart = /^据说此人前不久曾经在(.*)出没。/
    let reFlee = /(.{2,5})在(.*)失踪了！现在不知道去了哪里！/
    let reFail = /^([^：()\[\]]{2,5})一脸怒容对你道：“我不是让你.+前杀了/
    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            task.AddTrigger(reQuest, (tri, result) => {
                MQ.Data.NPC = new NPC(result[2])
                return true
            })
            task.AddTrigger(reQuest2, (tri, result) => {
                MQ.Data.NPC = new NPC(result[2])
                return true
            })
            task.AddTrigger(reStart, (tri, result) => {
                if (MQ.Data.NPC) {
                    MQ.Data.NPC.Zone = result[1].slice(0, 2)
                }
            })
            task.AddTrigger(reFlee, (tri, result) => {
                if (MQ.Data.NPC && result[1].endsWith(MQ.Data.NPC)) {
                    Note("NPC跑了。")
                    MQ.Data.NPC.Flee = true
                }
                return true
            })
            task.AddTrigger(reFail, () => {
                App.Send("quest cancel")
            })
            task.AddTrigger(/你现在没有领任何任务！/)
            task.AddTimer(3000)
            App.Send("give head to " + MasterID)
            App.Send("quest " + MasterID)
            App.Send("quest")
            MQ.Data = {}

        },
        (result) => {
            if (result != "cancel") {
                $.Next()
            }
        }
    )
    MQ.AskQuest = () => {
        $.PushCommands(
            $.Plan(PlanQuest),
            $.Function(() => {
                if (MQ.Data.NPC) {
                    $.Insert($.Function(MQ.GoKill))
                } else {
                    $.Insert(
                        $.Wait(1000),
                        $.Function(MQ.Prepare),
                    )
                }
                App.Next()
            }),
        )
        $.Next()
    }
    let DefaultChecker = function (wanted) {
        let result = map.Room.Data.Objects.FindByName(wanted.Target)
        for (var obj of result) {
            if (obj.ID.indexOf(" ") > 0) {
                return obj
            }
        }
        return null
    }
    MQ.GoKill = () => {
        let zone=MQ.Data.NPC.First?Cities[MQ.Data.NPC.Zone].Path1:Cities[MQ.Data.NPC.Zone].Path;
        MQ.Data.NPC.First=false
        let wanted = $.NewWanted(MQ.Data.NPC.Name, zone).
            WithChecker(DefaultChecker).WithOrdered(true)
        $.PushCommands(
            $.Function(() => { App.Zone.Search(wanted) }),
            $.Function(() => {
                if (wanted.Loc && wanted.ID) {
                    App.Commands.Insert(
                        App.NewKillCommand(App.Zone.Wanted.ID, App.NewCombat("mq").WithPlan(PlanCombat))
                    )
                }
                App.Next()
            }),
            $.Function(() => {
                if (MQ.Data.NPC.Die) {
                    $.PushCommands(
                        $.Prepare(),
                        $.To(MasterLoc),
                        $.Function(MQ.AskQuest),
                    )
                }
                $.Next()

            }),

        )
        $.Next()
    }
    let matcherDie = /^(.+)扑在地上挣扎了几下，腿一伸，口中喷出几口鲜血，死了！$/
    let matcherFlee = /^(.+)狂叫一声，狂吐几口鲜血，眼看就已不支，忽然一道黑影/
    let PlanCombat = new App.Plan(
        App.Positions["Combat"],
        (task) => {
            task.AddTrigger(matcherDie, (tri, result) => {
                if (MQ.Data.NPC && MQ.Data.NPC.Name == result[1]) {
                    MQ.Data.NPC.Die = true
                    App.Send("cut head from corpse;get head")
                }
                return true
            })
            task.AddTrigger(matcherFlee, (tri, result) => {
                if (MQ.Data.NPC && MQ.Data.NPC.Name == result[1]) {
                    MQ.Data.NPC.Flee = true
                    Note("NPC跑了。")
                }
                return true
            })
        },
        (result) => {

        })
    MQ.GiveHead = function () {

    }
    let Quest = App.Quests.NewQuest("mq")
    Quest.Name = "师门任务"
    Quest.Desc = ""
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Start = function (data) {
    }
    App.Quests.Register(Quest)
    App.MQ = () => {
        MQ.Prepare()
    }
})