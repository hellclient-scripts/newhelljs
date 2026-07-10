//设置精灵
(function (App) {
    App.UI.Wizard = {}
    App.UI.Wizard.InsertToVariable = function (name, line) {
        let v = GetVariable(name).split("\n")
        if (v.indexOf(line) < 0) {
            SetVariable(name, GetVariable(name) + (v.length ? "\n" : "") + line)
        }
    }
    App.UI.Wizard.JifaData = ""
    App.UI.Wizard.WieldCmd = ""
    App.UI.Wizard.WieldID = ""
    App.UI.Wizard.NeedLongSword = false
    App.UI.Wizard.Shot = false
    App.UI.Wizard.CommandsData = ""
    App.UI.Wizard.Check = function () {
        if (!GetVariable("id")) {
            return "id"
        }
        if (!GetVariable("passw")) {
            return "password"
        }
        if (!GetVariable("jifa")) {
            return "jifa"
        }
        if (!GetVariable("weapon")) {
            return "weapon"
        }
        if (!GetVariable("combat")) {
            return "combat"
        }
        if (!GetVariable("command")) {
            return "command"
        }
        return ""
    }
    App.UI.Wizard.Next = function () {
        if (App.InitCommad) {
            $.PushCommands(
                $.Function(App.Init),
                $.Function(App.Check),
                $.Sync(),
                $.Function(App.UI.Wizard.Next)
            )
            $.Next()
            return
        }
        App.ReloadVariable()
        Note(App.UI.Wizard.Check())
        switch (App.UI.Wizard.Check()) {
            case "id":
                App.UI.Wizard.ShowID()
                break
            case "password":
                App.UI.Wizard.ShowPassword()
                break
            case "jifa":
                App.UI.Wizard.ShowJifa()
                break
            case "weapon":
                App.UI.Wizard.ShowWield()
                break
            case "combat":
                App.UI.Wizard.ShowCombat()
                break
            case "command":
                App.UI.Wizard.ShowCommand()
                break
            default:
                App.UI.Wizard.ShowFinish()
                break
        }
    }
    App.UI.Wizard.ShowID = function () {
        Userinput.prompt("App.UI.Wizard.OnID", "请设置你的ID", "你游戏的登陆id", App.Data.Player.Score.ID)
    }
    App.UI.Wizard.OnID = function (name, id, code, data) {
        if (code == 0) {
            SetVariable("id", data)
            App.UI.Wizard.Next()
        }
    }
    App.UI.Wizard.ShowPassword = function () {
        Userinput.prompt("App.UI.Wizard.OnPassword", "请设置你的密码", "你游戏的登陆密码", "")
    }
    App.UI.Wizard.OnPassword = function (name, id, code, data) {
        if (code == 0) {
            SetVariable("passw", data)
            App.UI.Wizard.Next()
        }
    }
    App.UI.Wizard.ShowJifa = function () {
        let jifaskills = App.Core.GetJifaSkills()
        let beiskills = App.Core.GetBeiSkills()
        let data = []
        jifaskills.forEach(item => {
            data.push(`jifa ${item[0]} ${item[1]}`)
        })
        if (beiskills.length > 0 || data.length == 0) {
            data.push(`bei ${beiskills.join(" ")}`)
        }
        App.UI.Wizard.JifaData = data.join("\n")
        Userinput.confirm("App.UI.Wizard.OnJifa", "请设置你激发的技能", "推测你的激发的技能如下:\n\n" + App.UI.Wizard.JifaData)
    }
    App.UI.Wizard.OnJifa = function (name, id, code, data) {
        if (code == 0) {
            SetVariable("jifa", App.UI.Wizard.JifaData)
            App.UI.Wizard.Next()
        }
    }
    App.UI.Wizard.ShowWield = function () {
        Userinput.prompt("App.UI.Wizard.OnWield", "装备指令", "请设置你装备武器的指令。如：\nwield long sword\nwear mystrike", "")
    }
    App.UI.Wizard.OnWield = function (name, id, code, data) {
        if (code == 0) {
            App.UI.Wizard.NeedLongSword = false
            if (data.startsWith("wield ")) {
                App.UI.Wizard.WieldCmd = "#wield"
                App.UI.Wizard.WieldID = data.slice(6).trim()
                if (App.UI.Wizard.WieldID == "long sword") {
                    App.UI.Wizard.NeedLongSword = true
                }
                App.UI.Wizard.ShowTouch()
                return
            } else if (data.startsWith("wear ")) {
                App.UI.Wizard.WieldCmd = "#wear"
                App.UI.Wizard.WieldID = data.slice(5).trim()
                App.UI.Wizard.ShowLongsword()
                return
            }
            App.UI.Wizard.ShowWield()
        }
    }
    App.UI.Wizard.ShowLongsword = function () {
        var list = Userinput.newlist("准备长剑", "检查到您使用了空手武器，是否需要准备一把长剑，进入特殊房间，比如保护任务找杨过龙女", true)
        list.append("yes", "准备长剑")
        list.append("no", "不需要长剑")
        list.publish("App.UI.Wizard.OnLongsword")
    }
    App.UI.Wizard.OnLongsword = function (name, id, code, data) {
        if (code == 0) {
            App.UI.Wizard.NeedLongSword = (data == "yes")
            App.UI.Wizard.ShowTouch()
        }
    }
    App.UI.Wizard.ShowTouch = function () {
        Userinput.prompt("App.UI.Wizard.OnTouch", "Touch武器", "请设置你需要Touch会内力的10兵，留空不touch", "")

    }
    App.UI.Wizard.NeedRepair = {
        "zhang jin": true
    }
    App.UI.Wizard.OnTouch = function (name, id, code, data) {
        if (code == 0) {
            let touch = data.trim()
            let weapon = [`${App.UI.Wizard.WieldCmd} ${App.UI.Wizard.WieldID}`]
            if (App.UI.Wizard.NeedLongSword) {
                App.UI.Wizard.InsertToVariable("items", "long sword")
                weapon.push("#wield.sword long sword")
            }
            if (App.UI.Wizard.WieldID.indexOf(" ") < 0 || App.UI.Wizard.NeedRepair[App.UI.Wizard.WieldID]) {
                weapon.push(`#repair ${App.UI.Wizard.WieldID} * 50`)
            }
            if (touch) {
                weapon.push("#touch " + touch)
            }
            SetVariable("weapon", weapon.join("\n"))
            App.UI.Wizard.Next()
        }
    }
    App.UI.Wizard.ShowCombat = function () {
        Userinput.prompt("App.UI.Wizard.OnCombat", "战斗设置", "请设置您的战斗指令，射箭ID请填shot,如:\nperform unarmed.xue twice\nshot", "")
    }
    App.UI.Wizard.OnCombat = function (name, id, code, data) {
        if (code == 0) {
            data = data.trim()
            if (data == "") {
                App.UI.Wizard.ShowCombat()
                return
            }
            if (data == "shot") {
                App.UI.Wizard.InsertToVariable("items", "long bow")
                App.UI.Wizard.InsertToVariable("items", "arrow * 30")
                SetVariable("combat", ["#before yun regenerate;yun recover", "#start $wpon;hand bow;shot $1 with arrow", "shot $1 with arrow"].join("\n"))
            } else {
                SetVariable("combat", [`#before yun regenerate;yun recover`, `#start $wpon;${data}`, `${data}`, ``, `#block qinling`, `ctag qinshihuang>#apply`, `//对秦始皇战斗设置`,`#before yun regenerate;yun recover`, `#start $wpon;${data}`, `${data}`].join("\n"))
            }
            App.UI.Wizard.Next()
        }
    }
    App.UI.Wizard.ShowCommand = function () {
        let commands = []
        if (GetVariable("combat").indexOf("with arrow") >= 0) {
            commands = [
                "#prepare ",
                "#wait jiqu"
            ]
        } else if (App.Core.Weapon.Touch) {
            commands = [
                "#prepare yun powerup;yun shield",
                "#wait #yanjiulian;#jiqu",
                "#mqbefore #yanjiulian",
                "#npcdie #yanjiulian",
                "#moveyanjiu #yanjiu",
                "#pause #yanjiulian",
            ]
        } else {
            commands = [
                "#prepare yun powerup;yun shield",
                "#wait #jiqu"
            ]
        }
        App.UI.Wizard.CommandsData = commands.join("\n")
        Userinput.confirm("App.UI.Wizard.OnCommand", "设置您的自定义指令", "根据你的战斗设置，推测你的指令如下:\n\n" + App.UI.Wizard.CommandsData)
    }
    App.UI.Wizard.OnCommand = function (name, id, code, data) {
        if (code == 0) {
            SetVariable("command", App.UI.Wizard.CommandsData)
            App.UI.Wizard.Next()
        }
    }
    App.UI.Wizard.ShowFinish = function () {
        let data = [
            "复杂变量已经设置完成了",
            "接下来您需要做如下设置",
            "1.设置house变量,您的房间信息",
            "2.设置max_pot变量和study变量,您的学习设置",
            "3.设置quest变量,您机器的主要任务",
            "4.调用助理的`初始化练习清单`，设置您需要练习的技能",
            "",
            "全部修改完后记得要保存游戏，否则下次打开后设置都会丢失！！！",
            "全部修改完后记得要保存游戏，否则下次打开后设置都会丢失！！！",
            "全部修改完后记得要保存游戏，否则下次打开后设置都会丢失！！！",

        ]
        Userinput.confirm("", "设置完成", data.join("\n"))
    }

})(App)