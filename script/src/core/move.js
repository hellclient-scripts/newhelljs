(function (App) {
    let mapModule = App.RequireModule("helllibjs/map/map.js")

    App.Move = {}
    App.Move.NewPath = function (path, ...initers) {
        return App.Map.NewRoute(new App.Map.Movement.Path(path.map(value => App.Map.NewStep(value))), ...initers)
    }
    App.Move.NewTo = function (target, ...initers) {
        return App.Map.NewRoute(new App.Map.Movement.To(target), ...initers)
    }
    App.Move.NewRooms = function (rooms, ...initers) {
        return App.Map.NewRoute(new App.Map.Movement.Rooms(rooms), ...initers)
    }
    App.Move.LongtimeStepDelay=60*1000
    App.Map.StepPlan = new App.Plan(
        App.Map.Position,
        function (task) {
            let tt=task.AddTimer(App.Map.StepTimeout).WithName("timeout")
            task.AddCatcher("core.longtimestep",function(){
                tt.Reset(App.Move.LongtimeStepDelay)
                return true
            })
            task.AddCatcher("core.wrongway").WithName("wrongway")
            task.AddCatcher("core.walkbusy").WithName("walkbusy")
            task.AddCatcher("core.walkresend").WithName("walkresend")
            task.AddCatcher("core.walkretry").WithName("walkretry")
        },
        function (result) {
            switch (result.Type) {
                case "cancel":
                    break
                default:
                    switch (result.Name) {
                        case "timeout":
                            App.Map.OnStepTimeout()
                            break
                        case "wrongway":
                            App.Map.Room.ID=""
                            App.Map.Retry()
                            break
                        case "walkbusy":
                            App.Map.Resend()
                            break
                        case "walkresend":
                            App.Map.Resend(0)
                            break
                        case "walkretry":
                            App.Map.Retry()
                            break
                    }
            }
        }
    )
    App.BindEvent("core.roomentry", function (event) {
        event.Context.ProposeLater("", function () {
            App.Map.OnWalking()
        })
    })
    mapModule.DefaultOnFinish = function (move, map) {
        App.Next()
    }
    mapModule.DefaultOnCamce = function (move, map) {
        App.Fail()
    }
    App.Move.NewToCommand = function (target, ...initers) {
        return App.Commands.NewCommand("to", { Target: target, Initers: initers })
    }
    App.Commands.RegisterExecutor("to", function (commands, running) {
        running.OnStart = function (arg) {
            App.Move.NewTo(running.Command.Data.Target, ...running.Command.Data.Initers).Execute()
        }
    })
    App.Move.NewRoomsCommand = function (target, ...initers) {
        return App.Commands.NewCommand("rooms", { Rooms: target, Initers: initers })
    }
    App.Commands.RegisterExecutor("rooms", function (commands, running) {
        running.OnStart = function (arg) {
            App.Move.NewRooms(running.Command.Data.Rooms, ...running.Command.Data.Initers).Execute()
        }
    })
    App.Move.To = function (target) {
        App.Commands.Execute(App.Move.NewToCommand(target))
        App.Next()
    }
    App.Move.Rooms=function(rooms){
        App.Commands.Execute(App.Move.NewRoomsCommand(rooms))
        App.Next()
    }
    App.Move.Search = function (name) {
        return function (move, map) {
            move.Option.MutlipleStep = false
            move.OnArrive = function (move, map) {
                if (name && App.Map.Room.Data.Objects.FindByName(name).IsNotEmpty()) {
                    map.FinishMove()
                    return
                } 
                move.Walk(map)
            }
        }
    }
})(App)