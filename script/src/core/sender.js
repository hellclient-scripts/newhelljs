//发送模块
(function (App) {
    let senderModule = App.RequireModule("helllibjs/sender/sender.js")
    //发送实例和初始化
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
            if (c.startsWith("#")) {//#开头是指令，强制分组
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
    //重新定义App.Send
    App.Send = function (cmd, Grouped) {
        App.Sender.Send(cmd, Grouped)
    }
    //结果所有用户输入的别名
    App.OnSendAlias = function (n, l, w) {
        App.Send(l)
    }
    //加载设置
    App.LoadSender = function () {
        Metronome.settick(App.Params.SenderTimer)
        Metronome.setbeats(App.Params.NumCmds)
        Metronome.setinterval(50)
    }
    App.LoadSender()
    //被雷P了打日志
    App.BindEvent("core.onslash", (event) => {
        App.Log(event.Data.Output)
    })
})(App)