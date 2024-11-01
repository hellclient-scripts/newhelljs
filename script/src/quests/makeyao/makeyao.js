$.Module(function (App) {
    let Lianyao = {}
    Lianyao.Data = {
        Target: "",
        Count: 0,
        All: 0,
        Number: 0,
    }
    Lianyao.Finish = () => {
        if (Lianyao.Data.All > 0) {
            let rate = (Lianyao.Data.Count * 100 / Lianyao.Data.All).toFixed()
            Note(`成功率:${rate}`)
        }
        App.HUD.Update()
        let item = App.Data.Item.List.FindByName(Lianyao.Data.Target).First()
        if (item && App.Data.Item.List.FindByIDLower("qiankun bag").First()) {
            $.PushCommands(
                $.Do(`keep ${item.IDLower};i;l qiankun bag`),
                $.Sync()
            )
        }
        $.Next()
    }
    let matcherHerb = /^你点了点药材，发现(.+)的分量还不够。$/
    let matcherSucces = /^你把「.+」成功的制好了！$/
    let matcherStart = /^你选出/
    let PlanMake = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.AddTrigger(matcherSucces, (tri, result) => {
                task.Data = "success"
                Lianyao.Data.Count++
                return true
            })
            task.AddTrigger(matcherStart, (tri, result) => {
                task.Data = "start"
                Lianyao.Data.All++
                return true
            })
            task.AddTrigger(matcherHerb, (tri, result) => {
                task.Data = result[1]
                return true
            })
            App.Send(`yun regenerate;make ${Lianyao.Data.Target}`)
            App.CheckBusy()
        },
        (result) => {
            Note(result.Task.Data)
            switch (result.Task.Data) {
                case "start":
                case "success":
                    Note("制作结束")
                    App.Send("get all from yanbo;get all from danyu mo;hand none")
                    if (App.Data.Item.List.FindByIDLower("danyu mo").First() && App.Data.Item.List.FindByIDLower("qiankun bag").First()) {
                        App.Send("keep danyu mo;i;l qiankun bag")
                    }
                    App.Send("i")
                    $.PushCommands(
                        $.Sync(),
                        $.Function(Lianyao.Finish)
                    )
                    $.Next()
                    return
                case null:
                case undefined:
                    App.Fail()
                    return
                default:
                    $.PushCommands(
                        $.Buy(App.Goods.GetGoodsByName(result.Task.Data)[0].Key),
                        $.Function(Lianyao.Start)
                    )
                    $.Next()
            }
        }
    )
    Lianyao.Make = () => {
        PlanMake.Execute()
    }
    Lianyao.CheckMo = () => {
        if (App.Data.Item.List.FindByIDLower("danyu mo").First() == null && App.Data.Item.List.FindByIDLower("yanbo").First() == null) {
            let qkmo = App.Data.QiankunBag.FindByIDLower("danyu mo").First()
            if (qkmo) {
                $.PushCommands(
                    $.Do(`fetch ${qkmo.Key} 1;i;l qiankun bag`),
                    $.Sync(),
                    $.Function(Lianyao.Start)
                )
                $.Next()
                return
            }
            $.PushCommands(
                $.Buy("yanbo"),
                $.Function(Lianyao.Start)
            )
            $.Next()
            return
        }
        if (App.Data.Item.List.FindByIDLower("danyu mo").First()) {
            App.Send("hand danyu mo;get all from danyu mo")
        } else {
            App.Send("hand yanbo;get all from yanbo")
        }
        Lianyao.Make()
    }
    Lianyao.Start = () => {
        if (!App.Quests.Stopped && Sum() < Lianyao.Data.Number) {
            $.PushCommands(
                $.Prepare(),
                $.Function(Lianyao.CheckMo),
            )
        }
        $.Next()
    }
    let Sum = () => {
        return App.Data.Item.List.FindByName(Lianyao.Data.Target).Sum() + App.Data.QiankunBag.FindByName(Lianyao.Data.Target).Sum()
    }
    let Quest = App.Quests.NewQuest("makeyao")
    Quest.Name = "做药"
    Quest.Desc = "做药，使用方式makeyao 九花玉露丸 1000"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.OnHUD = () => {
        let rate = Lianyao.Data.Number ? (Sum() * 100 / Lianyao.Data.Number).toFixed() : 0
        return [
            new App.HUD.UI.Word("做药进度:"),
            new App.HUD.UI.Word(rate + "%"),
        ]
    }
    Quest.OnSummary = () => {
        let rate = Lianyao.Data.Number ? (Sum() * 100 / Lianyao.Data.Number).toFixed() : 0
        return [
            new App.HUD.UI.Word("药:"),
            new App.HUD.UI.Word(rate + "%"),
        ]
    }
    Quest.OnReport = () => {
        let sum = Sum()
        let rate = Lianyao.Data.Number ? (sum * 100 / Lianyao.Data.Number).toFixed() : 0
        let rate2 = Lianyao.Data.All ? (Lianyao.Data.Count * 100 / Lianyao.Data.All).toFixed() : 0

        return [`做药-${Lianyao.Data.Target} ${Lianyao.Data.Number}个 ,已有${sum}个，进度${rate}%， 做了 ${Lianyao.Data.All}次，成功${Lianyao.Data.Count}个，成功率${rate2}%`]
    }
    Quest.GetReady = function (q, data) {
        data = SplitN(data.trim(), (" "), 2)
        if (!data[1] || isNaN(data[1])) {
            PrintSystem("数量无效")
            return
        }
        if (data[0] != Lianyao.Data.Target) {
            Lianyao.Data = {
                Target: data[0],
                Count: 0,
                Fail: 0,
                Number: 0,
                All: 0,
            }
        }
        Lianyao.Data.Number = data[1] - 0
        if (Sum() < Lianyao.Data.Number) {
            return () => { Quest.Start(data) }
        }
        return null
    }
    Quest.Start = function (data) {
        Lianyao.Start()
    }
    App.Quests.Register(Quest)
})