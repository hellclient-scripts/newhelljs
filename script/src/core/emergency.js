(function (App) {

    App.Core.Emergency = {}
    App.Core.Emergency.OnFaint = function () {
        Note("被打晕了")
        App.Reconnect(App.Params.ReloginDelay)
    }
    App.BindEvent("core.faint", App.Core.Emergency.OnFaint)
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
                    App.Core.Connect.NoLogin = true
                    App.Commands.Discard()
                    Disconnect()
                    return
                }
                Note("检测成功，内功激发正常")
            }
            App.Next()
        }
    )
    App.Core.Emergency.CheckDeath = function () {
        App.Commands.PushCommands(
            App.Commands.NewDoCommand("hp;i;cha force"),
            App.Commands.NewPlanCommand(PlanCheckDeath),
        )
        App.Next()
    }
})(App)