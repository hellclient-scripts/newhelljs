$.Module(function (App) {
    let FixedRoom = ""
    let Room = ""
    Liandan = {}
    Liandan.Data = {}
    let TimeToChange = 24000
    let Last = 0
    let preparedata = {}
    preparedata[App.Core.Assets.PrepareDataKey] = [
        App.Core.Assets.ParseRule("#sell name=火麒丹,血麒丹,归元丹,小还丹,大还丹,还魂丹,补精丹,大补丹,雪参丹,十全大还丹,大云丹,养精丹,锁泉丹,小金丹,小云丹,蓄精丹,碧泉丹"),
        App.Core.Assets.ParseRule("#pack name=龟苓丹,映月丹,修罗无常丹,回阳无极丹,龙涎丹,邀月丹,子午龙甲丹,幻灵丹,轩辕补心丹,罗刹无常丹"),
    ]

    let locations = ["1358", "1359", "1397", "1398", "1399", "1400", "1401"]
    let reGot = /^(.{1,6})找了半天，终于发现其中一株草苗与其它的草略/
    let reFail = /^一番摸索后，草丛中似乎没有.+要找的东西，/
    let PlanCaiyao = new App.Plan(App.Map.Position,
        function (task) {
            task.AddTrigger(reGot, function (trigger, result) {
                if (result[1] == "你") {
                    trigger.WithData("got")
                }
            })
            task.AddTrigger("东西到手，快去交了吧。").WithData("got")
            task.AddTrigger("别在这浪费时间了，快走吧。").WithData("got")
            task.AddTrigger("草丛中一阵晃动，突然钻出一条毒蛇。").WithData("dushe")
            task.AddTrigger("慢慢找，先别急。").WithData("retry")
            task.AddTrigger("林子后面突然跳出一个凶神恶刹的男子，手提一把短刀向你扑来！").WithData("dulangzhong")
            task.AddTrigger(reFail)
            task.AddTimer(8000)
            App.Send("halt;cai yao")
        },
        function (result) {
            if (result.Type == "cancel") {
                return
            }
            let commands = []
            switch (result.Data) {
                case "retry":
                    commands.push($.Wait(1000))
                    break
                case "got":
                    Liandan.Jiao()
                    return
                case "dushe":
                    Liandan.KillDuShe()
                    return
                case "dulangzhong":
                    Liandan.KillDuLangzhong()
                    return
            }
            $.PushCommands(
                $.Prepare(),
                $.Wait(1000 * ($.Random(2))),
                $.Function(Liandan.Cai),
            )
            $.Next()
        },
    )
    Liandan.KillDuShe = function () {
        $.PushCommands(
            $.CountAttack("du she", ["liandan", "liandan-dusha"]),
            $.Prepare(),
            $.Function(Liandan.Cai)
        )
        $.Next()
    }
    Liandan.KillDuLangzhong = function () {
        $.PushCommands(
            $.CountAttack("du langzhong", ["liandan", "liandan-dusha"]),
            $.Prepare(),
            $.Function(Liandan.Cai)
        )
        $.Next()
    }
    Liandan.Cai = function () {
        if (App.Quests.Stoped) {
            $.Next()
            return
        }
        let duration = $.Now() - Last
        if (duration > TimeToChange) {
            Note("时间太长(" + Math.floor(duration / 1000) + "秒），换个房间。")
            Liandan.ChangeRoom()
            return
        }
        if (duration > 1) {
            Note("当前房间已经采药" + Math.floor(duration / 1000) + "秒")
        }
        App.Insert($.Plan(PlanCaiyao))
        App.Next()
    }
    Liandan.ChangeRoom = function () {
        let rooms = []
        locations.forEach(r => {
            if (r != Room) {
                rooms.push(r)
            }
        })
        Room = App.Random(rooms)
        $.PushCommands(
            $.To(Room),
            $.Function(() => { Last = $.Now(); $.Next() }),
            App.Commands.NewPlanCommand(PlanCaiyao),
        )
        $.Next()
    }
    Liandan.GoAsk = function () {
        Room = FixedRoom ? FixedRoom : App.Random(locations)
        $.PushCommands(
            $.Prepare("",preparedata),
            $.To("1388"),
            $.Ask("yao chun", "炼丹"),
            $.To("1387"),
            $.Ask("xiao tong", "药材"),
            App.NewSyncCommand(),
            $.To(Room),
            $.Function(() => { Last = $.Now(); $.Next() }),
            App.Commands.NewPlanCommand(PlanCaiyao),
        )
        $.Next()
    }
    Liandan.Jiao = function () {
        $.PushCommands(
            $.To("1387"),
            $.Do("give cao yao to xiao tong"),
            $.To("1389"),
            $.Do("liandan"),
            $.Nobusy(1000,10000),
            $.Wait(2000),
            $.To("1388"),
            $.Ask("yao chun", "炼丹"),
            $.Prepare("",preparedata),
        )
        $.Next()
    }
    Liandan.Ready = function () {
        if (App.Quests.Stopped) {
            $.Next()
            return
        }
        Liandan.GoAsk()
    }

    let Quest = App.Quests.NewQuest("liandan")
    Quest.Name = "炼丹"
    Quest.Desc = "北京姚春炼丹"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Start = function (data) {
        FixedRoom = data.trim()
        Liandan.Ready()
    }
    App.Quests.Register(Quest)
})