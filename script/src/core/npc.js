(function (App) {
    App.Core.NPC = {}
    App.Core.NPC["姓"] = {};
    App.Core.NPC.AskYouxunData = {
        Name: "",
        Live: false,
    }
    App.LoadLines("data/name2.txt", "|").forEach((data) => {
        App.Core.NPC["姓"][data[0]] = data[1]
    })
    App.Core.NPC["名"] = {};
    App.LoadLines("data/name.txt", "|").forEach((data) => {
        data[1].split("").forEach((char) => {
            App.Core.NPC["名"][char] = data[0]
        })
    })
    App.Core.NPC.GetPinyin = function (name) {
        let result = ""
        if (name.length < 2) {
            return null
        }
        if (App.Core.NPC["姓"][name.slice(0, 2)]) {
            result = App.Core.NPC["姓"][name.slice(0, 2)] + " "
            name = name.slice(2)
        } else if (App.Core.NPC["姓"][name.slice(0, 1)]) {
            result = App.Core.NPC["姓"][name.slice(0, 1)] + " "
            name = name.slice(1)
        } else {
            return null
        }
        let 名 = name.split("")
        for (var char of 名) {
            if (App.Core.NPC["名"][char]) {
                result = result + App.Core.NPC["名"][char]
            } else {
                return null
            }
        }
        return result
    }
    App.Core.NPC.CheckYouxun = function (name, id) {
        App.Core.NPC.AskYouxunData = {
            Name: name,
            ID: id ? id : App.Core.NPC.GetPinyin(name),
            Live: false,
        }
        if (App.Core.NPC.AskYouxunData["ID"] != null) {
            App.Commands.PushCommands(
                App.Move.NewToCommand("26"),
                App.NewAskCommand("you xun", App.Core.NPC.AskYouxunData["ID"], 1),
                App.Commands.NewFunctionCommand(() => {
                    if (App.Data.Ask.Answers.length && App.Data.Ask.Answers[0].Line == "游讯嘿嘿奸笑两声，对你小声道：“没有问题，不过得要50两黄金，不二价！”") {
                        App.Core.NPC.AskYouxunData.Live = true
                    }
                    App.Next()
                })
            ).WithFailCommand(
                App.Commands.NewFunctionCommand(() => {
                    App.Next()
                })
            )
        }
        App.Next()
    }
    App.Core.NPC.Family = {}
    App.LoadLines("data/family.txt", "|").forEach((data) => {
        App.Core.NPC.Family[data[0]] = {
            Name: data[0],
            LocMaster: data[1],
            MasterID: data[2],
            LocSleep: data[3],
            LocDazuo: data[4],
            IDPass: data[5],
        }
    })
    App.Core.NPC.Load = function () {
        let fam = App.Core.NPC.Family[App.Data.Player.Score["门派"]]
        if (fam) {
            Note("引入门派设置")
            App.Params.LocSleep = fam.LocSleep
            App.Params.MasterID = fam.MasterID
            App.Params.LocMaster = fam.LocMaster
            App.Params.LocDazuo = fam.LocDazuo
            App.Params.IDPass = fam.IDPass
        }
        let idpass = GetVariable("id_pass").trim()
        if (idpass) {
            App.Params.IDPass = idpass
        }
        if (App.Params.IDPass) {
            Note("门派标签为 " + App.Params.IDPass)
        }
    }
    App.Map.AppendTagsIniter((map) => {
        map.SetTag(App.Params.IDPass, true)
    })
})(App)