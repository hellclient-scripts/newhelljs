(function (App) {

    App.Core.Emergency = {}
    App.Core.Emergency.OnFaint = function (event) {
        event.Context.Propose(function () {
            App.Map.DiscardMove()
            let cb = event.Context.Get("callback")
            Note("被打晕了")
            if (cb){
                Note("醒来后继续。")
            }
            App.Reconnect(App.Params.ReloginDelay,cb)
        })
    }
    App.BindEvent("core.faint", App.Core.Emergency.OnFaint)
    App.Core.Emergency.OnHealCombat = function () {
        Note("治疗被人打了")
        App.Reconnect()
    }
    App.Core.Emergency.Reset = () => {
        for (var key in App.Positions) {
            App.Positions[key].Discard()
        }
        App.Commands.Discard()
        if (!App.Quests.IsStopped()) {
            App.Commands.Append(
                App.Commands.NewFunctionCommand(() => {
                    Note("重新执行任务队列")
                    App.Quests.Restart()
                })
            )
        }
        App.Next()
    }
    App.BindEvent("core.healcombat", App.Core.Emergency.OnHealCombat)
    App.BindEvent("core.fubenfail", (event) => {
        event.Context.Propose(() => {
            let cb = event.Context.Get("callback")
            if (cb) {
                cb()
                return
            }
            App.Core.Emergency.Reset()
        })
    })
    let checkdeathmode = 0
    let PlanCheckDeath = new App.Plan(App.Positions.Connect,
        function (task) {
            checkdeathmode = 0
            App.Send("yun --")
            App.Sync(function () { task.Cancel("sync") })
            task.AddTrigger("( 你上一个动作还没有完成，不能施用内功。)", function () {
                if (checkdeathmode == 0) {
                    checkdeathmode = 1
                }
                return true
            })
            task.AddTrigger("你请先用 enable 指令选择你要使用的内功。", function () {
                if (checkdeathmode == 0) {
                    checkdeathmode = 2
                }
                return true
            })
        },
        function (result) {
            if (checkdeathmode == 1) {
                App.Commands.Insert(
                    App.Commands.NewWaitCommand(1000),
                    App.Commands.NewPlanCommand(PlanCheckDeath),
                )
            } else {
                if (checkdeathmode == 2 && !App.Data.Player.NoForce) {
                    Note("意外死亡")
                    App.Core.Emergency.NoLogin = true
                    App.Commands.Discard()
                    Disconnect()
                    return
                }
                Note("检测成功，内功激发正常")
            }
            App.Next()
        }
    )
    App.Core.Emergency.NoLogin = false
    App.Core.Emergency.CheckDeath = function () {
        App.Commands.PushCommands(
            App.Commands.NewDoCommand("hp;i;cha force"),
            App.Commands.NewPlanCommand(PlanCheckDeath),
        )
        App.Next()
    }
})(App)