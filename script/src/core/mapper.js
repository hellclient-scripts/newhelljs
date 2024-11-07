(function (App) {
    let roomshModule = App.RequireModule("helllibjs/roomsh/roomsh.js")
    App.Mapper = {}
    App.Mapper.Lines = []
    roomshModule.CostToken = "%"
    App.RoomsH = new roomshModule.File()
    let mapfile = "data/rooms.h"
    Note("加载地图文件" + mapfile)
    App.RoomsH.Load(ReadLines(mapfile))
    App.Mapper.HouseID = null
    App.Mapper.HouseLoc = null
    App.Mapper.Addhouse = function (line) {
        if (line) {
            var data = line.split(" ")
            if (data.length != 3) {
                world.Note("解析房屋信息失败，格式应该为 '包子铺 bzp 1558' ")
                return
            }
            var hosuename = data[0]
            var houesid = data[1]
            var houseloc = data[2]
            let houserooms = []
            houserooms.push("1933=" + hosuename + "大院|n:1934,out:" + houseloc + ",")
            houserooms.push("1934=" + hosuename + "前庭|e:1936,push、n。:1937,s:1933,w:1935,")
            houserooms.push("1935=右卫舍|e:1934,")
            houserooms.push("1936=左卫舍|w:1934,")
            houserooms.push("1937=走道|n:1938,push、s。:1934,")
            houserooms.push("1938=" + hosuename + "迎客厅|n:1939,s:1937,open door、e:2533,")
            houserooms.push("1939=议事厅|e:1941,n:1942,s:1938,w:1940,")
            houserooms.push("1940=" + hosuename + "武厅|e:1939,")
            houserooms.push("1941=" + hosuename + "武厅|w:1939,")
            houserooms.push("1942=" + hosuename + "中庭|open west、w:1943,n:1944,s:1939,")
            houserooms.push("1943=左厢房|e:1942,")
            houserooms.push("1944=后院|e:-1,n:1947,s:1942,w:1945,")
            houserooms.push("1945=厨房|e:1944,")
            houserooms.push("1946=备用|e。:1949,")
            houserooms.push("1947=后花园|e:1948,s:1944,open door、w、close door:2681,")
            houserooms.push("1948=竹林|e:1949,w:1947,")
            houserooms.push("1949=听涛阁|w:1948,")
            App.RoomsH.Load(houserooms)
            world.Note("在位置 " + houseloc + " 添加房屋" + hosuename + "入口[" + houesid + "]")
            App.Mapper.HouseID = houesid
            App.Mapper.HouseLoc = houseloc
        } else {
            world.Note("变量 house 未设置")
        }
    }
    App.Mapper.Addhouse(GetVariable("house"))
    App.Mapper.AddPath = (fr, exitcmd) => {
        let exit = App.RoomsH.ParsePath(fr, exitcmd)
        if (exit.Ready()) {
            exit.Command = exit.Command.replaceAll(_re, "")
            exit.AddToMapper()
        }

    }
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
                    exit.Command = exit.Command.replaceAll(_re, "。")
                    exit.AddToMapper()
                }
            })
            App.Mapper.Lines.push(line.Raw)
        }
    });

    App.LoadLines("data/exits.h", "|").forEach((data) => {
        App.Mapper.AddPath(data[0], data[1])
    })
    if (App.Mapper.HouseID && App.Mapper.HouseLoc) {
        App.Mapper.AddPath(App.Mapper.HouseLoc, App.Mapper.HouseID + ":1933")
    }


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
    App.Engine.SetFilter("core.unwield", function (event) {
        App.Send("#unwield")
        App.RaiseEvent(event)
    })
    App.Engine.SetFilter("core.walkfail", function (event) {
        App.Send("#unwield")
        App.RaiseEvent(event)
    })
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

    let matcherssl = /^象一蓬蓬巨伞般伸向天空，把阳光遮得丝毫也无。尺把厚的松针/
    let matchergc = "错节，据传已有千年的树龄，是这座城市的历史见证。树干底部有一个很大"
    let matcheryp = "抽屉里散发出来的。神医平一指坐在茶几旁，独自喝着茶，看也不看你一眼。"
    let PlanLocate = new App.Plan(
        App.Positions["Room"],
        (task) => {
            task.AddCatcher("core.onexit")
            task.AddTrigger(matcherssl).WithData("2400")
            task.AddTrigger(matchergc).WithData("0")
            task.AddTrigger(matcheryp).WithData("65")
            task.AddTimer(3000)
        },
        (result) => {
            if (result.Data != null) {
                App.Map.Room.ID = result.Data
            }
        }
    )
    App.BindEvent("core.roomname", () => {
        if (!App.Map.Room.ID) {
            PlanLocate.Execute()
        }
    })
})(App)