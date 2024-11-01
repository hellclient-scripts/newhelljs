$.Module(function (App) {
    let Lian = {}
    Lian.NeedJifa = false
    Lian.Start = () => {
        if (!App.Quests.Stopped) {
            let skill = App.Core.Study.FilterLian()
            if (skill) {
                let context = {}
                context.NeiliMin = 25
                Lian.NeedJifa = true
                $.PushCommands(
                    $.Prepare("common", context),
                    $.Function(() => { skill.Execute() }),
                    $.Function(() => { Lian.Start() }),
                )
            }
        } else {
            if (Lian.NeedJifa) {
                $.Append(
                    $.Do("#jifa"),
                )
                Lian.NeedJifa = false
            }
        }
        App.Next()
    }

    let Quest = App.Quests.NewQuest("lianskill")
    Quest.Name = "练技能"
    Quest.Desc = "练习lian变量中设置的技能"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.OnReport = () => {
        let all = App.Core.Study.AllCanLian().map(v => v.SkillID)
        return [`练习进度 (${all.length}/${App.Core.Study.Lian.length}):${all.join(",")}`]
    }
    Quest.Start = function () {
        if ((GetVariable("jifa") || "").trim() == "") {
            PrintSystem("未设置jifa变量，不能自动练功")
            return
        }
        Lian.Start()
    }
    App.Quests.Register(Quest)
})