$.Module(function (App) {
    var Fish = {}
    App.Proposals.Register("quest.fish", App.Proposals.NewProposal(function (proposals, context, exclude) {
        if (App.Data.Item.List.FindByName("钓竿").First() == null) {
            return function () {
                $.PushCommands(
                    $.Buy("diao gan 2"),
                )
                $.Next()
            }
        }
        if (App.Data.Item.List.FindByName("鱼饵").Sum() < 10) {
            return function () {
                $.PushCommands(
                    $.Buy("yu er"),
                )
                $.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("commonWithQuestFish", App.Proposals.NewProposalGroup("commonWithStudy", "quest.fish"))

    Fish.Start = () => {
        $.PushCommands(
            $.Prepare("commonWithQuestFish"),
            $.To("39"),
            $.Nobusy(),
            $.Plan(PlanFish),
        )
        App.Next()
    }
    let matcher=/^(你的浮子忽然剧烈的震荡起来。|你的浮子忽左忽右摇摆个不停。|你的浮子猛然向下一窜，然后又跳出水面。)$/
    let PlanFish = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.AddTrigger(matcher, function () {
                App.Send("draw diao gan")
                return true
            })
            App.Send("fish")
            App.CheckBusy()
        },
        (result) => {
            $.PushCommands(
                $.Do("hp;i"),
                $.Sync(),
            )
            App.Next()
        }
    )

    let Quest = App.Quests.NewQuest("fish")
    Quest.Name = "钓鱼"
    Quest.Desc = "新人钓鱼任务"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Start = function (data) {
        Fish.Start()
    }
    App.Quests.Register(Quest)

})