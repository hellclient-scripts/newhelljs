// 房间列表功能
(function (App) {
    App.UI.Rooms = {}
    App.UI.Rooms.Grid = Userinput.newdatagrid("房间信息", "rooms.h房间信息")
    App.UI.Rooms.Grid.setonpage("App.UI.Rooms.GridOnPage")
    App.UI.Rooms.Lines = () => {
        let result = App.Mapper.Database.APIListRooms(App.Mapper.HMM.APIListOption.New())
        result.sort((a, b) => {
            if (a.Key * 1 < b.Key * 1) return -1
        })
        return result.map((room) => `${room.Key}|${room.Name}`)
    }
    App.UI.Rooms.GridOnPage = function (name, id, code, data) {
        if (code == 0 && data) {
            App.UI.Rooms.Grid.setpage(data - 0)
            App.UI.Publishgrid(App.UI.Rooms.Grid, App.UI.Rooms.Lines())
        }
    }
    App.UI.Rooms.Grid.setonfilter("App.UI.Rooms.GridOnFilter")
    App.UI.Rooms.GridOnFilter = function (name, id, code, data) {
        if (code == 0) {
            App.UI.Rooms.Grid.setpage(1)
            App.UI.Rooms.Grid.setfilter(data)
            App.UI.Publishgrid(App.UI.Rooms.Grid, App.UI.Rooms.Lines())

        }
    }
    App.UI.Rooms.Grid.setonview("App.UI.Rooms.GridOnView")
    App.UI.Rooms.GridOnView = function (name, id, code, data) {
        if (code == 0 && data) {
            var cmds = data.split(" ")
            if (cmds.length > 1) {
                App.UI.Rooms.Grid.hide()
                App.Move.To(cmds[1]);
                return
            }
            var list = Userinput.newlist("查看房间", App.UI.Rooms.Lines()[data - 0], false)
            var result = App.Map.GetRoomExits(data, true, true)
            list.append("go " + data, "前往该房间")
            result.forEach(function (exit) {
                let rooms = App.Mapper.Database.APIListRooms(App.Mapper.HMM.APIListOption.New().WithKeys([exit.To]))
                if (rooms.length > 0) {
                    list.append(exit.To, "查看出口[" + rooms[0].Name + "]: " + exit.Command)
                }
            })
            list.publish("App.UI.Rooms.GridOnView")

        }
    }
})(App)