(function (App) {
    App.Zone = {}
    App.Zone.Maps = {}
    App.Zone.Info = {}
    let convertPath = function (fr, cmds) {
        return App.Map.TraceRooms(fr, ...cmds.split(";"))
    }
    App.LoadLines("data/zones.txt", "|").forEach((data) => {
        switch (data[1]) {
            case "path":
                App.Zone.Maps[data[0]] = convertPath(data[2], data[3])
                break
            default:
                PrintSystem("无效的路径类型" + data[1])
        }
    })
    App.LoadLines("data/info.txt", "|").forEach((data) => {
        App.Zone.Info[data[0]] = {
            ID: data[0],
            Name: data[1],
            NPC: data[2],
            Area: data[3],
            Loc: data[4],
        }
    })
    let DefaultChecker = function (wanted) {
        return App.Map.Room.Data.Objects.FindByName(wanted.Target).First() || App.Map.Room.Data.Objects.FindByIDLower(wanted.Target).First()
    }
    class Wanted {
        constructor(target, zone) {
            this.Target = target
            this.Zone = zone
        }
        Target = ""
        Name = ""
        Zone = ""
        ID = ""
        Loc = null
        OnFound = null
        SingleStep = false
        Ordered = true
        WithID(id) {
            this.ID = id
            return this
        }
        WithLoc(loc) {
            this.Loc = loc
            return this
        }
        WithOnFound(found) {
            this.OnFound = found
            return this
        }
        WithSingleStep(s) {
            this.SingleStep = s
            return this
        }
        WithChecker(c) {
            this.Checker = c
            return this
        }
        WithOrdered(o) {
            this.Ordered = o
            return this
        }
        Checker = DefaultChecker
    }
    App.NewWanted = function (target, zone) {
        return new Wanted(target, zone)
    }
    App.Zone.Wanted = null
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
        let zone = result[0]
        let wanted = App.NewWanted(npc, zone)
        uq.Commands.Append(
            uq.Commands.NewFunctionCommand(function () { App.Zone.Search(wanted) }),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })
    App.Zone.Finder = function (move, map) {
        wanted = App.Zone.Wanted
        move.Option.MutlipleStep = wanted.SingleStep != true
        move.OnRoom = function (move, map, step) {
            let item = wanted.Checker(wanted)
            if (item) {
                wanted.Name = item.GetData().Name
                wanted.ID = item.IDLower
                if (map.Room.ID) {
                    wanted.Loc = App.Map.Room.ID
                    Note(wanted.Target + " @ " + wanted.Loc)
                }
            }
        }
        move.OnArrive = function (move, map) {
            if (wanted.Loc) {
                App.Map.FinishMove()
                return
            }
            move.Walk(map)
        }
    }
    App.Zone.Search = function (wanted) {
        let rooms = App.Zone.Maps[wanted.Zone]
        if (!rooms) {
            PrintSystem("#search 地图未找到")
            App.Fail()
            return
        }
        App.Zone.SearchRooms(rooms, wanted)
    }
    App.Zone.SearchRooms = function (rooms, wanted) {
        App.Zone.Wanted = wanted
        wanted.Loc = null
        let move = wanted.Ordered ? App.Move.NewOrderedCommand(rooms, App.Zone.Finder) : App.Move.NewRoomsCommand(rooms, App.Zone.Finder)
        App.Commands.PushCommands(
            move,
            App.Commands.NewFunctionCommand(() => {
                if (App.Zone.Wanted.Loc && App.Zone.Wanted.Loc != App.Map.Room.ID) {
                    App.Commands.Insert(
                        App.Move.NewToCommand(App.Zone.Wanted.Loc)
                    )
                    if (App.Zone.Wanted.OnFound) { App.Zone.Wanted.OnFound() }
                }
                App.Next()
            }),
            App.Commands.NewFunctionCommand(() => {
                if (App.Zone.Wanted.Loc && !App.Zone.Wanted.ID) {
                    App.Send("id here")
                    App.Commands.Insert(
                        App.NewSyncCommand(),
                        App.Commands.NewFunctionCommand(() => {
                            if (App.Map.Room.Data.IDHere && App.Map.Room.Data.IDHere[wanted.Target]) {
                                wanted.ID = App.Map.Room.Data.IDHere[wanted.Target].toLowerCase()
                            }
                            App.Next()
                        })
                    )
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
        let zone = result[0]
        let wanted = App.NewWanted(npc, zone)
        uq.Commands.Append(
            App.NewPrepareCommand(""),
            uq.Commands.NewFunctionCommand(function () { App.Zone.Search(wanted) }),
            uq.Commands.NewFunctionCommand(function () {
                if (npc) {
                    if (App.Zone.Wanted.Loc && App.Zone.Wanted.ID) {
                        App.Commands.Insert(
                            App.NewKillCommand(App.Zone.Wanted.ID, App.NewCombat("userqueue"))
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