//help 模块
(function (App) {
    App.Core.HelpFind = {}
    var data_helpfind = {}
    var data_lasthelp_id = ""
    var data_lasthelp_time = 0
    var NoHelp = false
    function GetWorldInfo() {
        return world.WorldAddress() + ":" + world.WorldPort()
    }
    App.Core.HelpFind.onBroadcast = (msg, global) => {
        if (!global) {
            App.RaiseEvent(new App.Event("core.localBroadcast", msg))
            return
        }
        var data = SplitN(msg, " ", 3)
        if (data.length < 2) {
            return
        }
        if (data[1] != GetWorldInfo()) {
            return
        }
        switch (data[0]) {
            case "help":
                if (data.length != 3) {
                    return
                }
                if (NoHelp) {
                    return
                }
                data_helpfind[data[2]] = (new Date()).getTime();
                break
            case "found":
                if (data.length != 3) {
                    return
                }
                var info = SplitN(data[2], "|", 3)
                if (info.length != 3 || isNaN(info[2])) {
                    return
                }
                OnFound(info[0], info[1], info[2])
        }
    }
    function OnFound(name, id, loc) {
        if (!loc || loc == -1) {
            return
        }
        delete data_helpfind[name]
        App.RaiseEvent(new App.Event("core.helpfind.onfound", {
            Name: name,
            ID: id,
            Loc: loc
        }))
    }
    App.Core.HelpFind.OnNPC = (name, id, loc) => {
        if (NoHelp) {
            return
        }
        if (loc && loc != -1) {
            if (data_helpfind[name]) {
                delete data_helpfind[name]
                Broadcast("found " + GetWorldInfo() + " " + name + "|" + id + "|" + loc, true)
            }
        }
    }

    App.Core.HelpFind.HelpFind = (name) => {
        if (NoHelp) {
            return
        }
        var t = (new Date()).getTime()
        if (name == data_lasthelp_id && t - data_lasthelp_time < 2000) {
            return
        }
        data_lasthelp_id = name
        data_lasthelp_time = t
        Broadcast("help " + GetWorldInfo() + " " + name, true)
    }
    //清理数据
    function on_gc() {
        var t = (new Date()).getTime()
        for (var key in data_helpfind) {
            if (t - data_helpfind[key] > 600000) {
                delete data_helpfind[key]
            }
        }
    }
    let last_gc = 0
    App.Engine.BindTimeHandler(function () {
        let now = (new Date()).getTime()
        if (now - last_gc > 300000) {
            last_gc = now
            on_gc()
        }
    })
})(App)