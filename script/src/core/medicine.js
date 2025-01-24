//吃药模块
(function (App) {
    App.Core.Medicine = {}
    App.Core.Medicine.All = []
    App.Core.Medicine.Interval = 3000//同一类药的吃药间隔
    App.Core.Medicine.Next = {}
    App.Core.Medicine.Next.疗伤 = 0
    App.Core.Medicine.Next.疗精 = 0
    App.Core.Medicine.Next.回精 = 0
    App.Core.Medicine.Next.回内 = 0
    //药的基本结构
    class Medicine {
        ID = ""
        Name = ""
        疗伤 = false
        疗精 = false
        回精 = false
        回内 = false
    }
    //加载默认设置
    App.LoadLines("data/medicine.txt", "|").forEach((data) => {
        let med = new Medicine()
        med.Name = data[0]
        med.ID = data[1]
        med.疗伤 = data[2] && data[2].trim().toLowerCase() == "t"
        med.疗精 = data[3] && data[3].trim().toLowerCase() == "t"
        med.回精 = data[4] && data[4].trim().toLowerCase() == "t"
        med.回内 = data[5] && data[5].trim().toLowerCase() == "t"
        App.Core.Medicine.All.push(med)
    })
    App.Core.Medicine.EatCmd = (type) => {
        let result = []
        App.Core.Medicine.All.forEach(m => {
            if (m[type]) {
                if (App.Data.Item.List.FindByIDLower(m.ID).First()) {
                    result.push(`eat ${m.ID}`)
                }
            }
        })
        return result.join("\n")
    }
    //吃药
    let eatyao = (type) => {
        var now = (new Date()).getTime()
        if (now < App.Core.Medicine.Next[type]) {
            return null
        }
        App.Core.Medicine.Next[type] = now + App.Core.Medicine.Interval
        let result = App.Core.Medicine.EatCmd(type)
        if (result) {
            return () => {
                App.PushCommands(
                    App.Commands.NewDoCommand(result),
                    App.Commands.NewDoCommand("hp;i"),
                    App.NewSyncCommand(),
                )
                App.Next()
            }
        }
        return null
    }
    App.Core.Medicine.EatYao = eatyao
    //注册一个eatyao的准备
    App.Proposals.Register("eatyao", App.Proposals.NewProposal(function (proposals, context, exclude) {
        if (App.Data.Player.HP["当前精力"] < App.Params.NumJingliMin && App.Data.Player.HP["精力上限"] > 2 * App.Params.NumJingliMin) {
            return eatyao("回精")
        }
        if (App.Data.Player.HP["气血百分比"] <= 20) {
            return eatyao("疗伤")
        }
        if (App.Data.Player.HP["精气百分比"] <= 20) {
            return eatyao("疗精")
        }
        if (App.Core.Dispel.Need && (App.Data.Player.HP["当前内力"] * 100 / App.Data.Player.HP["内力上限"]) <= 10 && App.Core.Weapon.Touch == "") {
            return eatyao("回内")
        }
        return null
    }))

    App.BindEvent("core.hurt", function () {
        let result = App.Core.Medicine.EatCmd("疗伤")
        if (result) {
            App.Send(result)
        }
    })
})(App)