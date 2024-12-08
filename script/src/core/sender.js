(function (App) {
    let senderModule = App.RequireModule("helllibjs/sender/sender.js")
    App.Sender = new senderModule.Sender()
    App.Sender.GetterEcho = () => {
        return App.Params.Echo == "t"
    }
    let re = /[;\n]/g
    let re2 = /[！·。]/g
    let linkre = /、/g
    App.Sender.Parser = function (cmd, Grouped) {
        let result = []
        if (Grouped) {
            result.push([])
        }
        cmd = cmd.replaceAll(re2, "")
        let data = cmd.split(re)
        data.forEach(c => {
            c = c.trim()
            if (c.startsWith("#")) {
                result.push([c])
                return
            }
            let cmds = c.split(linkre)
            if (Grouped) {
                result[0] = result[0].concat(cmds)
            } else {
                result.push(cmds)
            }
        });
        return result
    }
    App.Sender.TryAlias = function (sender, cmd) {
        if (cmd.startsWith("#")) {
            let data = SplitN(cmd, " ", 2)
            if (sender.Aliases[data[0]]) {
                sender.Aliases[data[0]](data[1] ? data[1] : "")
                return true
            }
        }
        return false
    }
    App.Send = function (cmd, Grouped) {
        App.Sender.Send(cmd, Grouped)
    }
    App.LoadSender = function () {
        let numcmds = GetVariable("num_cmds")
        if (!isNaN(numcmds)) {
            numcmds = numcmds - 0
            if (numcmds <= 0) { numcmds = App.Params.DefaultNumCmds }
        }
        Metronome.settick(1100)
        Metronome.setinterval(50)
        Metronome.setbeats(numcmds / 2)
    }
    App.LoadSender()
})(App)