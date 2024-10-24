(function (App) {
    let uiModule = App.RequireModule("helllibjs/utils/ui.js")

    SetHUDSize(4)
    App.HUD = {}
    App.HUD.UI = uiModule
    App.Word = App.HUD.UI.Word
    App.HUD.Update = () => {
        App.Utils.Pad
        let line1 = App.HUD.Line1()
        let line2 = App.HUD.Line2()
        let line3 = App.HUD.Line3()
        let line4 = App.HUD.Line4()
        let summaryline1 = App.HUD.SummaryLine1()
        let summaryline2 = App.HUD.SummaryLine2()
        UpdateHUD(0, JSON.stringify([line1, line2, line3, line4]))
        SetSummary(JSON.stringify([summaryline1, summaryline2]))
    }
    App.HUD.Space = new App.Word(" ")

    App.HUD.Line1 = () => {
        let scriptname = new App.Word("NEWHELLJS ").WithColor("Yellow")
        let idlabel = new App.Word("ID:").WithColor("White")
        let id = new App.Word(GetVariable("id"), 9, false).WithColor("BrightGreen")
        return App.Word.Join(scriptname, idlabel, id)
    }
    App.HUD.Line2 = () => {
        let banklabel = new App.Word(" 存款:").WithColor("BrightYellow")
        let bank = new App.Word(App.Data.Player.Score["存款"] != null ? ("" + App.Data.Player.Score["存款"]) : "-", 6, true).WithColor("white")
        let bondlabel = new App.Word(" 债券:").WithColor("BrightYellow")
        let bond = new App.Word(App.Data.Player.Score["债券"] != null ? ("" + App.Data.Player.Score["债券"]) : "-", 4, true).WithColor("white")
        let expLabel = new App.Word("经验:").WithColor("BrightWhite")
        let exp = new App.Word(App.Data.Player.HP["经验"] != null ? App.HUD.UI.ShortNumber(App.Data.Player.HP["经验"]) : "-", 6, true).WithColor("white")
        let potLabel = new App.Word(" 潜能:").WithColor("BrightWhite")
        let pot = new App.Word(App.Data.Player.HP["潜能"] != null ? App.HUD.UI.ShortNumber(App.Data.Player.HP["潜能"]) : "-", 6, true).WithColor("white")
        let canlearn = (App.Core.Study.FilterSkill() != null)
        let learn = new App.Word(App.Quests.Stopped ? "未开" : (canlearn ? "在学" : "学完")).WithColor("BrightWhite").WithBackground((App.Quests.Stopped || canlearn) ? "BrightGreen" : "BrightRed")
        return App.Word.Join(App.HUD.Space, expLabel, exp, potLabel, pot, App.HUD.Space, learn, App.HUD.Space, banklabel, bank, bondlabel, bond)
    }
    App.HUD.Line3 = () => {
        let dup = {}
        let result = []
        let count = 0
        App.Quests.Queue.forEach(rq => {
            if (!dup[rq.ID] && count < 4) {
                dup[rq.ID] = true
                let output = App.Quests.GetQuest(rq.ID).OnHUD()
                if (output != null) {
                    result = result.concat(output)
                    result = result.concat(App.HUD.Space)
                    count++
                }
            }
        });
        if (result.length) {
            result.unshift(App.HUD.Space)
            return App.HUD.UI.Word.Join(...result)
        } else {
            return App.HUD.UI.Word.Join(App.HUD.Space, new App.HUD.UI.Word("无任务信息"))
        }
    }

    App.HUD.Line4 = () => {
        let line = JSON.parse(NewLine())
        return line
    }
    App.HUD.SummaryLine1 = () => {
        let banklabel = new App.Word("存:").WithColor("BrightYellow")
        let bank = new App.Word(App.Data.Player.Score["存款"] != null ? ("" + App.Data.Player.Score["存款"]) : "-", 6, true).WithColor("white")
        let bondlabel = new App.Word(" 债:").WithColor("BrightYellow")
        let bond = new App.Word(App.Data.Player.Score["债券"] != null ? ("" + App.Data.Player.Score["债券"]) : "-", 4, true).WithColor("white")
        let expLabel = new App.Word(" 经:").WithColor("BrightWhite")
        let exp = new App.Word(App.Data.Player.HP["经验"] != null ? App.HUD.UI.ShortNumber(App.Data.Player.HP["经验"]) : "-", 6, true).WithColor("white")
        let potLabel = new App.Word(" 潜:").WithColor("BrightWhite")
        let pot = new App.Word(App.Data.Player.HP["潜能"] != null ? App.HUD.UI.ShortNumber(App.Data.Player.HP["潜能"]) : "-", 6, true).WithColor("white")
        let canlearn = (App.Core.Study.FilterSkill() != null)
        let learn = new App.Word(App.Quests.Stopped ? "停" : (canlearn ? "学" : "满")).WithColor("BrightWhite").WithBackground((App.Quests.Stopped || canlearn) ? "BrightGreen" : "BrightRed")
        return App.Word.Join(expLabel, exp, potLabel, pot, App.HUD.Space, learn, App.HUD.Space, banklabel, bank, bondlabel, bond)
    }
    App.HUD.SummaryLine2 = () => {
        let dup = {}
        let result = []
        let count = 0
        App.Quests.Queue.forEach(rq => {
            if (!dup[rq.ID] && count < 3) {
                dup[rq.ID] = true
                let output = App.Quests.GetQuest(rq.ID).OnSummary()
                if (output != null) {
                    result = result.concat(output)
                    result = result.concat(App.HUD.Space)
                    count++
                }
            }
        });
        if (result.length) {
            result.unshift(App.HUD.Space)
            return App.HUD.UI.Word.Join(...result)
        } else {
            return App.HUD.UI.Word.Join(App.HUD.Space, new App.HUD.UI.Word("无任务信息"))
        }
    }
    App.HUD.Update()
    App.HUD.Next = 0
    App.Engine.BindTimeHandler(function () {
        let now = (new Date()).getTime()
        if (now > App.HUD.Next) {
            App.HUD.Next = now + 60000
            App.HUD.Update()
        }
    })
    App.BindEvent("core.queststart", App.HUD.Update)
    App.BindEvent("core.queststop", App.HUD.Update)
    App.BindEvent("onfocus", App.HUD.Update)
})(App)