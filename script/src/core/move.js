//移动模块
(function (App) {
    let mapModule = App.RequireModule("helllibjs/map/map.js")
    let dfsModule = App.RequireModule("helllibjs/map/dfs.js")
    //多步移动判断
    App.Map.Movement.MultipleStepConverter.Checker = function (step, index, move, map) {
        return index != 0 && dfsModule.Backward[step.Command] != null
    }
    //定位命令
    App.Map.Movement.DefaultLocateNext = (move, map, locate) => {
        //避免被关在房间里
        if (App.Map.Room.Exits.length == 0) {
            App.Send("open door;open gate")
        }
        return locate.MoveNext(move, map)
    }
    App.Map.Movement.CheckRoomCmd = "#l"
    App.Look = () => {
        App.Map.Room.Keep = true
        App.Send("l")
    }
    //注册#l别名
    App.Sender.RegisterAlias("#l", function (data) {
        App.Look()
    })
    //移动模块切换指令
    App.Map.OnModeChange = (map, old, mode) => {
        if (mode == "locate") {
            App.Send("unset brief")
        } else {
            App.Send("set brief")
        }
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
    //移动跟踪
    App.Map.Trace = function (map, rid, dir) {
        var exits = App.Map.GetRoomExits(rid, true)
        var result = ""
        exits.forEach(function (path) {
            if (App.Move.Filterdir(path.Command) == App.Move.Filterdir(dir)) {
                result = path.To + ""
            }
        })
        return result
    }
    //创建固定路线移动
    App.Move.NewPath = function (path, ...initiators) {
        let pathlist = path.map(value => typeof value == "string" ? App.Map.NewStep(value) : value)
        return App.Map.NewRoute(new App.Map.Movement.Path(pathlist), ...initiators)
    }
    //创建定点路线移动
    App.Move.NewTo = function (target, ...initiators) {
        if (typeof target == "string") {
            target = target.split(",").map((val) => val.trim())
        }
        return App.Map.NewRoute(new App.Map.Movement.To(target), ...initiators)
    }
    //创建房间路线移动
    App.Move.NewRooms = function (rooms, ...initiators) {
        return App.Map.NewRoute(new App.Map.Movement.Rooms(rooms), ...initiators)
    }
    //创建固定房间移动
    App.Move.NewOrdered = function (rooms, ...initiators) {
        return App.Map.NewRoute(new App.Map.Movement.Ordered(rooms), ...initiators)
    }
    App.Move.LongtimeStepDelay = 60 * 1000
    App.Move.RetryStep = false
    //移动的计划，移动失败处理
    App.Map.StepPlan = new App.Plan(
        App.Map.Position,
        function (task) {
            App.Move.RetryStep = false
            let tt = task.AddTimer(App.Map.StepTimeout, function (timer) {
                return App.Map.OnStepTimeout()
            }).WithName("timeout")
            task.AddCatcher("core.longtimestep", function () {
                tt.Reset(App.Move.LongtimeStepDelay)
                return true
            })

            task.AddCatcher("core.retrymove", function () {
                App.Move.RetryStep = true
                return true
            })
            task.AddCatcher("core.movereset").WithName("movereset")
            task.AddCatcher("core.wrongway").WithName("wrongway")
            task.AddCatcher("core.walkbusy").WithName("walkbusy")
            task.AddCatcher("core.walkresend").WithName("walkresend")
            task.AddCatcher("core.walkretry").WithName("walkretry")
            task.AddCatcher("core.walkfail").WithName("walkfail")
            task.AddCatcher("core.blocked2", (catcher, event) => {
                if (App.Core.Room.Current.ID == "") {
                    return true;
                }
            }).WithName("blocked2")
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
                        case "movereset":
                            App.Map.Room.ID = ""
                            App.Map.Retry()
                            break
                        case "wrongway":
                            if (App.Move.RetryStep) {
                                App.Map.Resend(0)
                                return
                            }
                            App.Map.Room.ID = ""
                            App.Sync(() => {
                                App.Map.Retry()
                            })
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
                        case "blocked2":
                            App.Core.Blocker.BlockStepRetry()
                            break
                        case "needrest":
                            App.Move.NeedRest()
                            break
                        case "walkfail":
                            App.Move.OnWalkFail()
                            break
                        default:
                    }
            }
        }
    )
    //移动休息(内力/体力不足)处理
    App.Move.NeedRest = function () {
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
    //移动失败处理
    App.Move.OnWalkFail = function (name) {
        $.RaiseStage("wait")
        App.Map.Position.Wait(1000, 0, () => {
            App.Send("halt")
            App.Core.Blocker.BlockStepRetry()
        })
    }
    //被拦截处理
    App.Move.OnBlocker = function (name) {
        App.Core.Blocker.KillBlocker(name)
    }
    //房间名回显
    App.BindEvent("core.roomentry", function (event) {
        event.Context.ProposeLater(function () {
            App.Map.OnWalking()
            if (App.Params.ShowRoomID.trim() == "t") {
                Note(`R:${App.Map.Room.ID}`)
            }
        })
    })
    mapModule.DefaultOnFinish = function (move, map) {
        App.Next()
    }
    mapModule.DefaultOnCancel = function (move, map) {
        App.Fail()
    }
    //注册path指令
    App.Move.NewPathCommand = function (path, ...initiators) {
        return App.Commands.NewCommand("path", { Target: path, Initers: initiators })
    }
    App.Commands.RegisterExecutor("path", function (commands, running) {
        running.OnStart = function (arg) {
            let target = running.Command.Data.Target
            if (typeof (target) == "string") {
                target = target.split(",")
            }
            App.Move.NewPath(running.Command.Data.Target, ...running.Command.Data.Initers).Execute()
        }
    })
    //注册to指令
    App.Move.NewToCommand = function (target, ...initiators) {
        return App.Commands.NewCommand("to", { Target: target, Initers: initiators })
    }
    App.Commands.RegisterExecutor("to", function (commands, running) {
        running.OnStart = function (arg) {
            let target = running.Command.Data.Target
            if (typeof (target) == "string") {
                target = [target]
            }
            if (target) {
                Note(`${App.Map.Room.ID} 前往 ${target.join(",")}`)
            }
            App.Move.NewTo(running.Command.Data.Target, ...running.Command.Data.Initers).Execute()
        }
    })
    //注册rooms指令
    App.Move.NewRoomsCommand = function (target, ...initiators) {
        return App.Commands.NewCommand("rooms", { Rooms: target, Initers: initiators })
    }
    App.Commands.RegisterExecutor("rooms", function (commands, running) {
        running.OnStart = function (arg) {
            App.Move.NewRooms(running.Command.Data.Rooms, ...running.Command.Data.Initers).Execute()
        }
    })
    //注册ordered指令
    App.Move.NewOrderedCommand = function (target, ...initiators) {
        return App.Commands.NewCommand("ordered", { Rooms: target, Initers: initiators })
    }
    App.Commands.RegisterExecutor("ordered", function (commands, running) {
        running.OnStart = function (arg) {
            App.Move.NewOrdered(running.Command.Data.Rooms, ...running.Command.Data.Initers).Execute()
        }
    })
    //to别名
    App.Move.To = function (target) {
        App.Commands.Execute(App.Move.NewToCommand(target))
        App.Next()
    }
    //rooms别名
    App.Move.Rooms = function (rooms) {
        App.Commands.Execute(App.Move.NewRoomsCommand(rooms))
        App.Next()
    }
    //ordered别名
    App.Move.Ordered = function (rooms) {
        App.Commands.Execute(App.Move.NewOrderedCommand(rooms))
        App.Next()
    }
    //加载设置
    App.Move.Load = () => {
        App.Map.Movement.MaxStep = App.Params.NumStep
    }
})(App)