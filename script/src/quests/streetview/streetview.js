//街景模块
$.Module(function (App) {
    let StreetView = {
        Remain: [],
        Current: "",
        Count: 0,
    }
    let Quest = App.Quests.NewQuest("streetview")
    Quest.Name = "街景更新"
    Quest.Desc = "街景扫描全地图信息"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Start = function (data) {
        StreetView.Start(data)
    }
    let matcherFill = "这个容器装不了水。"
    let matcherSafe = "这里禁止战斗。"
    let matcherIndoor = "只有在户外才有必要绘制地图。"
    let PlanLook = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.Data = {
                fill: false,
                safe: false,
                outdoor: true,
            }
            task.AddTrigger(matcherFill, (tri, result) => {
                task.Data.fill = true
                return true
            })
            task.AddTrigger(matcherSafe, (tri, result) => {
                task.Data.safe = true
                return true
            })
            task.AddTrigger(matcherIndoor, (tri, result) => {
                task.Data.outdoor = false
                return true
            })
            App.Look()
            App.Send("yun recover;yun regenerate;fill cloth;hit;map here")
            App.Sync()
        },
        (result) => {
            Dump(result.Task.Data)
            print(App.Core.Room.Current.Data.Desc)
            if (StreetView.Current != "") {
                App.Mapper.Database.APITagRoom(StreetView.Current, "室外", result.Task.Data.outdoor ? 1 : 0)
                App.Mapper.Database.APITagRoom(StreetView.Current, "safe", result.Task.Data.safe ? 1 : 0)
                if (result.Task.Data.fill) {
                    App.Mapper.Database.APITraceLocation("fill", StreetView.Current)
                }
                if (App.Core.Room.Current.Data.Desc) {
                    App.Mapper.Database.APITakeSnapshot(StreetView.Current, "desc", App.Core.Room.Current.Data.Desc, "")
                }
            }
            $.Next()
        },
    )

    StreetView.Start = () => {
        let rooms = App.Mapper.Database.APIListRooms(App.Mapper.HMM.APIListOption.New())
        rooms.forEach(room => StreetView.Remain.push(room.Key));
        StreetView.Count = StreetView.Remain.length;
        var commands = []
        if (App.Data.Item.List.FindByIDLower("fire").First() == null) {
            commands.push($.Buy("fire"))
        }
        commands.push($.Function(StreetView.Next))
        App.Commands.PushCommands(...commands)
        App.Next()
    }
    StreetView.Next = () => {
        if (StreetView.Remain.length == 0) {
            StreetView.Finish()
            return
        }
        if (!App.Quests.Stopped) {
            StreetView.Current = StreetView.Remain.shift()
            $.Insert($.Function(StreetView.Next))
            App.Commands.PushCommands(
                $.Function(StreetView.ProcessNext),
            )
        }
        $.Next()
    }
    StreetView.ProcessNext = () => {
        print(`前往 ${StreetView.Current}`)
        App.Commands.PushCommands(
            $.Sync(),
            $.Prepare(),
            $.To(StreetView.Current, App.Map.NewTag("streetview", 1)),
            $.Function(StreetView.Arrive)
        ).WithFailCommand($.Function(StreetView.Fail))
        $.Next()

    }
    StreetView.Fail = () => {
        print(`处理 ${StreetView.Current} 失败`)
        $.Next()
    }
    StreetView.Arrive = () => {
        if (App.Map.Room.ID == StreetView.Current) {
            App.Commands.PushCommands(
                $.Plan(PlanLook)
            )
        }
        $.Next()
    }
    StreetView.Finish = () => {
        Quest.Cooldown(60000)
        App.Log("街景采集完毕")
        App.Tools.HMM.Export()
        App.Next()
    }
    Quest.OnHUD = () => {
        return [
            new App.HUD.UI.Word("扫街进度:"),
            new App.HUD.UI.Word(StreetView.Count > 0 ? (StreetView.Remain.length * 100 / StreetView.Count).toFixed(2) : "-", 5, true),
        ]
    }
    App.Quests.Register(Quest)
})