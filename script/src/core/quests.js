//任务模块
(function (App) {
    let questsModule = App.RequireModule("helllibjs/quests/quests.js")
    let conditionsModule = App.RequireModule("helllibjs/conditions/conditions.js")
    App.Core.Quest = {}
    App.Core.Quest.StartedAt = 0
    //start别名
    App.Core.Quest.OnAlias = function (n, l, w) {
        let q = w[0].trim()
        if (q) {
            App.Core.Quest.Exec(w[0])
            return
        }
        q = GetVariable("quest").trim()
        if (q) {
            App.Core.Quest.Exec(q)
            return
        }
        PrintSystem("quest变量为空，未指定任务。")
    }
    App.Quest = {}
    //当前任务
    App.Core.Quest.Current = ""
    //解析处理行信息
    App.Core.Quest.Exec = function (line) {
        App.Commands.PushCommands(
            App.Commands.NewFunctionCommand(App.Init),
            App.Commands.NewFunctionCommand(() => {
                App.Core.Quest.Current = line.trim()
                App.Quests.StartLine(line.trim())
            }),
        )
        App.Next()
    }
    //创建实例并初始化
    App.Quests = new questsModule.Quests(App.Positions["Quest"], App.Commands, new conditionsModule.Conditions)
    App.BindEvent("core.stop", function () {
        App.Quests.Stop()
    })
    App.Core.Quest.Initors = []
    App.Core.Quest.AppendInitor = function (cb) {
        App.Core.Quest.Initors.push(cb)
    }
    App.Quests.OnStart = () => {
        App.Core.Timeslice.Reset()
        App.Core.Analytics.Reset()
        App.Core.Quest.StartedAt = (new Date()).getTime()
        App.Core.Quest.Initors.forEach(cb => cb())
        App.RaiseEvent(new App.Event("core.queststart"))
    }
    App.Quests.OnStop = () => {
        App.Core.Quest.Current = ""
        App.Core.Stage.ChangeStance("")
        App.RaiseEvent(new App.Event("core.queststop"))
    }
    App.Quests.OnNext = (quests) => {
        App.Core.Timeslice.Change("")
    }
    App.Quests.OnExec = (quests, ready) => {
        //检查是否是正常Quest
        if (ready.Quest) {
            let quest = ready.Quest
            let ts = quest.Timeslice ? quest.Timeslice : quest.Name
            App.Core.Timeslice.Change(ts)
        } else {
            App.Core.Timeslice.Change("")
        }
    }
    App.Quests.DelayFunction = function (quests) {
        quests.Commands.PushCommands(
            $.Timeslice("切换任务"),
            quests.Commands.NewWaitCommand(this.Delay),
            $.Timeslice(""),
        )
    }

    App.Quests.ReadyCreator = (r, exec, q) => {
        return new questsModule.Ready(r, () => {
            App.Core.Stage.ChangeStance(q.Group)
            exec()
        }, q)

    }
    let matcherGiftBouns = /^(?<prompt>.+)，你获得了((?<exp>.+)点经验、)?((?<pot>.+)点潜能、)?((?<tihui>.+)点实战体会、)?((?<zhen>.+)点正神、)?((?<fu>.+)点负神、)?((?<yueli>.+)点江湖阅历、)?((?<weiwang>.+)点威望、)?((?<gongxian>.+)点门派贡献、)?能力得到了提升。$/
    App.Engine.SetFilter("core.giftbouns", function (event) {
        let result = matcherGiftBouns.exec(event.Data.Wildcards["0"].replace("\n", ""))
        if (result) {
            let giftevent = new App.Event("core.giftbouns", result.groups)
            App.RaiseEvent(giftevent)
        }
    })

    //注册maxexp 条件
    App.Quests.Conditions.RegisterMatcher(App.Quests.Conditions.NewMatcher("maxexp", function (data, target) {
        return App.Data.Player.HP["经验"] <= (data - 0)
    }))
    //注册yueli 条件
    App.Quests.Conditions.RegisterMatcher(App.Quests.Conditions.NewMatcher("yueli", function (data, target) {
        return App.Data.Player.Score["阅历"] >= (data - 0)
    }))
    //注册pot 条件
    App.Quests.Conditions.RegisterMatcher(App.Quests.Conditions.NewMatcher("pot", function (data, target) {
        return App.Data.Player.HP["潜能"] >= (data - 0)
    }))
    //注册quest 条件
    App.Quests.Conditions.RegisterMatcher(App.Quests.Conditions.NewMatcher("quest", function (data, target) {
        let rq = App.Quests.Running
        return rq && rq.ID == data
    }))
    //注册quest 条件
    App.Quests.Conditions.RegisterMatcher(App.Quests.Conditions.NewMatcher("quest", function (data, target) {
        let rq = App.Quests.Running
        return rq && rq.ID == data
    }))
    // //注册full 条件
    // App.Quests.Conditions.RegisterMatcher(App.Quests.Conditions.NewMatcher("full", function (data, target) {
    //     if (App.Params.FullTihui > 0 && (App.Data.Player.HP["体会"] >= App.Params.FullTihui || App.Data.Player.HP["体会"] >= App.Data.Player.HPM["体会上限"]) && App.Core.Study.CanJiqu()) {
    //         return true
    //     }
    //     if (App.Params.FullPot > 0 && App.Data.Player.HP["潜能"] >= App.Params.FullPot && App.Core.Study.FilterSkill() != null) {
    //         return true
    //     }
    //     return false
    // }))
    //注册skill 条件
    App.Quests.Conditions.RegisterMatcher(App.Quests.Conditions.NewMatcher("skill", function (data, target) {
        let params = SplitN(data.trim(), " ", 2)
        let skill = params[0]
        if (!skill) {
            PrintSystem(`无效的skill条件 ${data}`)
            return false
        }
        let level = params.length > 1 ? params[1] - 0 : 1
        return (App.Core.Player.GetSkillLevelByID(skill) || 0) >= level
    }))
    //注册Cooldown 条件
    App.Quests.Conditions.RegisterMatcher(App.Quests.Conditions.NewMatcher("cooldown", function (data, target) {
        let params = SplitN(data.trim(), " ", 2)
        let quest = params[0]
        if (!quest) {
            PrintSystem(`无效的cooldown条件 ${data}`)
            return false
        }
        let q = App.Quests.GetQuest(quest)
        if (!q) {
            PrintSystem(`无法找到任务 ${quest} 的信息`)
            return false
        }
        let duration = params.length > 1 ? params[1] - 0 : 1
        return $.Now() + duration * 1000 >= q.CooldownTo
    }))


})(App)            
