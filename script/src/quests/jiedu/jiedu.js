$.Module(function (App) {
    let Jiedu = {}
    Jiedu.All = false
    Jiedu.NeedJiedu = {}
    Jiedu.Do = () => {

    }
    let matcherPosition = /^(\S){1,6}(忽然一颤，脸色发青，直打哆嗦。|牙齿直打冷颤，)/
    let PlanWait = new App.Plan(
        App.Quests.Position,
        (task) => {
            task.AddTrigger(matcherPosition, (tri, result) => {
                Jiedu.NeedJiedu[result[1]] = true
            })
            task.AddTimer(1000, () => {
                if (Object.keys(Jiedu.NeedJiedu).length == 0) {
                    return true
                }
            })
            task.AddTimer(60000)
        },
        (result) => {
            if (Object.keys(Jiedu.NeedJiedu).length == 0) {
                Jiedu.Do()
                return
            }
            Jiedu.Wait()
        },
    )
    Jiedu.Wait = () => {
        Jiedu.NeedJiedu = {}
        $.PushCommands(
            $.Prepare(),
            $.Plan(PlanWait),
        )
        $.Next()
    }
    Jiedu.Start = (all) => {
        Jiedu.All = all
        Jiedu.Wait()
    }
    let Quest = App.Quests.NewQuest("jiedu")
    Quest.Name = "解毒大米"
    Quest.Desc = "在loc_dazuo解毒的大米"
    Quest.Intro = ""
    Quest.Help = ""

    Quest.Start = function (data) {
        Jiedu.Start(data.trim() == "all")
    }
    App.Quests.Register(Quest)
})