//练功模块
$.Module(function (App) {
    let Lian = {}
    Lian.NeedJifa = false
    Lian.Start = () => {
        let changequest = false
        let ready = App.Quests.GetReady()
        if (ready && ready.RunningQuest && ready.RunningQuest.ID != Quest.ID) {
            changequest = true
        }

        if (!App.Quests.Stopped && !changequest) {

            let skill = App.Core.Study.FilterLian()
            if (skill) {
                let context = {}
                context.NeiliMin = 15
                Lian.NeedJifa = true
                $.PushCommands(
                    $.Prepare("common", context),
                    $.Function(() => { skill.Execute() }),
                    $.Function(() => { Lian.Start() }),
                )
            }
        } else {
            //不继续练功了，激发技能
            if (Lian.NeedJifa) {
                $.Append(
                    $.Do("#jifa"),
                )
                Lian.NeedJifa = false
            }
        }
        App.Next()
    }
    //定义任务
    let Quest = App.Quests.NewQuest("lianskill")
    Quest.Name = "练技能"
    Quest.Desc = "练习lian变量中设置的技能"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.OnHUD = () => {
        let all = App.Core.Study.AllCanLian().map(v => v.SkillID)
        return [
            new App.HUD.UI.Word("练功:"),
            new App.HUD.UI.Word(`${all.length}/${App.Core.Study.Lian.length}`, 5, true),
        ]
    }
    Quest.OnSummary = () => {
        let all = App.Core.Study.AllCanLian().map(v => v.SkillID)
        return [
            new App.HUD.UI.Word("练:"),
            new App.HUD.UI.Word(`${all.length}/${App.Core.Study.Lian.length}`, 5, true),
        ]
    }
    Quest.OnReport = () => {
        let all = App.Core.Study.AllCanLian().map(v => `${v.SkillID}(${App.Data.Player.Skills[v.SkillID] ? App.Data.Player.Skills[v.SkillID]["等级"] : 0})`)
        return [`练习进度 (${all.length}/${App.Core.Study.Lian.length}):${all.join(",")}`]
    }
    Quest.GetReady = function (q, data) {
        if ((GetVariable("jifa") || "").trim() == "") {
            PrintSystem("未设置jifa变量，不能自动练功")
            return
        }
        if (App.Core.Study.AllCanLian().length > 0) {
            return () => { Quest.Start(data) }
        }
        return null
    }
    Quest.Start = function () {
        Lian.Start()
    }
    Quest.Group="lianskill"
    App.Quests.Register(Quest)
})