$.Module(function (App) {
    let Tiejiang = {}
    let jobs = {
        "平一指说道：好，你就帮我配药(peiyao)吧！喏，就这几味。": "peiyao",
        "平一指说道：让你干的活你干完了么？": "peiyao",
    }
    Tiejiang.Start = function () {
        if (!App.Quests.Stopped) {
            $.PushCommands(
                $.Prepare(),
                $.To("65"),
                $.Ask("ping yizhi", "配药"),
                $.Function(() => {
                    let answer = App.Data.Ask.Answers[0]
                    if (answer) {
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
    let Quest = App.Quests.NewQuest("peiyao")
    Quest.Name = "配药"
    Quest.Desc = "新人配药任务"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Start = function (data) {
        Tiejiang.Start()
    }
    App.Quests.Register(Quest)

})