(function (App) {
    let roomshModule = App.RequireModule("helllibjs/roomsh/roomsh.js")
    roomshModule.CostToken = "%"
    App.RoomsH = new roomshModule.File()
    let mapfile = "data/rooms.h"
    Note("加载地图文件" + mapfile)
    App.RoomsH.Load(ReadLines(mapfile))
    App.Map.Data.RoomsByName = {}
    _re = /·/g
    App.RoomsH.Data.forEach(line => {
        if (line.Ready()) {
            if (!App.Map.Data.RoomsByName[line.Name]) {
                App.Map.Data.RoomsByName[line.Name] = []
            }
            App.Map.Data.RoomsByName[line.Name].push(line.ID)
            Mapper.setroomname(line.ID, line.Name)
            line.Exits.forEach(exit => {
                if (exit.Ready()) {
                    exit.Command = exit.Command.replaceAll(_re, "")
                    exit.AddToMapper()
                }
            })
        }
    });
    App.LoadLines("data/exits.h", "|").forEach((data) => {
        let exit = App.RoomsH.ParsePath(data[0], data[1])
        if (exit.Ready()) {
            exit.Command = exit.Command.replaceAll(_re, "")
            exit.AddToMapper()
        }
    })
    App.Engine.SetFilter("core.wintercross", function (event) {
        App.Mapper.Data.Winter = (new Date()).getTime()
        App.RaiseEvent(event)
    })
    App.Engine.SetFilter("core.nowintercross", function (event) {
        App.Mapper.Data.Winter = null
        App.RaiseEvent(event)
    })
    App.Engine.SetFilter("core.walkrest", function (event) {
        App.Send("yun recover")
        App.RaiseEvent(event)
    })
    App.Engine.SetFilter("core.unwield.walkrest", function (event) {
        App.Send("#unwield")
        App.RaiseEvent(event)
    })
    
    App.Mapper = {}
    App.Mapper.ExcludeRooms = {}
    App.Mapper.ExpandRooms = (rooms, expand) => {
        if (rooms == null || rooms.length == 0) {
            return []
        }
        if (!expand || expand <= 0) {
            return rooms
        }
        let result = {}
        App.Map.InitTags()
        let tomap = {}
        while (expand > 0) {
            let next = []
            expand = expand - 1
            for (var i = 0; i < rooms.length; i++) {
                rid = rooms[i]
                if (result[rid]) {
                    continue
                }
                result[rid] = true
                //去除 不应该参与计算的路径
                Mapper.settag("calc", true)
                let exits = Mapper.getexits(rid)
                for (var ei = 0; ei < exits.length; ei++) {
                    let exit = exits[ei]
                    if (exit.to == "-1" || App.Mapper.ExcludeRooms[exit.to] || tomap[exit.to] || result[exit.to] || exit.delay > 20 || exit.command.indexOf("rideto ") > -1 || exit.command.indexOf("goto") > -1) {
                        continue
                    }
                    tomap[exit.to] = true
                    next.push(exit.to)
                }
            }
            if (next.length == 0) {
                break
            }
            rooms = next
        }
        for (var k in tomap) {
            result[k] = true
        }
        return Object.keys(result)

    }
    App.Mapper.Data = {}
    App.Mapper.InWinter = function () {
        return App.Mapper.Data.Winter ? (new Date().getTime() - App.Mapper.Data.Winter) < 100000 : false
    }

    App.Mapper.InitTag = function (map) {
        if (App.Mapper.InWinter()) {
            map.SetTag("winter", true)
            map.BlockPath("1236", "1237")
            map.BlockPath("1238", "1237")
        } else {
            map.SetTag("winter", false)
        }
    }
    App.Map.AppendTagsIniter(App.Mapper.InitTag)
})(App)