// 助理 主交互功能
(function (App) {
    App.UI.Assist = {}
    App.UI.Assist.Show = () => {
        var status = App.Quests.Stopped ? "已停止" : "正在进行"
        var list = Userinput.newlist("助理", "当前任务" + status + ",请选择你需要的帮助", false)
        list.append("report", "工作汇报")
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
        list.append("questparams", "任务参数设置")
        list.append("lian", "初始化练习清单")
        list.append("advance", "高级设置")
        list.append("push", "推送设置")
        list.append("help", "使用帮助")
        list.publish("App.UI.Assist.OnClick")
    }
    App.UI.Assist.OnClick = (name, id, code, data) => {
        switch (data) {
            case "start":
                Execute("#start")
                break
            case "stop":
                Execute("#stop")
                break
            case "common":
                App.UI.Assist.CommonShow()
                break
            case "rooms":
                App.UI.Publishgrid(App.UI.Rooms.Grid, App.UI.Rooms.Lines())
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
            case "questparams":
                App.UI.Assist.QuestParamsShow()
                break
            case "lian":
                if (App.InitCommad) {
                    $.PushCommands(
                        $.Function(App.Init),
                        $.Function(App.Check),
                        $.Function(App.UI.Assist.LianShow)
                    )
                    $.Next()
                    return
                }
                App.UI.Assist.LianShow()
                break
            case "report":
                if (App.InitCommad) {
                    $.PushCommands(
                        $.Function(App.Init),
                        $.Function(App.Check),
                        $.Function(App.UI.Report.Show)
                    )
                    $.Next()
                    return
                }
                App.UI.Report.Show()
                break
            case "advance":
                App.UI.Assist.AdvanceShow()
                break
            case "push":
                App.PushMessage.Show()
                break
            case "help":
                App.Help()
                break
        }
    }
    App.UI.Assist.CommonShow = () => {
        var list = Userinput.newlist("常用任务", "请选择你的要执行的常用任务", true)
        list.append("#lianskill", "#lianskill 根据lian变量设置练功，需要设置好jifa指令")
        list.append("#beiqi", "#beiqi 备齐任务")
        list.append("#liandan", "#liandan 北京炼丹")
        list.append("#noob", "#noob 新人一条龙任务，需要拜师")
        list.append("#noob2", "#noob2 新人一条龙继续钓鱼版本")
        list.append("#eatlu", "#eatlu 去pkd吃身上的magic water")
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
    App.UI.Assist.ParamLast = null
    App.UI.Assist.ParamsShow = () => {
        var list = Userinput.newlist("系统参数设置", "请选择你要设置的参数,搜索=显示已设置参数", true)
        App.NamedParams.Params.forEach((p) => {
            let val = App.Core.Params.Data[p.ID] ? "=" + App.Core.Params.Data[p.ID] : "未设置，默认" + App.Params[p.ID]
            list.append(p.ID, `${p.Name}-#${p.ID}(${val}) ${p.Desc}:`)
        })
        list.publish("App.UI.Assist.ParamsOnView")
    }
    App.UI.Assist.ParamsOnView = (name, id, code, data) => {
        if (code === 0 && data) {
            let p
            App.NamedParams.Params.forEach((param) => {
                if (param.ID == data) {
                    p = param
                }
            })
            if (p) {
                App.UI.Assist.ParamLast = p
                let val = App.Core.Params.Data[p.ID] || ""
                Userinput.Prompt("App.UI.Assist.ParamsOnSet", `${p.Name}-#${p.ID}`, `${p.Desc}\n${p.Intro}`, val)
            }
        }
    }
    App.UI.Assist.ParamsOnSet = (name, id, code, data) => {
        let p = App.UI.Assist.ParamLast
        App.UI.Assist.ParamLast = null
        if (code === 0 && p) {
            App.Core.Params.Set(p.ID, data)
            Userinput.alert("", "params变量内容,注意保存", GetVariable("params"))
        }
    }
    App.UI.Assist.QuestParamLast = null
    App.UI.Assist.QuestParamsShow = () => {
        var list = Userinput.newlist("任务参数设置", "请选择你要设置的任务参数,搜索=显示已设置参数", true)
        App.QuestNamedParams.Params.forEach((p) => {
            let val = App.Core.Params.QuestData[p.ID] ? "=" + App.Core.Params.QuestData[p.ID] : "未设置，默认" + App.QuestParams[p.ID]
            list.append(p.ID, `${p.Name}-#${p.ID}(${val}) ${p.Desc}:`)
        })
        list.publish("App.UI.Assist.QuestParamsOnView")
    }
    App.UI.Assist.QuestParamsOnView = (name, id, code, data) => {
        if (code === 0 && data) {
            let p
            App.QuestNamedParams.Params.forEach((param) => {
                if (param.ID == data) {
                    p = param
                }
            })
            if (p) {
                App.UI.Assist.QuestParamLast = p
                let val = App.Core.Params.QuestData[p.ID] || ""
                Userinput.Prompt("App.UI.Assist.QuestParamsOnSet", `${p.Name}-#${p.ID}`, `${p.Desc}\n${p.Intro}`, val)
            }
        }
    }
    App.UI.Assist.QuestParamsOnSet = (name, id, code, data) => {
        let p = App.UI.Assist.QuestParamLast
        App.UI.Assist.QuestParamLast = null
        if (code === 0 && p) {
            App.Core.Params.SetQuest(p.ID, data)
            Userinput.alert("", "quest_params变量内容,注意保存", GetVariable("quest_params"))
        }
    }

    let nolian = {
        "force": true,
        "poison": true,
    }
    App.UI.Assist.LianShow = () => {
        var list = Userinput.newlist("请选择你要练习的技能", "注意，选择后你当前的lian变量会清除。请注意备份", true)
        list.setmutli(true)
        let skills = []
        for (var id in App.Data.Player.Skills) {
            let skill = App.Data.Player.Skills[id]
            if (skill["基本"] != skill.ID && (skill["受限经验"] || skill["音乐技能"]) && !nolian[skill["基本"]]) {
                skills.push(skill)
            }
        }
        skills.sort((a, b) => {
            if (a["基本"] == b["基本"]) {
                return a.ID < b.ID ? -1 : 1
            }
            return a["基本"] < b["基本"] ? -1 : 1
        })
        skills.forEach((skill) => {
            let before = ""
            let after = ""
            let limit = ""
            let jifa = skill["基本"]
            let wp = App.Core.Weapon.GetWeapon(jifa)
            if (skill["武器"]) {
                if (wp) {
                    before = `#wpon ${wp.Name}`
                    after = `#wpoff ${wp.Name}`
                } else {
                    before = `#wpon`
                }
            } else if (skill["空手"]) {
                limit = skill["基本"]
                jifa = "parry"
                before = "#unwield"
            } else if (skill["音乐技能"]) {
                if (wp) {
                    before = `yun regenerate;hand ${wp.ID}`
                    after = `hand none`
                } else {
                    before = `yun regenerate`
                }
            }
            let cmd = `${skill.ID}|${limit}|lian|${jifa}||${before}|${after}`
            list.append(cmd, cmd)
        })
        list.publish("App.UI.Assist.LianOnAction")
    }
    App.UI.Assist.LianOnAction = (name, id, code, data) => {
        if (code == 0) {
            let skills = JSON.parse(data)
            SetVariable("lian", skills.join("\n"))
            Userinput.alert("", "lian变量内容,请设置好开始结束指令后，保存并重新加载变量设置", GetVariable("lian"))
        }
    }
    App.UI.Assist.AdvanceShow = () => {
        var list = Userinput.newlist("高级设置", "请选择你感兴趣的高级设置", true)
        list.append("quests", "可用任务一览")
        list.publish("App.UI.Assist.AdvanceOnAction")
    }
    App.UI.Assist.AdvanceOnAction = (name, id, code, data) => {
        if (code == 0) {
            switch (data) {
                case "quests":
                    App.UI.Assist.QuestsShow()
                    break
            }
        }
    }
    App.UI.Assist.QuestsShow = () => {
        var list = Userinput.newlist("可用任务一览", "请选择你感兴趣的任务", true)
        let allq = App.Quests.RegisteredQuests()
        Object.keys(allq).sort().forEach(key => {
            let q = allq[key]
            list.append(key, `${q.ID} ${q.Name} ${q.Desc}`)
        })
        list.publish("App.UI.Assist.QuestsOnAction")
    }
    App.UI.Assist.QuestsOnAction = (name, id, code, data) => {
        if (code == 0) {
            let q = App.Quests.GetQuest(data)
            if (q) {
                Userinput.Note("", `任务 ${q.Name} (${q.ID})`, `${q.Desc}\n${q.Intro}`)
            }
        }
    }
})(App)