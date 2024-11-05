$.Module(function (App) {
    let Dazuo = {}
    Dazuo.Data = {
        Target: null
    }

    Dazuo.Start = () => {
        $.PushCommands(
            $.Prepare(),
            $.Function(() => {
                if (App.Data.Player.HP["内力上限"] < Dazuo.Data.Target) {
                    let num = App.Data.Player.HP["内力上限"] * 2 - App.Data.Player.HP["当前内力"]
                    if (num > (App.Data.Player.HP["当前气血"] - 10)) {
                        num = (App.Data.Player.HP["当前气血"] - 10)
                    }
                    if (num < 10) {
                        num = 10
                    }
                    $.PushCommands(
                        $.To(App.Params.LocDazuo),
                        $.Do(`dazuo ${num}`),
                        $.Nobusy(),
                        $.Do("hp"),
                        $.Sync(),
                    )
                }
                $.Next()
            })
        )
        $.Next()
    }
    let Quest = App.Quests.NewQuest("dazuo")
    Quest.Name = "打坐"
    Quest.Desc = "打坐到指定内力。如#start dazuo 300.不带参数打坐到内力上限"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.OnHUD = () => {
        let target = Dazuo.Data.Target || App.Data.Player.HPM["内力上限"]
        let progress = target ? Math.floor(App.Data.Player.HP["内力上限"] * 100 / target) + "%" : "-"
        return [
            new App.HUD.UI.Word("内力:"),
            new App.HUD.UI.Word(progress, 5),
        ]
    }
    Quest.OnSummary = () => {
        let target = Dazuo.Data.Target || App.Data.Player.HPM["内力上限"]
        let progress = target ? Math.floor(App.Data.Player.HP["内力上限"] * 100 / target) + "%" : "-"
        return [
            new App.HUD.UI.Word("内:"),
            new App.HUD.UI.Word(progress, 5),
        ]
    }
    Quest.OnReport = () => {
        let target = Dazuo.Data.Target || App.Data.Player.HPM["内力上限"]
        let progress = target ? Math.floor(App.Data.Player.HP["内力上限"] * 100 / target) + "%" : "-"

        return [`打坐-内力上限 ${App.Data.Player.HP["内力上限"]} 目标 ${Dazuo.Data.Target || App.Data.Player.HPM["内力上限"]} 进度 ${progress}`]
    }
    Quest.GetReady = function (q, data) {
        let target = data - 0
        if (isNaN(target) || target <= 0) {
            target = App.Data.Player.HPM["内力上限"]
        }
        if (App.Data.Player.HP["内力上限"] < target) {
            return () => {
                Dazuo.Data.Target = target
                Quest.Start(data)
            }
        }
        return null
    }

    Quest.Start = function (data) {
        Dazuo.Start()
    }
    App.Quests.Register(Quest)
})