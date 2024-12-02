$.Module(function (App) {
    let Jiedu = {}
    Jiedu.All = false
    Jiedu.NeedJiedu = {}
    Jiedu.Do = () => {
        $.PushCommands(
            $.Do("id here"),
            $.Sync(),
            $.Function(() => {
                Object.keys(Jiedu.NeedJiedu).forEach((name) => {
                    let id = App.Map.Room.Data.IDHere[name]
                    if (id) {
                        App.Send(`yun dispel ${id}`)
                    }
                })
                Object.keys(Jiedu.NeedJiedu).forEach((name) => {
                    let id = App.Map.Room.Data.IDHere[name]
                    if (id) {
                        App.Send(`yun lifeheal ${id}`)
                    }
                })
                App.Send("hp")
                App.Next()
            }),
            $.Nobusy(),
            $.Function(Jiedu.Wait)
        )
        $.Next()
    }
    let matcherPoison = /^(\S{1,6})(忽然一颤，脸色发青，直打哆嗦。|牙齿直打冷颤，)/
    let matcherPoisonAll = /^(\S{1,6})(惨嚎一声，脸色铁青，全身浮现出一层寒气，不住的颤抖。|一声惨嚎，内息逆流，“哇”的一声喷出一大口鲜血。|一声惨嚎，全身竟燃起了碧绿色的火焰。|的身子突然晃了两晃，几乎跌倒。|的痛苦的呻吟了一声，脸上笼罩了一股淡淡的绿气。|的身子突然晃了两晃，牙关格格地响了起来。|只感内息顿滞，“哇”的一声喷出一大口鲜血。|脸上忽然露出诡异的一笑！|然浑身不住的抖动，看上去十分痛苦。|的身子突然晃了两晃，牙关格格地响了起来。)/
    let PlanWait = new App.Plan(
        App.Quests.Position,
        (task) => {
            task.AddTrigger(matcherPoison, (tri, result) => {
                Jiedu.NeedJiedu[result[1]] = true
                return true
            })
            task.AddTrigger(matcherPoisonAll, (tri, result) => {
                if (Jiedu.All) {
                    Jiedu.NeedJiedu[result[1]] = true
                }
                return true
            })
            task.AddTimer(1000, () => {
                if (Object.keys(Jiedu.NeedJiedu).length == 0) {
                    return true
                }
            })
            task.AddTimer(60000)
        },
        (result) => {
            if (Object.keys(Jiedu.NeedJiedu).length != 0) {
                Jiedu.Do()
                return
            }
            Jiedu.Wait()
        },
    )
    Jiedu.Wait = () => {
        if (!App.Quests.Stopped) {
            Jiedu.NeedJiedu = {}
            $.PushCommands(
                $.Prepare(),
                $.To(App.Params.LocDazuo),
                $.Plan(PlanWait),
            )
        }
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