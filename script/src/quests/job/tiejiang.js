//打铁模块
$.Module(function (App) {
    let Tiejiang = {}
    let jobs = {
        "铁匠说道：好！你帮我鼓一会儿风箱(gu)。": "gu",
        "铁匠说道：让你鼓风箱，你怎么还磨蹭(gu)？": "gu",
        "铁匠说道：干活怎么尽偷懒？快给我淬火去(cuihuo)！": "cuihuo",
        "铁匠说道：去帮我把这些刚出炉的淬一下火(cuihuo)。": "cuihuo",
        "铁匠说道：这样吧，你帮我打一下坯吧(dapi)！": "dapi",
        "铁匠说道：叫你打的坯你打了没有(dapi)？": "dapi",
    }
    Tiejiang.Start = function () {
        if (!App.Quests.Stopped) {
            $.PushCommands(
                $.Prepare(),
                $.To("66"),
                $.Ask("tie jiang", "job"),
                $.Function(() => {
                    let answer = App.Data.Ask.Answers[0]
                    if (answer && answer.Line != "铁匠说道：你还是歇会儿吧！要是出了人命我可承担不起。") {
                        let cmd = jobs[answer.Line]
                        if (cmd) { App.Send(cmd) }
                    } else {
                        $.Insert($.Wait(3000))
                    }
                    App.Next()
                }),
                $.Nobusy(),
                $.Do("hp;i"),
            )
        }
        App.Next()
    }
    let Quest = App.Quests.NewQuest("tiejiang")
    Quest.Name = "打铁"
    Quest.Desc = "新人打铁任务"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Start = function (data) {
        Tiejiang.Start()
    }
    App.Quests.Register(Quest)

})