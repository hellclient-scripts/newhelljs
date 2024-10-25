(function (App) {
    let mapModule = App.RequireModule("helllibjs/map/map.js")
    let dfsModule = App.RequireModule("helllibjs/map/dfs.js")
    App.Map.Movement.MutlipleStepConverter.Checker = function (step, index, move, map) {
        return index != 0 && dfsModule.Backward[step.Command] != null
    }
    App.Move = {}
    let refilter = /[。·！]/g;
    App.Move.Filterdir = function (dir) {
        dir = dir.replace(refilter, "");
        if (dir.indexOf("、") != -1) {
            dir = dir.split("、");
            dir = dir[dir.length - 1];
        }
        return dir
    }
    App.Map.Trace = function (map, rid, dir) {
        var flylist = Mapper.flylist()
        var exits = Mapper.getexits(rid)
        var result = ""
        flylist.concat(exits).forEach(function (path) {
            if (App.Move.Filterdir(path.command) == App.Move.Filterdir(dir)) {
                result = path.to + ""
            }
        })
        return result
    }
    App.Move.NewPath = function (path, ...initers) {
        return App.Map.NewRoute(new App.Map.Movement.Path(path.map(value => App.Map.NewStep(value))), ...initers)
    }
    App.Move.NewTo = function (target, ...initers) {
        return App.Map.NewRoute(new App.Map.Movement.To(target), ...initers)
    }
    App.Move.NewRooms = function (rooms, ...initers) {
        return App.Map.NewRoute(new App.Map.Movement.Rooms(rooms), ...initers)
    }
    App.Move.NewOrdered = function (rooms, ...initers) {
        return App.Map.NewRoute(new App.Map.Movement.Ordered(rooms), ...initers)
    }
    App.Move.LongtimeStepDelay = 60 * 1000
    App.Map.StepPlan = new App.Plan(
        App.Map.Position,
        function (task) {
            let tt = task.AddTimer(App.Map.StepTimeout, function (timer) {
                return App.Map.OnStepTimeout()
            }).WithName("timeout")
            task.AddCatcher("core.longtimestep", function () {
                tt.Reset(App.Move.LongtimeStepDelay)
                return true
            })
            task.AddCatcher("core.wrongway").WithName("wrongway")
            task.AddCatcher("core.walkbusy").WithName("walkbusy")
            task.AddCatcher("core.walkresend").WithName("walkresend")
            task.AddCatcher("core.walkretry").WithName("walkretry")
            task.AddCatcher("core.blocked", (catcher, event) => {
                catcher.WithData(event.Data)
            }).WithName("blocked")
            task.AddCatcher("core.needrest").WithName("needrest")
        },
        function (result) {
            switch (result.Type) {
                case "cancel":
                    break
                default:
                    switch (result.Name) {
                        case "timeout":
                            break
                        case "wrongway":
                            App.Map.Room.ID = ""
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
                        case "blocked":
                            App.Move.OnBlocker(result.Data)
                            break
                        case "needrest":
                            App.Move.NeedReset()
                            break
                    }
            }
        }
    )
    App.Move.NeedReset = function () {
        let snap = App.Map.Snap()
        App.Commands.Insert(
            App.Commands.NewDoCommand("yun recover;yun regenerate;hp"),
            App.NewSyncCommand(),
            App.Core.Heal.NewRestCommand(),
            App.Commands.NewFunctionCommand(() => {
                App.Map.Rollback(snap)
                App.Map.Resend(0)
            })
        )
        App.Next()

    }
    App.Move.OnBlocker = function (name) {
        App.Core.Blocker.KillBlocker(name)
    }
    App.BindEvent("core.roomentry", function (event) {
        event.Context.ProposeLater(function () {
            App.Map.OnWalking()
        })
    })
    mapModule.DefaultOnFinish = function (move, map) {
        App.Next()
    }
    mapModule.DefaultOnCancel= function (move, map) {
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

    App.Move.NewOrderedCommand = function (target, ...initers) {
        return App.Commands.NewCommand("ordered", { Rooms: target, Initers: initers })
    }
    App.Commands.RegisterExecutor("ordered", function (commands, running) {
        running.OnStart = function (arg) {
            App.Move.NewOrdered(running.Command.Data.Rooms, ...running.Command.Data.Initers).Execute()
        }
    })

    App.Move.To = function (target) {
        App.Commands.Execute(App.Move.NewToCommand(target))
        App.Next()
    }
    App.Move.Rooms = function (rooms) {
        App.Commands.Execute(App.Move.NewRoomsCommand(rooms))
        App.Next()
    }
    App.Move.Ordered = function (rooms) {
        App.Commands.Execute(App.Move.NewOrderedCommand(rooms))
        App.Next()
    }
})(App)