//推送
(function (App) {
    const Package = "App.PushMessage"
    let module = {}
    App.PushMessage = module
    //通过 App.PushMessage.Notify("title","content")可以发送推送
    let newconfig = () => {
        return {
            Server: "",
            Enabled: false,
            LarkWebHook: "",
        }
    }
    module.Config = newconfig()
    module.Load = () => {
        let data = GetVariable('__plugin_push').trim()
        if (data) {
            module.Config = JSON.parse(data)
        }
    }
    module.Save = () => {
        let data = JSON.stringify(module.Config)
        SetVariable('__plugin_push', data)
    }
    module.Load()
    module.SetupServer = () => {
        Userinput.prompt(`${Package}.OnSetupServer`, "请输入服务器的外部访问地址", "正确设置后才能在手机通知里点击链接打开正确的游戏。需要设置的和客户端中的服务器设置一样，比如http://1.2.3.4:4355", module.Config.Server || "")
    }
    module.OnSetupServer = (name, id, code, data) => {
        if (code == 0) {
            module.Config.Server = data.trim()
            module.Save()
        }
    }
    module.Lark = {}
    module.Lark.Setup = () => {
        module.Auth(`${Package}.Lark.Setup`, module.Lark.SetupStart)
    }
    module.Lark.SetupStart = function () {
        Userinput.prompt(`${Package}.Lark.OnWebhook`, "请输入Webhook地址", "请输入机器人的的Webhook地址，留空不使用飞书。参考:https://forum.hellclient.com/topic/14/", module.Config.LarkWebHook || "")
    }
    module.Lark.OnWebhook = (name, id, code, data) => {
        if (code == 0) {
            module.Config.LarkWebHook = data.trim()
            module.Save()
        }
    }
    module.Auth = (retry, success) => {
        if (!world.CheckPermissions(["http"])) {
            world.RequestPermissions(["http"], "申请HTTP权限推送", retry)
            return
        }
        if (!world.CheckTrustedDomains(["open.feishu.cn"])) {
            world.RequestTrustDomains(["open.feishu.cn"], "申请信任飞书Webhook", retry)
            return
        }
        if (success != null) {
            success();
        }
    }
    module.Lark.Send = (url, title, content, server, game) => {
        var body = {
            "msg_type": "post",
            "content": {
                "post": {
                    "zh_cn": {
                        "title": title,
                        "content": [
                            [{
                                "tag": "text",
                                "text": content
                            }, {
                                "tag": "a",
                                "text": "查看",
                                "href": `hcnotify://hellclient.jarlyyn.com/notify/${server}#${game}`
                            }]
                        ]
                    }
                }
            }
        }
        module.Lark.Req = HTTP.New("POST", url)
        let httpbody = JSON.stringify(body)
        module.Lark.Req.SetBody(httpbody)
        module.Lark.Req.SetHeader("Content-Type", "application/json")
        Note(httpbody);
        Note("正在发送推送")
        module.Lark.Req.AsyncExecute(`${Package}.Lark.Callback`)
    }
    module.Lark.Callback = function () {
        let resp = module.Lark.Req.ResponseBody();
        let data = JSON.parse(resp);
        if (data.StatusCode == 0) {
            Note('推送成功')
        } else {
            Note(resp)
        }
    }
    module.Lark.Push = (title, content) => {
        if (module.Config.LarkWebHook.trim()) {
            module.Lark.Send(module.Config.LarkWebHook.trim(), title, content, module.Config.Server, GetWorldID())
        }
    }
    module.PushDesktop = (title, content) => {
        Request('desktopnotification', JSON.stringify({ Title: title, Body: content }))
    }
    module.Notify = (title, content) => {
        module.Lark.Push(title, content)
        module.PushDesktop(title, content)
    }
    module.GoImport = () => {
        module.Auth(`${Package}.GoImport`, module.ShowImport)
    }
    module.ShowImport = () => {
        Userinput.prompt(`${Package}.OnImport`, "导入推送数据", "helljspush-开头的推送数据", '')
    }
    module.OnImport = (name, id, code, data) => {
        if (code == 0) {
            if (data.startsWith('helljspush-')) {
                data = data.slice('helljspush-'.length)
                let decoded = Base64Decode(data)
                if (decoded) {
                    let data = JSON.parse(decoded)
                    if (data) {
                        module.Config = data
                        module.Save()
                        Userinput.alert("", "导入成功", "您可以点击测试按钮进行测试");
                        return
                    }
                }
            }
            Userinput.alert("", "导入失败", '导入失败，请检查数据是否正确');
        }
    }
    module.OnReset = (name, id, code, data) => {
        if (code == 0 && data == "yes") {
            module.Config = newconfig()
            module.Save()
            Userinput.alert("", "重置成功", '推送设置已经重置成功');
        }
    }
    module.Show = () => {
        var list = Userinput.newlist("推送设置", "", false)
        // list.append('channels', '设置通知通道');
        list.append('test', '测试推送');
        list.append('setserver', `服务器地址设置(${module.Config.Server})`);
        list.append('setlark', `设置飞书推送Webhook(${module.Config.LarkWebHook.trim() ? "已启用" : "未启用"})`);
        list.append('export', '导出推送设置');
        list.append('import', '导入推送设置');
        list.append('reset', '重置设置');
        list.publish(`${Package}.OnShow`)
    }
    module.OnShow = (name, id, code, data) => {
        if (code == 0) {
            switch (data) {
                case 'setserver':
                    module.SetupServer()
                    break
                case 'setlark':
                    module.Lark.Setup()
                    break
                case "test":
                    module.Notify('推送确认', '请确认推送是否成功送达')
                    break
                case "export":
                    Userinput.alert("", "导出当前设置", 'helljspush-' + Base64Encode(JSON.stringify(
                        module.Config
                    )))
                    break
                case "import":
                    module.GoImport();
                    break
                case "reset":
                    var list = Userinput.newlist("重置推送设置", "您是否要重置推送设置？", false)
                    list.append('yes', '是');
                    list.append('no', '否');
                    list.publish(`${Package}.OnReset`)
                    break
            }
        }
    }
    return module
})(App)
