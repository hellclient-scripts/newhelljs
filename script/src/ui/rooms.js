// 房间列表功能
(function (App) {
    App.UI.Rooms = {}
    App.UI.Rooms.Grid = Userinput.newdatagrid("房间信息", "rooms.h房间信息")
    App.UI.Rooms.Grid.setonpage("App.UI.Rooms.GridOnPage")
    App.UI.Rooms.GridOnPage = function (name, id, code, data) {
        if (code == 0 && data) {
            App.UI.Rooms.Grid.setpage(data - 0)
            App.UI.Publishgrid(App.UI.Rooms.Grid, App.Mapper.Lines)
        }
    }
    App.UI.Rooms.Grid.setonfilter("App.UI.Rooms.GridOnFilter")
    App.UI.Rooms.GridOnFilter = function (name, id, code, data) {
        if (code == 0) {
            App.UI.Rooms.Grid.setpage(1)
            App.UI.Rooms.Grid.setfilter(data)

            App.UI.Publishgrid(App.UI.Rooms.Grid, App.Mapper.Lines)

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
            var list = Userinput.newlist("查看房间", App.Mapper.Lines[data - 0], false)
            var result = Mapper.getexits(data)
            list.append("go " + data, "前往该房间")
            result.forEach(function (exit) {
                let name = Mapper.getroomname(exit.to)
                if (name) {
                    list.append(exit.to, "查看出口[" + name + "]: " + exit.command)
                }
            })
            list.publish("App.UI.Rooms.GridOnView")

        }
    }
})(App)