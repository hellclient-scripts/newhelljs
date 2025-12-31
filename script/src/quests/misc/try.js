//创建武功模块
$.Module(function (App) {
    let Try = {}
    let matcherSuccess = /^(对不起，请用：\<英文名\> \<中文名\> 的格式输入|对不起，您只能选择1-4，按下回车直接)/
    var PlanOnTry = new App.Plan(App.Positions.Connect,
        (task) => {
            App.CheckBusy(5000, 0, () => {
                task.Cancel("finish")
            })
            task.AddTrigger(matcherSuccess, (tri, result) => {
                App.Log(result[0])
                $.RaiseStage("trySuccess")
            })
        },
        (result) => {
            $.RaiseStage("tryFinish")
            App.Next()
        }
    )
    Try.Start = (loc, cmd) => {
        $.PushCommands(
            $.Prepare(),
            $.To(loc),
            $.Do(cmd),
            $.Plan(PlanOnTry),
        )
        App.Next()
    }
    let Quest = App.Quests.NewQuest("try")
    Quest.Name = "在指定位置执行指令，尝试创建武功或者绝招"
    Quest.Desc = "在指定位置执行指令，等待busy结束 #start try 2682 dazuo 1000"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.GetReady = function (q, data) {
        let d = SplitN(data, " ", 2)
        if (d.length == 0) {
            PrintSystem("错误的try参数，应该为 #start try 2682 dazuo 1000")
        }
        return () => {
            Quest.Start(d[0], d[1])
        }
    }

    Quest.Start = function (loc, cmd) {
        Try.Start(loc, cmd)
    }
    App.Quests.Register(Quest)
})