// 拦路NPC模块
(function (App) {
    App.Core.Blocker = {}
    App.Core.Blocker.Npcs = {}
    App.Core.Blocker.Blocked = {}
    //加载默认配置
    App.LoadLines("data/blockers.txt", "|").forEach((data) => {
        App.Core.Blocker.Npcs[data[0].trim()] = {
            Name: data[0].trim(),
            ID: data[1].trim(),
            Exp: data[2] - 0,
        }
    })
    //响应触发
    App.Engine.SetFilter("core.blocked", function (event) {
        event.Data = event.Data.Wildcards["0"]
        App.RaiseEvent(event)
    })
    //快速别名，拉黑当前路径
    App.Core.Blocker.Block = (from, to) => {
        App.Core.Blocker.Blocked["form>to"] = {
            Created: (new Date()).getTime(),
            From: from,
            To: to,
        }
    }
    //初始化地图信息时拦截拉黑的出口
    App.Map.AppendTagsIniter((map) => {
        for (var key in App.Core.Blocker.Blocked) {
            let blocked = App.Core.Blocker.Blocked[key]
            if ((new Date()).getTime() - blocked.Created > 100000) {
                delete (App.Core.Blocker.Blocked[key])
            } else {
                map.BlockPath(blocked.From, blocked.To)
            }
        }
    })
    //重试
    App.Core.Blocker.BlockStepRetry = () => {
        if (App.Map.Move) {
            if (App.Map.Room.ID) {
                let step = App.Map.Move.GetLastStep()
                if (step.Target) {
                    App.Core.Blocker.Block(App.Map.Room.ID, step.Target)
                }
            }
            App.Map.InitTags()
            App.Map.Retry()
        }
    }
    //击杀拦路npc,然后继续行走
    App.Core.Blocker.KillBlocker = (name, from, to) => {
        let npc = App.Core.Blocker.Npcs[name]
        Note(name + "拦路")
        if (npc && npc.Exp < App.Data.Player.HP["经验"]) {
            let snap = App.Map.Snap()
            App.Commands.Insert(
                App.NewKillCommand(npc.ID, App.NewCombat("blocker")),
                App.Commands.NewFunctionCommand(() => {
                    App.Map.Rollback(snap)
                    App.Map.Resend(0)
                })
            )
            App.Next()
            return
        } else {
            App.Core.Blocker.BlockStepRetry()
        }
    }
})(App)