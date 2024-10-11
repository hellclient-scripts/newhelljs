(function (App) {
    App.Core.Ask = {}
    App.Data.Ask = {}
    let MaxAnswer = 100
    //你向店小二打听有关『123』的消息。
    let matcherAsk = /^你向(.+)打听有关『.+』的消息。$/
    //但是很显然的，$n现在的状况没有办法给$N任何答覆。
    //$n摇摇头，说道：没听说过。
    //$n疑惑地看着$N，摇了摇头。
    //$n睁大眼睛望着$N，显然不知道$P在说什么。
    //$n耸了耸肩，很抱歉地说：无可奉告。
    //$n说道：嗯....这我可不清楚，你最好问问别人吧。
    //$n想了一会儿，说道：对不起，你问的事我实在没有印象。
    let matcherUnknown = /^(但是很显然的，.+现在的状况没有办法给你任何答覆。|.+摇摇头，说道：没听说过。|.+疑惑地看着.+，摇了摇头|.+睁大眼睛望着你，显然不知道你在说什么。|.+耸了耸肩，很抱歉地说：无可奉告。|.+说道：嗯....这我可不清楚，你最好问问别人吧。|.+想了一会儿，说道：对不起，你问的事我实在没有印象。|.+对你说道：实在是对不起，我什么也不知道呀！)$/
    let matcherRetry = /^(.+说道：阿嚏！有点感冒，不好意思。|.+说道：等...等等，你说什么？没听清楚。|.+说道：嗯，稍等啊，就好... 好了，你刚才说啥？|.+说道：这个... 这个... 哦，好了，啊？你问我呢？|说道：唉呦！... 不好意思，是你问我么？|.+说道：就好... 就好... 好了，你说啥？|.+说道：你干啥？没看我忙着呢么？|.+说道：\!\@\#\$%\^\&\*)$/
    //这个地方不能讲话。
    //这里没有这个人。
    //$N对着$n自言自语....
    //$N自己自言自语。
    //你现在的精神不太好，没法和别人套瓷。
    let matcherFail = /^(这个地方不能讲话。|这里没有这个人。|.+对着.+自言自语....|你自己自言自语。|你现在的精神不太好，没法和别人套瓷。)$/
    let PlanOnAsk = new App.Plan(App.Positions.Connect,
        function (task) {
            App.Sync(function () { task.Cancel("sync") })
            task.NewTrigger(matcherAsk, function (result) {
                if (App.Data.Ask.Mode == 0) {
                    App.Data.Name = result[1]
                    App.Data.Ask.Mode = 1
                }
                return true
            })
            task.NewTrigger(matcherUnknown, function (result) {
                if (App.Data.Ask.LineNumber == 1 && App.Data.Ask.Mode == 1) {
                    App.Data.Ask.Result = "unknown"
                    App.Data.Ask.Mode = 2
                }
                return true
            })
            task.NewTrigger(matcherRetry, function (result) {
                if (App.Data.Ask.LineNumber == 1 && App.Data.Ask.Mode == 1) {
                    App.Data.Ask.Result = "retry"
                    App.Data.Ask.Mode = 2
                }
                return true
            })
            task.NewTrigger(matcherFail, function (result) {
                if (App.Data.Ask.LineNumber == 1 && App.Data.Ask.Mode == 1) {
                    App.Data.Ask.Result = "fail"
                    App.Data.Ask.Mode = 2
                }
                return true
            })
            task.NewCatcher("line", function (catcher, event) {
                if (App.Data.Ask.Mode != 0) {
                    App.Data.Ask.LineNumber++
                }
                if (App.Data.Ask.Mode == 1 && App.Data.Ask.LineNumber > 1) {
                    if (App.Data.Ask.Anwsers.length > App.Data.Ask.Length > 0 ? App.Data.Ask.Length : MaxAnswer) {
                        App.Data.Ask.Mode = 2
                        return true
                    }
                    App.Data.Ask.Result = "ok"
                    App.Data.Ask.Anwsers.push(App.History.GetLine())
                }
                return true
            })

        },
        function (result) {
            if (App.Data.Ask.Result == "fail") {
                App.Fail()
                return
            }
            if (App.Data.Ask.Result == "retry") {
                App.Commands.Append(
                    App.Commands.NewWaitCommand(1000),
                    App.Commands.NewFunctionCommand(function () {
                        App.Ask(App.Data.Ask.ID, App.Data.Ask.Question, App.Data.Ask.Length)
                    }),
                )
            }
            App.Next()
        },
    )
    App.Ask = function (id, question, length) {
        App.Data.Ask = {}
        App.Data.Ask.ID = id
        App.Data.Ask.Name = ""
        App.Data.Ask.Question = question
        App.Data.Ask.Length = length ? length : 1
        App.Data.Ask.Mode = 0
        App.Data.Ask.Anwsers = []
        App.Data.Ask.LineNumber = 0
        App.Data.Ask.Result = ""
        App.Send("yun regenerate;ask " + id + " about " + question)
        PlanOnAsk.Execute()
    }
})(App)