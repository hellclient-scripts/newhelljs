$.Module(function (App) {
    let Beiqi = {}
    Beiqi.Data = {}
    Beiqi.Delay = 5 * 60 * 1000
    Beiqi.Tasks = {}
    let preparedata = {}
    preparedata[App.Core.Assets.PrepareDataKey] = [
        App.Core.Assets.ParseRule("#carry name=铁甲,铁锤,竹棒,竹剑,普通匕首,钢刀,长剑,木刀,飞蝗石,铁莲子,铁棍"),
    ]
    let destoryPreparedata = {}
    destoryPreparedata[App.Core.Assets.PrepareDataKey] = [
        App.Core.Assets.ParseRule("#sell name=铁甲,铁锤,竹棒,竹剑,普通匕首,钢刀,长剑,木刀,铁棍"),
        App.Core.Assets.ParseRule("#drophere name=飞蝗石,铁莲子"),
    ]
    $.LoadLines("src/quests/beiqi/task.txt", "|").forEach(data => {
        Beiqi.Tasks[data[0]] = {
            Key: data[0],
            Name: data[1],
            InfoLoc: data[2],
            InfoID: data[3],
            Last: 0,
        }
    })
    Beiqi.Receivers = {}
    $.LoadLines("src/quests/beiqi/receiver.txt", "|").forEach(data => {
        Beiqi.Receivers[data[0]] = {
            Loc: data[1],
            ID: data[2],
        }
    })
    let readyCommand = $.Function(function () {
        let now = $.Now()
        let max = 0
        let list = []
        for (var key in Beiqi.Tasks) {
            let task = Beiqi.Tasks[key]
            let cd = now - task.Last
            if (max < cd) {
                max = cd
            }
            if (cd > Beiqi.Delay) {
                list.push(task)
            }
        }
        if (!App.Quests.Stopped && list.length) {
            Beiqi.Data.Current = App.Random(list)
            Beiqi.Go()
            return
        }
        $.Pop()
    })
    Beiqi.Finish = function () {
        $.PushCommands(
            $.Prepare("", destoryPreparedata),
            $.Function(function () {
                let max = 0
                let now = $.Now()
                for (var key in Beiqi.Tasks) {
                    let task = Beiqi.Tasks[key]
                    let cd = now - task.Last
                    if (max < cd) {
                        max = cd
                    }
                }
                let cd = Beiqi.Delay - max
                if (!App.Quests.Stopped) {
                    Note("所有的备齐已做完，等待 " + ((cd / 1000).toFixed(2)) + " 秒")
                    Quest.Cooldown(cd)
                }
                App.Next()
            })
        )
        $.Next()
    }
    Beiqi.Go = function () {
        let task = Beiqi.Data.Current
        $.PushCommands(
            $.Prepare("", preparedata),
            $.To(task.InfoLoc),
            $.Nobusy(),
            $.Ask(task.InfoID, task.Name + "的事", 1),
            $.Function(Beiqi.Check),
        ).
            WithFailCommand(nextCommand).
            WithFinishCommand(nextCommand)
        $.Next()
    }
    Beiqi.Next = function () {
        if (Beiqi.Data.Current) {
            Beiqi.Data.Current.Last = $.Now()
        }
        $.Next()
    }
    let nextCommand = $.Function(Beiqi.Next)

    let re = /.+说道：据说(.+)急需一批(.+)。嘿！你说他想干什么？$/
    Beiqi.Check = function () {
        if (App.Quests.Stopped) {
            $.Next()
            return
        }
        if (App.Data.Ask.Answers.length == 0) {
            $.Fail()
            return
        }
        let answer = App.Data.Ask.Answers[0]
        let result = answer.Line.match(re)
        if (result) {
            let key = Beiqi.Data.Current.Key + "-" + result[1]
            let receiver = Beiqi.Receivers[key]
            if (receiver == null) {
                App.Fatal("beiqi", "未知的收货人" + key)
                return
            }
            Beiqi.Data.Quest = {
                Receiver: receiver,
                Item: result[2],
            }
            Beiqi.Give()
            return
        }
        App.Fatal("beiqi", "未知的回答:" + answer)
    }
    Beiqi.Give = function () {
        let item = App.Data.Item.List.FindByName(Beiqi.Data.Quest.Item).First()
        if (item) {
            $.PushCommands(
                $.To(Beiqi.Data.Quest.Receiver.Loc),
                $.Nobusy(),
                $.Do("give " + item.IDLower + " to " + Beiqi.Data.Quest.Receiver.ID),
                $.Do("i;score"),
                $.Wait(1000),
                $.Function(Beiqi.Go)
            )
            $.Next()
            return
        }
        let goods = App.Goods.GetGoodsByName(Beiqi.Data.Quest.Item)
        if (!goods.length) {
            Note("无法购买的物品：" + Beiqi.Data.Quest.Item)
            $.Fail()
            return
        }
        $.PushCommands(
            $.Buy(goods[0].Key),
            $.Function(Beiqi.Give),
        )
        $.Next()
    }
    let Quest = App.Quests.NewQuest("beiqi")
    Quest.Name = "备齐"
    Quest.Desc = "做备齐任务，积累阅历"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.OnHUD = () => {
        return [
            new App.HUD.UI.Word("阅历:"),
            new App.HUD.UI.Word(App.Data.Player.Score["阅历"] != null ? App.HUD.UI.ShortNumber(App.Data.Player.Score["阅历"]) : "-", 5),
        ]
    }
    Quest.OnSummary = () => {
        return [
            new App.HUD.UI.Word("阅:"),
            new App.HUD.UI.Word(App.Data.Player.Score["阅历"] != null ? App.HUD.UI.ShortNumber(App.Data.Player.Score["阅历"]) : "-", 5),
        ]
    }
    Quest.Start = function (data) {
        $.Push().
            WithReadyCommand(readyCommand).
            WithFinishCommand($.Function(Beiqi.Finish))
        $.Next()
    }
    App.Quests.Register(Quest)
})