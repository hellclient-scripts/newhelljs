$.module(function (App) {
    App.Quest.Beiqi = {}
    App.Quest.Beiqi.Data = {}
    App.Quest.Beiqi.Delay = 5 * 60 * 1000
    App.Quest.Beiqi.Tasks = {}
    ReadLines("src/quests/beiqi/task.txt").forEach(line => {
        line = line.trim()
        if (line == "" || line.startsWith("//")) {
            return
        }
        let data = line.split("|")
        App.Quest.Beiqi.Tasks[data[0]] = {
            Key: data[0],
            Name: data[1],
            InfoLoc: data[2],
            InfoID: data[3],
            Last: 0,
        }
    })
    App.Quest.Beiqi.Receivers = {}
    ReadLines("src/quests/beiqi/receiver.txt").forEach(line => {
        line = line.trim()
        if (line == "" || line.startsWith("//")) {
            return
        }
        let data = line.split("|")
        App.Quest.Beiqi.Receivers[data[0]] = {
            Loc: data[1],
            ID: data[2],
        }
    })
    let readyCommand = App.Commands.NewFunctionCommand(function () {
        let now = (new Date()).getTime()
        let max = 0
        let list = []
        for (var key in App.Quest.Beiqi.Tasks) {
            let task = App.Quest.Beiqi.Tasks[key]
            let cd = now - task.Last
            if ( max < cd) {
                max = cd
            }
            if (cd > App.Quest.Beiqi.Delay) {
                list.push(task)
            }
        }
        if (!App.Quests.Stopped && list.length) {
            App.Quest.Beiqi.Data.Current = App.Random(list)
            App.Quest.Beiqi.Go()
            return
        }
        let cd = App.Quest.Beiqi.Delay - max
        if (!App.Quests.Stopped) {
            Note("所有的备齐已做完，等待 " + ((cd/1000).toFixed(2)) + " 秒")
            Quest.Cooldown(cd)
        }
        App.Quest.Beiqi.Finish()
    })
    App.Quest.Beiqi.Finish = function () {
        App.Pop()
    }
    App.Quest.Beiqi.Go = function () {
        let task = App.Quest.Beiqi.Data.Current
        App.Commands.PushCommands(
            App.NewPrepareCommand(),
            App.Move.NewToCommand(task.InfoLoc),
            App.NewNobusyCommand(),
            App.NewAskCommand(task.InfoID, task.Name + "的事", 1),
            App.Commands.NewFunctionCommand(App.Quest.Beiqi.Check),
        ).
            WithFailCommand(nextCommand).
            WithFinishCommand(nextCommand)
        App.Next()
    }
    App.Quest.Beiqi.Next = function () {
        if (App.Quest.Beiqi.Data.Current) {
            App.Quest.Beiqi.Data.Current.Last = (new Date()).getTime()
        }
        App.Next()
    }
    let nextCommand = App.Commands.NewFunctionCommand(App.Quest.Beiqi.Next)

    let re = /.+说道：据说(.+)急需一批(.+)。嘿！你说他想干什么？$/
    App.Quest.Beiqi.Check = function () {
        if (App.Quests.Stopped){
            App.Next()
            return
        }
        if (App.Data.Ask.Answers.length == 0) {
            App.Fail()
            return
        }
        let answer = App.Data.Ask.Answers[0]
        let result = answer.Line.match(re)
        if (result) {
            let key = App.Quest.Beiqi.Data.Current.Key + "-" + result[1]
            let receiver = App.Quest.Beiqi.Receivers[key]
            if (receiver == null) {
                App.Fatal("beiqi","未知的收货人" + key)
                return
            }
            App.Quest.Beiqi.Data.Quest = {
                Receiver: receiver,
                Item: result[2],
            }
            App.Quest.Beiqi.Give()
            return
        }
        App.Fatal("beiqi","未知的回答:" + answer)
    }
    App.Quest.Beiqi.Give = function () {
        let item = App.Data.Item.List.FindByName(App.Quest.Beiqi.Data.Quest.Item).First()
        if (item) {
            App.PushCommands(
                App.Move.NewToCommand(App.Quest.Beiqi.Data.Quest.Receiver.Loc),
                App.NewNobusyCommand(),
                App.Commands.NewDoCommand("give " + item.GetData().IDLower + " to " + App.Quest.Beiqi.Data.Quest.Receiver.ID),
                App.Commands.NewDoCommand("i"),
                App.Commands.NewWaitCommand(1000),
                App.Commands.NewFunctionCommand(App.Quest.Beiqi.Go)
            )
            App.Next()
            return
        }
        let goods = App.Goods.GetGoodsByName(App.Quest.Beiqi.Data.Quest.Item)
        if (!goods.length) {
            Note("无法购买的物品：" + App.Quest.Beiqi.Data.Quest.Item)
            App.Fail()
            return
        }
        App.PushCommands(
            App.Goods.NewBuyCommand(goods[0].Key),
            App.Commands.NewFunctionCommand(App.Quest.Beiqi.Give),
        )
        App.Next()
    }
    let Quest = App.Quests.NewQuest("beiqi")
    Quest.Name = "备齐"
    Quest.Desc = "做备齐任务，积累阅历"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Start = function (data) {
        App.Commands.Push().
            WithReadyCommand(readyCommand)
        App.Next()
    }
    App.Quests.Register(Quest)
})