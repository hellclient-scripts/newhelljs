//地图模块
(function (App) {

    let roomshModule = App.RequireModule("helllibjs/roomsh/roomsh.js")
    let mapModule = App.RequireModule("helllibjs/map/map.js")
    App.Mapper = {}
    App.Mapper.HMM = mapModule.HMM
    App.Mapper.Database = mapModule.Database
    App.Map.Data.RoomsByName = {}
    App.Mapper.HMM.HMMEncoder.DecodeRoomHook = (room) => {
        if (!App.Map.Data.RoomsByName[room.Name]) {
            App.Map.Data.RoomsByName[room.Name] = []
        }
        App.Map.Data.RoomsByName[room.Name].push(room.Key)
        return room;
    }
    Note("加载地图文件" + "data/hell.hmm")
    mapModule.Database.Import(ReadFile("data/hell.hmm"))

    App.Mapper.HouseID = null
    App.Mapper.HouseLoc = null
    //添加房子
    App.Mapper.HomeRooms = []
    App.Mapper.Paths = []
    App.Mapper.NewCondition = function (tag, value = 1, not = false) {
        return App.Mapper.HMM.ValueCondition.New(tag, value, not)
    }
    App.Mapper.NewExit = function (command, to, cost = 1) {
        let model = App.Mapper.HMM.Exit.New()
        model.Command = command
        model.To = to
        model.Cost = cost
        return model
    }
    App.Mapper.NewRoom = function (key, name, exits = []) {
        let model = App.Mapper.HMM.Room.New()
        model.Key = key
        model.Name = name
        model.Exits = exits
        return model
    }
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
            App.Mapper.HomeRooms = [
                App.Mapper.NewRoom("1933", `${hosuename}大院`, [
                    App.Mapper.NewExit("n", "1934"),
                    App.Mapper.NewExit("out", houseloc),
                ]),
                App.Mapper.NewRoom("1934", `${hosuename}前庭`, [
                    App.Mapper.NewExit("e", "1936"),
                    App.Mapper.NewExit("push、n。", "1937"),
                    App.Mapper.NewExit("s", "1933"),
                    App.Mapper.NewExit("w", "1935"),
                ]),
                App.Mapper.NewRoom("1935", `右卫舍`, [
                    App.Mapper.NewExit("e", "1934"),
                ]),
                App.Mapper.NewRoom("1936", `左卫舍`, [
                    App.Mapper.NewExit("w", "1934"),
                ]),
                App.Mapper.NewRoom("1937", `走道`, [
                    App.Mapper.NewExit("n", "1938"),
                    App.Mapper.NewExit("push、s。", "1934"),
                ]),
                App.Mapper.NewRoom("1938", `${hosuename}迎客厅`, [
                    App.Mapper.NewExit("n", "1939"),
                    App.Mapper.NewExit("s", "1937"),
                    App.Mapper.NewExit("open door、e", "2533"),
                ]),
                App.Mapper.NewRoom("1939", `议事厅`, [
                    App.Mapper.NewExit("e", "1941"),
                    App.Mapper.NewExit("n", "1942"),
                    App.Mapper.NewExit("s", "1938"),
                    App.Mapper.NewExit("w", "1940"),
                ]),
                App.Mapper.NewRoom("1940", `${hosuename}武厅`, [
                    App.Mapper.NewExit("e", "1939"),
                ]),
                App.Mapper.NewRoom("1941", `${hosuename}武厅`, [
                    App.Mapper.NewExit("w", "1939"),
                ]),
                App.Mapper.NewRoom("1942", `${hosuename}中庭`, [
                    App.Mapper.NewExit("open west、w", "1943"),
                    App.Mapper.NewExit("n", "1944"),
                    App.Mapper.NewExit("s", "1939"),
                ]),
                App.Mapper.NewRoom("1943", `左厢房`, [
                    App.Mapper.NewExit("e", "1942"),
                ]),
                App.Mapper.NewRoom("1944", `后院`, [
                    App.Mapper.NewExit("e", "-1"),
                    App.Mapper.NewExit("n", "1947"),
                    App.Mapper.NewExit("s", "1942"),
                    App.Mapper.NewExit("w", "1945"),
                ]),
                App.Mapper.NewRoom("1945", `厨房`, [
                    App.Mapper.NewExit("e", "1944"),
                ]),
                App.Mapper.NewRoom("1946", `备用`, [
                    App.Mapper.NewExit("e。", "1949"),
                ]),
                App.Mapper.NewRoom("1947", `后花园`, [
                    App.Mapper.NewExit("e", "1948"),
                    App.Mapper.NewExit("s", "1944"),
                    App.Mapper.NewExit("open door、w、close door", "2681"),
                ]),
                App.Mapper.NewRoom("1948", `竹林`, [
                    App.Mapper.NewExit("e", "1949"),
                    App.Mapper.NewExit("w", "1947"),
                ]),
                App.Mapper.NewRoom("1949", `听涛阁`, [
                    App.Mapper.NewExit("w", "1948"),
                ]),
            ]
            world.Note("在位置 " + houseloc + " 添加房屋" + hosuename + "入口[" + houesid + "]")
            App.Mapper.HouseID = houesid
            App.Mapper.HouseLoc = houseloc
        } else {
            world.Note("变量 house 未设置")
        }
    }
    App.Mapper.Addhouse(GetVariable("house"))

    _re = /·/g;
    //加载额外出口
    // App.LoadLines("data/exits.h", "|").forEach((data) => {
    //     App.Mapper.AddPath(data[0], data[1])
    // })
    (() => {
        App.Mapper.Paths.push((() => {
            let model = App.Mapper.HMM.Path.New()
            model.From = "1236"
            model.To = "1237"
            model.Command = "cross"
            model.Conditions = [App.Mapper.NewCondition("winter")]
            return model;
        })())
        App.Mapper.Paths.push((() => {
            let model = App.Mapper.HMM.Path.New()
            model.From = "1237"
            model.To = "1236"
            model.Command = "cross"
            model.Conditions = [App.Mapper.NewCondition("winter")]
            return model;
        })())
    })

    if (App.Mapper.HouseID && App.Mapper.HouseLoc) {
        App.Mapper.Paths.push((() => {
            let model = App.Mapper.HMM.Path.New()
            model.From = App.Mapper.HouseLoc
            model.To = "1933"
            model.Command = App.Mapper.HouseID
            model.Conditions = [App.Mapper.NewCondition("streeview", 1, true)]
            return model;
        })())
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
    //扩展房间，第一个参数为房间id数组，第二个参数为膨胀多少格。
    App.Mapper.ExpandRooms = (rooms, expand) => {
        return App.Mapper.Database.APIDilate(rooms, expand, App.Mapper.Database.Context,)
    }
    App.Mapper.Data = {}
    App.Mapper.InWinter = function () {
        return App.Mapper.Data.Winter ? (new Date().getTime() - App.Mapper.Data.Winter) < 100000 : false
    }

    App.Mapper.InitTag = function (map) {
        if (App.Mapper.HomeRooms.length) {
            map.AddTemporaryRooms(App.Mapper.HomeRooms)
        }
        if (App.Mapper.Paths.length) {
            App.Mapper.Paths.forEach((p) => {
                map.AddTemporaryPath(p)
            })
        }
        if (App.Mapper.InWinter()) {
            map.SetTag("winter", 1)
            map.BlockPath("1236", "1237")
            map.BlockPath("1238", "1237")
        } else {
            map.SetTag("winter", 0)
        }
    }
    App.Map.AppendInitiator(App.Mapper.InitTag)
    //额外地图定位
    let matcherssl = /^象一蓬蓬巨伞般伸向天空，把阳光遮得丝毫也无。尺把厚的松针/
    let matchergc = "错节，据传已有千年的树龄，是这座城市的历史见证。树干底部有一个很大"
    let matcheryp = "抽屉里散发出来的。神医平一指坐在茶几旁，独自喝着茶，看也不看你一眼。"
    let matcherdzm = "    前面就是明教的“地字门”了，这里是明教中女弟子"
    //额外地图定位计划
    let PlanLocate = new App.Plan(
        App.Positions["Room"],
        (task) => {
            task.AddCatcher("core.onexit")
            task.AddTrigger(matcherssl).WithData("2400")
            task.AddTrigger(matchergc).WithData("0")
            task.AddTrigger(matcheryp).WithData("65")
            task.AddTrigger(matcherdzm).WithData("1799")
            task.AddTimer(3000)
        },
        (result) => {
            if (result.Data != null) {
                App.Core.Room.Current.ID = result.Data
            }
        }
    )
    App.BindEvent("core.roomname", () => {
        if (!App.Map.Room.ID) {
            PlanLocate.Execute()
        }
    })
    App.Map.AppendInitiator((map) => {
        for (var key in App.Data.Player.Skills) {
            let skill = App.Data.Player.Skills[key]
            if (skill["基本"] == skill.ID) {
                map.SetTag(skill.ID, skill["等级"])
            }
        }
    })

})(App)