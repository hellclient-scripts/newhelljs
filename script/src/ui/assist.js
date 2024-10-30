(function (App) {
    App.UI.Assist = {}
    App.UI.Assist.Show = () => {
        var status = App.Quests.Stopped ? "已停止" : "正在进行"
        var list = Userinput.newlist("助理", "当前任务" + status + ",请选择你需要的帮助", false)
        if (App.Quests.Stopped) {
            if (GetVariable("quest").trim()) {
                list.append("start", "开始任务")
            }
            list.append("common", "常用任务")
        } else {
            list.append("stop", "结束任务")
        }
        list.append("reload", "重新加载变量设置")
        list.append("npc", "NPC老师清单")
        list.append("rooms", "地图房间")
        list.append("params", "系统参数设置")
        list.publish("App.UI.Assist.OnClick")

    }
    App.UI.Assist.OnClick = (name, id, code, data) => {
        switch (data) {
            case "common":
                App.UI.Assist.CommonShow()
                break
            case "rooms":
                App.UI.Publishgrid(App.UI.Rooms.Grid, App.Mapper.Lines)
                break
            case "reload":
                App.ReloadVariable()
                break
            case "npc":
                App.UI.Assist.NPCShow()
                break
            case "params":
                App.UI.Assist.ParamsShow()
                break
        }
    }
    App.UI.Assist.CommonShow = () => {
        var list = Userinput.newlist("常用任务", "请选择你的要执行的常用任务", false)
        list.append("#beiqi", "#beiqi 备齐任务")
        list.append("#liandan", "#liandan 北京炼丹")
        list.append("#noob", "#noob 新人一条龙任务，需要拜师")
        list.append("#noob2", "#noob2 新人一条龙继续钓鱼版本")
        list.publish("App.UI.Assist.CommonOnClick")
    }
    App.UI.Assist.CommonOnClick = (name, id, code, data) => {
        if (data) {
            Execute(data)
        }
    }
    App.BindEvent("assist", App.UI.Assist.Show)
    App.UI.Publishgrid = function (grid, alldata) {
        let pagesize = 10
        let page = grid.getpage()
        let filter = grid.getfilter()
        let start = (page - 1) * pagesize
        let end = page * pagesize
        let count = 0
        grid.resetitems()
        for (let i = 0; i < alldata.length; i++) {
            let data = alldata[i]
            if (filter && data.indexOf(filter) < 0) {
                continue
            }
            count++
            if (count >= start && count < end) {
                grid.append(i, alldata[i])
            }
        }
        grid.setmaxpage(Math.ceil(count / pagesize))
        grid.publish("")
    }
    App.UI.Assist.NPCShow = () => {
        var list = Userinput.newlist("NPC列表", "请选择你感兴趣的NPC", true)
        Object.keys(App.Core.NPC.Kungfu).forEach((key) => {
            let npc = App.Core.NPC.Kungfu[key]
            list.append(key, npc.Name + "(" + npc.ID + ") @" + npc.Loc)

        })
        list.publish("App.UI.Assist.NPCOnClick")
    }
    App.UI.Assist.NPCOnClick = (name, id, code, data) => {
        if (code === 0) {
            let npc = App.Core.NPC.Kungfu[data]
            if (npc) {
                var list = Userinput.newlist(npc.Name + "(" + npc.ID + ") @" + npc.Loc, "请选择你要进行的操作")
                list.append("go " + npc.Loc, "前往")
                list.append("teacher " + npc.Key, "设为师傅")
                list.append("learn " + npc.Key, "学习技能")
                list.publish("App.UI.Assist.NPCOnAction")
            }
        }
    }
    App.UI.Assist.NPCLastLearn = ""
    App.UI.Assist.NPCOnAction = (name, id, code, data) => {
        if (code === 0) {
            let cmd = SplitN(data, " ", 2)
            switch (cmd[0]) {
                case "go":
                    App.Move.To(cmd[1])
                    break
                case "teacher":
                    var npc = App.Core.NPC.Kungfu[cmd[1]]
                    if (npc) {
                        App.Core.Study.SetTeacher(npc.ID, npc.Loc)
                        Userinput.alert("", "study变量内容,注意保存", GetVariable("study"))
                    }
                    break
                case "learn":
                    var npc = App.Core.NPC.Kungfu[cmd[1]]
                    if (npc) {
                        App.UI.Assist.NPCLastLearn = cmd[1]
                        Userinput.prompt("App.UI.Assist.NPCOnLearn", "学习技能设置", "请输入需要向" + npc.Name + "学习的技能id", "")
                    }
                    break
            }
        }
    }
    App.UI.Assist.NPCOnLearn = (name, id, code, data) => {
        let key = App.UI.Assist.NPCLastLearn
        App.UI.Assist.NPCLastLearn = ""
        if (code === 0 && key && data.trim()) {
            var npc = App.Core.NPC.Kungfu[key]
            App.Core.Study.SetLearn("xue", data, npc.ID, npc.Loc)
            Userinput.alert("", "study变量内容,注意保存", GetVariable("study"))
        }
    }
    App.UI.Assist.NPCLastParam = null
    App.UI.Assist.ParamsShow = () => {
        var list = Userinput.newlist("系统参数设置00", "请选择你要设置的参数,搜索=显示已设置参数", true)
        App.NamedParams.Params.forEach((p) => {
            let val = App.Core.Params.Data[p.ID] ? "=" + App.Core.Params.Data[p.ID] : "未设置"
            list.append(p.ID, `${p.Name}-#${p.ID}(${val}) ${p.Desc}:`)
        })
        list.publish("App.UI.Assist.NPCOnView")
    }
    App.UI.Assist.NPCOnView = (name, id, code, data) => {
        if (code === 0 && data) {
            let p
            App.NamedParams.Params.forEach((param) => {
                if (param.ID == data) {
                    p = param
                }
            })
            if (p) {
                App.UI.Assist.NPCLastParam = p
                let val = App.Core.Params.Data[p.ID] || ""
                Userinput.Prompt("App.UI.Assist.NPCOnSet", `${p.Name}-#${p.ID}`, `${p.Desc}\n${p.Intro}`, val)
            }
        }
    }
    App.UI.Assist.NPCOnSet = (name, id, code, data) => {
        let p = App.UI.Assist.NPCLastParam
        App.UI.Assist.NPCLastParam = null
        if (code === 0 && p) {
            App.Core.Params.Set(p.ID, data)
            Userinput.alert("", "params变量内容,注意保存", GetVariable("params"))
        }
    }
})(App)