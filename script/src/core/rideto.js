//rideto模块
(function (App) {
    let Mode = 0 // 0正常，1需要whistle,2没马
    let LastTry = 0

    //引入中间房间，降低内存消耗
    App.Map.Rides = []
    App.Map.OutsideRooms = []

    //判断是否可以raid
    ridable = function () {
        var cmd = GetVariable("cmd_ride") || ""
        cmd = cmd.trim()
        if (cmd) {
            if (Mode == 0 || Mode == 1) {
                return true
            }
            if (canretry()) {
                Mode = 0
                return true
            }
        }
        return false

    }
    let canretry = () => {
        return (new Date()).getTime() - LastTry > 5 * 1000
    }
    App.Map.AppendTagsIniter(function () {
        App.Map.SetTag("ride", ridable())
    })
    //响应没有马的状况
    App.Engine.SetFilter("core.ride.nohorse", function (event) {
        var cmd = GetVariable("cmd_ride") || ""
        cmd = cmd.trim()
        if ((Mode == 0 || canretry()) && cmd) {
            Mode = 1
            App.Send(cmd + ";whistle;" + cmd)
            App.RaiseEvent(event)
            return
        }
        LastTry = (new Date()).getTime()
        Mode = 2
        App.Map.InitTags()
        App.RaiseEvent(event)
    })
    //响应临时不骑马的状态
    App.Engine.SetFilter("core.ride.later", function (event) {
        LastTry = (new Date()).getTime()
        Mode = 2
        App.RaiseEvent(event)
    })
})(App)