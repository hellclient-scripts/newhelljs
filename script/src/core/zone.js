(function (App) {
    App.Zone = {}
    App.Zone.Maps = {}
    let convertPath = function (fr, cmds) {
        return App.Map.TraceRooms(fr, ...cmds.split(";"))
    }
    App.Zone.Maps["扬州"] = convertPath("54", "w;w;w;n;w;s;e;e;e;e;e;e;e;e;n;s;se;nw;w;w;w;w;s;s;s;s;su;nd;w;e;e;w;n;n;se;s;n;e;ne;e;w;sw;w;nw;n;n;n;e;w;w;e;n;w;u;d;e;n;e;s;n;e;s;n;e;n;e;n;w;n;s;s;s;s;s;w;e;se;nw;n;n;n;n;e;e;ne;n;n;s;s;sw;se;s;e;w;s;n;w;e;n;nw;w;w;w;w;w;w;n;s;s;n;w;n;n;n;s;s;s;w;w;w;w;s;s;n;n;w;n;s;w;e;e;e;e;e;e;e;e;n;w;e;n;e;u;d;w;n;n;n;n;n;s;s;s;s;w;w;w;n;n;s;w;s;e;e;e;e;s;s;w;e;s;w;n;s;s;n;w;e;e;e;e;w;s;n;w;s;w;e;s;s;n;n;n;w;s;n;n;s;e;s;s;s")
    App.UserQueue.UserQueue.RegisterCommand("#search", function (uq, data) {
        let result = SplitN(data, " ", 2)
        if (result.length != 2) {
            Note("#search 格式错误，应该为 #search 地区 NPC中文名")
            uq.Commands.Next()
            return
        }
        let npc = result[1]
        if (!npc) {
            npc = ""
        }
        uq.Commands.Append(
            uq.Commands.NewFunctionCommand(function () { App.Zone.Search(npc, result[0]) }),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })

    App.Zone.Search = function (target, zone, singlestep, foundcommands) {
        let rooms = App.Zone.Maps[zone]
        if (!rooms) {
            PrintSystem("#search 地图未招到")
            App.Fail()
            return
        }
        target = target || ""
        let loc = null
        finder = function (move, map) {
            move.Option.MutlipleStep = singlestep != true
            move.OnRoom = function (move, map, step) {
                if (map.Room.ID) {
                    if (map.Room.Data.Objects.FindByName(target).IsNotEmpty()) {
                        loc = map.Room.ID
                        Note(target + " @ " + loc)
                    }
                }
            }
            move.OnArrive = function (move, map) {
                if (loc) {
                    App.Map.FinishMove()
                    return
                }
                move.Walk(map)
            }
        }
        App.Commands.PushCommands(
            App.Move.NewRoomsCommand(rooms, finder),
            App.Commands.NewFunctionCommand(() => {
                if (loc && loc != App.Map.Room.ID) {
                    App.Commands.Insert(
                        App.Move.NewToCommand(loc)
                    )
                    if (foundcommands && foundcommands.length) {
                        App.Commands.Insert(...foundcommands)
                    }
                }
                App.Next()
            })
        )
        App.Next()
    }
    App.UserQueue.UserQueue.RegisterCommand("#killin", function (uq, data) {
        let result = SplitN(data, " ", 2)
        if (result.length != 2) {
            Note("#search 格式错误，应该为 #search 地区 NPC中文名")
            uq.Commands.Next()
            return
        }
        let npc = result[1]
        if (!npc) {
            npc = ""
        }
        uq.Commands.Append(
            App.NewPrepareCommand(""),
            uq.Commands.NewFunctionCommand(function () { App.Zone.Search(npc, result[0]) }),
            uq.Commands.NewFunctionCommand(function () {
                if (npc) {
                    let obj = App.Map.Room.Data.Objects.FindByName(npc).First()
                    if (obj && obj.IDLower) {
                        App.Commands.Insert(
                            App.NewKillCommand(obj.IDLower, App.NewCombat("userqueue"))
                        )
                    }
                }
                App.Next()
            }),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })

})(App)