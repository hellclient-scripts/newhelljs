//练功模块
$.Module(function (App) {
    let Study = {}
    Study.Start = () => {
        let changequest = false
        let ready = App.Quests.GetReady()
        if (ready && ready.RunningQuest && ready.RunningQuest.ID != Quest.ID) {
            changequest = true
        }

        if (!App.Quests.Stopped && !changequest) {

            let skill = App.Core.Study.FilterSkill()
            if (skill) {
                let context = {}
                context.NeiliMin = 15
                $.PushCommands(
                    $.Prepare("common", context),
                    $.Function(() => { skill.Execute() }),
                    $.Function(() => { Study.Start() }),
                )
            }
        } 
        App.Next()
    }
    //定义任务
    let Quest = App.Quests.NewQuest("study")
    Quest.Name = "学习"
    Quest.Timeslice = "学习"
    Quest.Desc = "独立学习模块"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.OnHUD = () => {
        let all = App.Core.Study.AllCanLearn().map(v => v.SkillID)
        return [
            new App.HUD.UI.Word("学习:"),
            new App.HUD.UI.Word(`${all.length}/${App.Core.Study.Learn.length}`, 5, true),
        ]
    }
    Quest.OnSummary = () => {
        let all = App.Core.Study.AllCanLearn().map(v => v.SkillID)
        return [
            new App.HUD.UI.Word("学:"),
            new App.HUD.UI.Word(`${all.length}/${App.Core.Study.Learn.length}`, 5, true),
        ]
    }
    Quest.OnReport = () => {
        let all = App.Core.Study.AllCanLearn().map(v => `${v.SkillID}(${App.Data.Player.Skills[v.SkillID] ? App.Data.Player.Skills[v.SkillID]["等级"] : 0})`)
        return [`学习进度 (${all.length}/${App.Core.Study.Learn.length}):${all.join(",")}`]
    }
    Quest.GetReady = function (q, data) {
        App.Quests.Data.NoStudy=true
        if (App.Core.Study.HitMinPot()) {
            return null
        }
        if (App.Core.Study.AllCanLearn().length > 0) {
            let maxpot = GetVariable("max_pot") - 0
            if (!isNaN(maxpot) && maxpot > 0 && App.Data.Player.HP["潜能"] >= maxpot) {
                return () => { Quest.Start(data) }
            }
        }
        return null
    }
    Quest.Start = function () {
       Study.Start()
    }
    Quest.Group = "study"
    App.Quests.Register(Quest)
})