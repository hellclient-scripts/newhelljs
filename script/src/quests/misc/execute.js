$.Module(function (App) {
    let Execute = {}
    Execute.Start = (loc, cmd) => {
        $.PushCommands(
            $.Prepare(),
            $.To(loc),
            $.Do(cmd),
            $.Nobusy(),
        )
        App.Next()
    }
    let Quest = App.Quests.NewQuest("execute")
    Quest.Name = "在指定位置执行指令，等待busy结束"
    Quest.Desc = "在指定位置执行指令，等待busy结束 #start execute 1949 dazuo 1000"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.GetReady = function (q, data) {
        let d = SplitN(data, " ", 2)
        if (d.length == 0) {
            PrintSystem("错误的execute参数，应该为 #start execute 1949 dazuo 1000")
        }
        return () => {
            Quest.Start(d[0], d[1])
        }
    }

    Quest.Start = function (loc, cmd) {
        Execute.Start(loc, cmd)
    }
    App.Quests.Register(Quest)
})