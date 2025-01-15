//钓金鱼赚钱
$.Module(function (App) {
    let Goldfish = {}
    let Locs = ["2717", "2718", "2719", "2720"]
    //渔获处理指令
    let Commands = {
        "龙虾": "get long xia;sell long xia",
        "金鲤鱼": "get jin liyu;sell jin liyu",
        "白银": "get silver_money",
        "鲤鱼": "sell li yu",
        "青鱼": "sell qing yu",
        "草鱼": "sell cao yu",
        "鲫鱼": "sell ji yu",
    }
    Goldfish.Data = {
        Loc: "",
    }
    //屏蔽
    let matcherGag = /没有学会任何技|没有使用任何特殊技|喝太多了|吃太饱了|选择你要使用的内功|收起钓竿，看样子是不想再钓了|卖掉了一|捡起一|猛地一收钓竿|你的浮子震动了一下|仔细的放在钓钩上|顺势一拉杆|水面波澜不惊|一个个圆圈|就是没有鱼上钩|只好先扔在一旁|喝了几口|浮子轻轻的震动|忽左忽右摇摆/
    //任务全局计划
    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            task.AddTrigger("李富贵拦住你道：不买门票就想进去？", () => {
                if (App.Data.Item.List.FindByIDLower("cash").First()) {
                    App.Send("give 1 cash to li fugui;i;e")
                } else {
                    App.Send("give 10 gold to li fugui;i;e")
                }
                return true
            })
            task.AddTrigger(matcherGag, function () {
                OmitOutput()
                return true
            })
        },
        (result) => {
        }
    )
    let context = {
        GoldKeep: 10,
        GoldMax: 200,
    }
    Goldfish.Start = () => {
        PlanQuest.Execute()
        Goldfish.Go()
    }
    //前往钓鱼
    Goldfish.Go = () => {
        $.PushCommands(
            $.Prepare("common", context),
            $.To(Goldfish.Data.Loc),
            $.Function(Goldfish.Ready),
        )
        $.Next()
    }
    let matcherDraw = /^(> )*你的浮子(忽左忽右摇摆个不停|猛然向下一窜，然后又跳出水面)/
    let matchSuccess = /^你钓到了一.(.+)。$/
    //钓鱼计划
    let PlanFish = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            task.AddTrigger(matcherDraw, () => {
                App.Send("draw gan;halt")
                return true
            })
            task.AddTrigger(matchSuccess, (tri, result) => {
                let cmd = Commands[result[1]]
                if (cmd) {
                    App.Send(cmd)
                }
                return true
            })
            task.AddTrigger("你收起钓竿，看样子是不想再钓了。")
            task.AddTrigger("你现在不忙。")
            task.AddTrigger("看来是拉杆(draw)拉晚了，白白的赔了一个鱼饵！")
            App.Send("fish")
        },
        (result) => {
            App.Next()
        }
    )
    //主核心逻辑
    Goldfish.Ready = () => {
        if (App.Data.Item.List.FindByIDLower("diao gan").First() == null) {
            if (App.Data.Item.List.FindByIDLower("gold").Sum() < 10) {
                Goldfish.Go()
                return
            }
            $.PushCommands(
                $.Do("buy diao gan;i"),
                $.Nobusy(),
                $.Function(Goldfish.Ready),
            )
            $.Next()
            return
        }
        $.PushCommands(
            $.Plan(PlanFish),
            $.Do("i"),
            $.Sync(),
        )
        $.Next()
    }
    //任务定义
    let Quest = App.Quests.NewQuest("goldfish")
    Quest.Name = "钓金鱼"
    Quest.Desc = "大米钓鱼赚钱"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Start = function (data) {
        if (data) {
            Goldfish.Data.Loc = data
        }
        if (!Goldfish.Data.Loc) {
            Goldfish.Data.Loc = App.Random(Locs)
        }
        Goldfish.Start()
    }
    App.Quests.Register(Quest)
})