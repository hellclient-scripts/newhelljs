$.Module(function (App) {
    let Tuna = {}
    Tuna.Data = {
        Target: null
    }

    Tuna.Start = () => {
        $.PushCommands(
            $.Prepare(),
            $.Function(() => {
                if (App.Data.Player.HP["精力上限"] < Tuna.Data.Target) {
                    let num = App.Data.Player.HP["精力上限"] * 2 - App.Data.Player.HP["当前精力"]
                    if (num > (App.Data.Player.HP["当前精气"] - 10)) {
                        num = (App.Data.Player.HP["当前精气"] - 10)
                    }
                    if (num < 10) {
                        num = 10
                    }
                    $.PushCommands(
                        $.To(App.Params.LocDazuo),
                        $.Do(`tuna ${num}`),
                        $.Nobusy(),
                        $.Do("yun regenerate;hp"),
                        $.Sync(),
                    )
                }
                $.Next()
            })
        )
        $.Next()
    }
    let Quest = App.Quests.NewQuest("tuna")
    Quest.Name = "吐纳"
    Quest.Desc = "吐纳到指定精力。如#start tuna 300.不带参数打坐到精力上限"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.OnHUD = () => {
        let target = Tuna.Data.Target || App.Data.Player.HPM["精力上限"]
        let progress = target ? Math.floor(App.Data.Player.HP["精力上限"] * 100 / target) + "%" : "-"
        return [
            new App.HUD.UI.Word("精力:"),
            new App.HUD.UI.Word(progress, 5),
        ]
    }
    Quest.OnSummary = () => {
        let target = Tuna.Data.Target || App.Data.Player.HPM["精力上限"]
        let progress = target ? Math.floor(App.Data.Player.HP["精力上限"] * 100 / target) + "%" : "-"
        return [
            new App.HUD.UI.Word("精:"),
            new App.HUD.UI.Word(progress, 5),
        ]
    }
    Quest.OnReport = () => {
        let target = Tuna.Data.Target || App.Data.Player.HPM["精力上限"]
        let progress = target ? Math.floor(App.Data.Player.HP["精力上限"] * 100 / target) + "%" : "-"

        return [`吐纳-精力上限 ${App.Data.Player.HP["精力上限"]} 目标 ${Tuna.Data.Target || App.Data.Player.HPM["精力上限"]} 进度 ${progress}`]
    }
    Quest.GetReady = function (q, data) {
        let target = data - 0
        if (isNaN(target) || target <= 0) {
            target = App.Data.Player.HPM["精力上限"]
        }
        if (App.Data.Player.HP["精力上限"] < target) {
            return () => {
                Tuna.Data.Target = target
                Quest.Start(data)
            }
        }
        return null
    }

    Quest.Start = function (data) {
        Tuna.Start()
    }
    App.Quests.Register(Quest)
})