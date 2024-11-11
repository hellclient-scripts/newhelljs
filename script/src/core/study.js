(function (App) {
    let actionModule = App.RequireModule("helllibjs/conditions/action.js")

    App.Core.Study = {}
    App.Core.Study.Jiqu = {}
    App.Core.Study.Init = function () {
        App.Core.Study.Jiqu.Max = null
        App.Core.Study.Jiqu.Commands = []
        App.Core.Study.Learn = []
        App.Core.Study.LearnMode = 0
        App.Core.Study.TeacherID = ""
        App.Core.Study.TeacherLoc = ""
        App.Core.Study.Lian = []
        App.Core.Study.LianMode = 0
    }
    App.Core.Study.LearnMode = 0
    App.Core.Study.LearnMax = 100
    App.Core.Study.YanjiuMax = 100
    App.Core.Study.LianMax = 50
    App.Core.Study.Learn = []
    App.Core.Study.LianMode = 0
    App.Core.Study.Lian = []
    App.Core.Study.TeacherID = ""
    App.Core.Study.TeacherLoc = ""

    let matcherGiveMoney = /^(戚长发|朱熹|厨娘|李博渊)(笑着说道：您见笑了|说道：您太客气了|像是受宠若惊一样)/
    let idmapGivemoney = {
        "戚长发": "qi changfa",
        "朱熹": "zhu xi",
        "厨娘": "chu niang",
        "李博渊": "li boyuan",
    }
    let PlanStudy = new App.Plan(App.Positions["Response"],
        (task) => {
            task.AddTrigger(matcherGiveMoney, function (tri, result) {
                App.Send("give 1 gold to " + idmapGivemoney[result[1]])
                return true
            })
        }
        , (result) => {
        }
    )
    class Learn {
        constructor(line, defaultType) {
            line = line.trim()
            if (line[0] == "!") {
                this.Important = true
                line = line.slice(1)
            }
            if (!defaultType) {
                defaultType = "yanjiu"
            }
            let data = line.split("|")
            this.SkillID = data[0].trim()
            this.Limit = data[1] ? data[1].split(",").map((val) => val.trim()) : []
            this.Type = data[2] ? data[2] : defaultType
            this.From = data[3] ? data[3] : ""
            this.Loc = data[4] ? data[4] : ""
            this.Before = data[5] ? data[5] : ""
            this.After = data[6] ? data[6] : ""
        }
        Intro() {
            let result = ""
            result += "技能ID " + this.SkillID
            if (this.Limit.length) {
                result += " 限制：" + this.Limit.join(",")
            }
            result += " 类型："
            result += this.Type
            if (this.From) {
                result += " 目标:" + this.From
            }
            if (this.Loc) {
                result += " 位置:" + this.Loc
            }
            if (this.Before) {
                result += " 准备:" + this.Before
            }
            if (this.After) {
                result += " 结束:" + this.After
            }
            if (this.Important) {
                result += " 优先!!!"
            }
            return result
        }
        Execute() {
            switch (this.Type) {
                case "yanjiu":
                    var loc = this.Loc
                    if (!loc) {
                        loc = App.Mapper.HouseLoc ? "1949" : App.Params.LocDazuo
                    }
                    var times = App.Core.Study.YanjiuMax
                    if (times > App.Data.Player.HP["潜能"]) {
                        times = App.Data.Player.HP["潜能"]
                    }
                    var cmds = ["yanjiu " + this.SkillID + " " + times]
                    if (this.Before) { cmds.unshift(this.Before) }
                    if (this.After) { cmds.push(this.After) }
                    $.PushCommands(
                        $.To(loc),
                        $.Function(() => { PlanStudy.Execute(); App.Next() }),
                        $.Do(cmds.join(";")),
                        $.Function(() => { $.RaiseStage("wait"); App.Next() }),
                        $.Do("hp"),
                        $.Wait(1000),
                        $.Do("halt"),
                        $.Sync(),
                    )
                    $.Next()
                    break
                case "lian":
                    var loc = this.Loc
                    if (!loc) {
                        loc = App.Mapper.HouseLoc ? "1949" : App.Params.LocDazuo
                    }
                    var times = App.Core.Study.LianMax
                    var cmds = [`jifa ${this.From} ${this.SkillID}`, `lian ${this.From} ${times}`]
                    if (this.Before) { cmds.unshift(this.Before) }
                    if (this.After) { cmds.push(this.After) }
                    $.PushCommands(
                        $.To(loc),
                        $.Do("yun recover"),
                        $.Function(() => { PlanStudy.Execute(); App.Next() }),
                        $.Do(cmds.join(";")),
                        $.Function(() => { $.RaiseStage("wait"); App.Next() }),
                        $.Do("hp"),
                        $.Wait(1000),
                        $.Do("halt"),
                        $.Sync(),
                    )
                    $.Next()
                    break
                case "xue":
                    var loc = this.Loc || App.Core.Study.TeacherLoc
                    if (!loc) {
                        PrintSystem("未知的学习位置 " + loc)
                        return
                    }
                    var from = this.From || App.Core.Study.TeacherID
                    if (!from) {
                        PrintSystem("未知的学习目标 " + from)
                        return
                    }
                    var times = App.Core.Study.LearnMax
                    if (times > App.Data.Player.HP["潜能"]) {
                        times = App.Data.Player.HP["潜能"]
                    }
                    var cmds = ["learn " + from + " about " + this.SkillID + " " + times]
                    if (this.Before) { cmds.unshift(this.Before) }
                    if (this.After) { cmds.push(this.After) }
                    $.PushCommands(
                        $.To(loc),
                        $.Function(() => { PlanStudy.Execute(); App.Next() }),
                        $.Do(cmds.join(";")),
                        $.Function(() => { $.RaiseStage("wait"); App.Next() }),
                        $.Do("hp"),
                        $.Wait(1000),
                        $.Do("halt"),
                        $.Sync(),
                    )
                    $.Next()
                    break
                case "cmd":
                    if (!this.Loc) {
                        PrintSystem("未知的学习位置 " + this.Loc)
                        return
                    }
                    if (!this.From) {
                        PrintSystem("未知的学习目标 " + this.From)
                        return
                    }
                    var cmds = [this.From]
                    if (this.Before) { cmds.unshift(this.Before) }
                    if (this.After) { cmds.push(this.After) }
                    $.PushCommands(
                        $.To(this.Loc),
                        $.Function(() => { PlanStudy.Execute(); App.Next() }),
                        $.Do(cmds.join(";")),
                        $.Nobusy(),
                        $.Do("hp"),
                        $.Sync(),
                    )
                    $.Next()
                    break
                default:
                    PrintSystem("未知的学习指令 " + this.Type)
                    return
            }
        }
        Cooldown(interval) {
            this.Next = (new Date()).getTime() + interval
        }
        Check() {
            let skill = App.Data.Player.Skills[this.SkillID]
            if (skill) {
                if (skill["受限经验"] && skill["等级"] >= App.Data.Player.HPM["当前等级"]) {
                    return false
                }
            }
            if (this.Type == "yanjiu") {
                if (!skill || skill["等级"] < 180) {
                    return false
                }
            }
            if (this.Type == "lian") {
                if (!skill) {
                    return false
                }
                let base = App.Data.Player.Skills[this.From]
                if (!base || skill["等级"] >= base["等级"]) {
                    return false
                }
            }

            for (var limit of this.Limit) {
                if (!isNaN(limit)) {
                    if (skill && skill["等级"] >= limit) {
                        return false
                    }
                }
                let data = limit.trim().split(" ")
                switch (data[0]) {
                    case "":
                        break
                    case "pot":
                        if (!isNaN(data[1])) {
                            if (App.Data.Player.HP["潜能"] < (data[1] - 0)) {
                                return false
                            }
                        }
                    default:
                        let tskill = App.Data.Player.Skills[data[0]]
                        if (data[1]==null||isNaN(data1)){
                            data[1]="0"
                        }
                        if (tskill && !isNaN(data[1])) {
                            let level = data[1] ? data[1].trim() : "0"
                            let abs = 1
                            if (level[0] == "+") {
                                level = level.slice(1)
                            } else if (level[0] == "-") {
                                abs = -1
                                level = level.slice(1)
                            }
                            let offset = level * abs
                            if (skill["等级"] >= tskill["等级"] + offset) {
                                return false
                            }
                        }
                }
            }
            return this.Next <= (new Date()).getTime()
        }
        SkillID = ""
        Limit = []
        Type = ""
        From = ""
        Loc = ""
        Before = ""
        After = ""
        Important = false
        Next = 0
        DefaultType = ""
    }
    let filterskill = (list, mode, type) => {
        let filtered = []
        let important = null
        list.forEach(learn => {
            if (learn.Check()) {
                if (!type || learn.Type == type) {
                    filtered.push(learn)
                    if (learn.Important && important == null) {
                        important = learn
                    }
                }
            }
        })
        if (important) {
            return important
        }
        if (filtered.length) {
            switch (mode) {
                case 0://最低优先模式
                    let lowest = null
                    let lowestlevel = null
                    filtered.forEach((learn) => {
                        let level = App.Data.Player.Skills[learn.SkillID] ? App.Data.Player.Skills[learn.SkillID]["等级"] : 0
                        if (lowest == null || level < lowestlevel) {
                            lowest = learn
                            lowestlevel = level
                        }
                    })
                    return lowest
                    break
                case 1://顺序模式
                    filtered[0]
                    break
                default://随机模式
                    App.Random(filtered)
                    break
            }
        }
        return null

    }
    App.Core.Study.FilterSkill = (type) => {
        return filterskill(App.Core.Study.Learn, App.Core.Study.LearnMode, type)
    }
    App.Core.Study.AllCanLearn = () => {
        let result = []
        App.Core.Study.Learn.forEach(learn => {
            if (learn.Check()) {
                result.push(learn)
            }
        })
        return result
    }
    App.Core.Study.AllCanLian = () => {
        let result = []
        App.Core.Study.Lian.forEach(learn => {
            if (learn.Check()) {
                result.push(learn)
            }
        })
        return result
    }
    App.Core.Study.FilterLian = (type) => {
        return filterskill(App.Core.Study.Lian, App.Core.Study.LianMode, type)
    }
    App.Core.Study.CurrentSkill = null
    App.Core.Study.LastPot = 0
    App.Core.Study.LearndTimes = 0
    App.Core.Study.HitMinPot = () => {
        let minpot = GetVariable("min_pot")
        return (!isNaN(minpot) && App.Data.Player.HP["潜能"] < (minpot - 0)) || App.Data.Player.HP["潜能"] <= 10
    }
    App.Core.Study.DoLearn = (context) => {
        if (!App.Core.Study.HitMinPot()) {

            if (App.Data.Player.HP["潜能"] >= App.Core.Study.LastPot) {
                App.Core.Study.LearndTimes++
            } else {
                App.Core.Study.LearndTimes = 0
            }
            App.Core.Study.LastPot = App.Data.Player.HP["潜能"]
            if (App.Core.Study.LearndTimes < 4) {
                if (App.Core.Study.CurrentSkill.Check()) {
                    $.PushCommands(
                        $.Function(() => { App.Core.Study.CurrentSkill.Execute() }),
                        $.Prepare("common", context),
                        $.Function(() => { App.Core.Study.DoLearn(context) }),
                    )
                }
            } else {
                App.Core.Study.CurrentSkill.Cooldown(120000)
            }
        }
        App.Next()
    }
    App.Core.Study.Load = () => {
        App.Core.Study.Init()
        App.LoadVariable("jiqu").forEach(data => {
            let action = actionModule.Parse(data)
            switch (action.Command) {
                case "":
                case "#tihuimax":
                    let data = action.Data.trim()
                    if (action.Data && !isNaN(action.Data)) {
                        App.Core.Study.Jiqu.Max = data - 0
                    }
                    break
                case "#cmd":
                    App.Core.Study.Jiqu.Commands.push(action.Data)
                    break
            }
        })
        if (App.Core.Study.Jiqu.Max == null) {
            let skill = App.Data.Player.Skills["martial-cognize"]
            let level = skill ? skill["等级"] : 0
            if (level > 500) {
                App.Core.Study.Jiqu.Max = 500
            } else if (level > 200) {
                App.Core.Study.Jiqu.Max = 200
            } else {
                App.Core.Study.Jiqu.Max = 100
            }
        }

        if (App.Core.Study.Jiqu.Commands.length == 0) {
            if (App.Data.Player.Score["门派"] == "华山剑宗" || App.Data.Player.Score["门派"] == "华山派") {
                App.Core.Study.Jiqu.Commands = ["jiqu", "#unwield;#wpon;jiqu sword-cognize"]
            } else {
                App.Core.Study.Jiqu.Commands = ["jiqu"]
            }
        }

        App.LoadVariable("study").forEach(line => {
            let action = actionModule.Parse(line)
            switch (action.Command) {
                case "#random":
                    App.Core.Study.LearnMode = 1
                    break
                case "#order":
                    App.Core.Study.LearnMode = 2
                    break
                case "#lowest":
                    App.Core.Study.LearnMode = 0
                    break
                case "#teacher":
                    data = SplitN(action.Data.trim(), "@", 2)
                    App.Core.Study.TeacherID = data[0]
                    App.Core.Study.TeacherLoc = data[1] || ""
                    break
                case "":
                    App.Core.Study.Learn.push(new Learn(action.Data))
                    break
            }
        })
        if (App.Core.Study.Learn.length) {
            Note("学习清单:")
            App.Core.Study.Learn.forEach(learn => {
                Note("  " + learn.Intro())
            })
            switch (App.Core.Study.LearnMode) {
                case 0:
                    Note("最低优先模式")
                    break
                case 1:
                    Note("随机学习模式")
                    break
                default:
                    Note("顺序学习模式")
            }
            if (App.Core.Study.TeacherID && App.Core.Study.TeacherLoc) {
                Note("老师信息:" + App.Core.Study.TeacherID + "@" + App.Core.Study.TeacherLoc)
            }
        }
        App.LoadVariable("lian").forEach(line => {
            let action = actionModule.Parse(line)
            switch (action.Command) {
                case "#random":
                    App.Core.Study.LearnMode = 1
                    break
                case "#order":
                    App.Core.Study.LearnMode = 2
                    break
                case "#lowest":
                    App.Core.Study.LearnMode = 0
                    break
                case "":
                    App.Core.Study.Lian.push(new Learn(action.Data, "lian"))
                    break
            }
        })

    }
    App.Core.Study.Load()
    App.Core.Study.SetLearn = (type, skill, from, loc) => {
        let lines = GetVariable("study").split("\n")
        if (lines.length == 1 && lines[0] == "") {
            lines = []
        }
        lines.unshift(skill + "||" + type + "|" + from + "|" + loc + "||")
        SetVariable("study", lines.join("\n"))
        App.ReloadVariable()
    }
    App.Core.Study.SetTeacher = (id, loc) => {
        let lines = GetVariable("study").split("\n")
        if (lines.length == 1 && lines[0] == "") {
            lines = []
        }
        let matched = false
        lines.forEach((val, index) => {
            if (val.trim().startsWith("#teacher ")) {
                lines[index] = "#teacher " + id + "@" + loc
                matched = true
            }
        })
        if (!matched) {
            lines.push("#teacher " + id + "@" + loc)
        }
        SetVariable("study", lines.join("\n"))
        App.ReloadVariable()
    }
    App.Sender.RegisterAlias("#yanjiu", function (data) {
        let skill = App.Core.Study.FilterSkill("yanjiu")
        if (skill) {
            let times = data - 0
            if (isNaN(times) || times <= 0) {
                times = 100
            }
            if (App.Data.Player.HP["潜能"] > times) {
                var cmds = ["yanjiu " + skill.SkillID + " " + times]
                if (skill.Before) { cmds.unshift(skill.Before) }
                if (skill.After) { cmds.push(skill.After) }
                App.Send(cmds.join("\n"))
                App.Send("yun recover;yun regenerate;hp")
            }
        }
    })
    App.Sender.RegisterAlias("#lian", function () {
        let skill = App.Core.Study.FilterLian("lian")
        if (skill) {
            var times = App.Core.Study.LianMax
            var cmds = [`jifa ${skill.From} ${skill.SkillID}`, `lian ${skill.From} ${times}`]
            if (skill.Before) { cmds.unshift(skill.Before) }
            if (skill.After) { cmds.push(skill.After) }
            App.Send(cmds.join("\n"))
            App.Send("yun recover;yun regenerate;hp")
        }
    })
    App.Sender.RegisterAlias("#yanjiulian", function (data) {
        let skill = App.Core.Study.FilterSkill("yanjiu")
        let learned = false
        if (skill) {
            let times = data - 0
            if (isNaN(times) || times <= 0) {
                times = 100
            }
            if (App.Data.Player.HP["潜能"] > times) {
                learned = true
                var cmds = ["yanjiu " + skill.SkillID + " " + times]
                if (skill.Before) { cmds.unshift(skill.Before) }
                if (skill.After) { cmds.push(skill.After) }
                App.Send(cmds.join("\n"))
            }
        }
        skill = App.Core.Study.FilterLian("lian")
        if (skill) {
            learned = true
            var times = App.Core.Study.LianMax
            var cmds = [`jifa ${skill.From} ${skill.SkillID}`, `lian ${skill.From} ${times}`]
            if (skill.Before) { cmds.unshift(skill.Before) }
            if (skill.After) { cmds.push(skill.After) }
            App.Send(cmds.join("\n"))
        }
        if (learned) {
            App.Send("yun recover;yun regenerate;hp")
        }
    })

    App.Proposals.Register("jiqu", App.Proposals.NewProposal(function (proposals, context, exclude) {
        let max = context["JiquMax"] != null ? context["JiquMax"] : App.Core.Study.Jiqu.Max
        if (App.Data.Player.HP["经验"] > 100000 && max && max > 0 && App.Core.Study.Jiqu.Commands.length && App.Data.Player.HP["体会"] > max && App.Data.Player.HP["精气百分比"] > 70) {
            return function () {
                App.Commands.PushCommands(
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("yun regenerate"),
                    App.Commands.NewDoCommand(App.Random(App.Core.Study.Jiqu.Commands)),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("hp"),
                    App.NewSyncCommand(),
                )
                if (App.Map.Room.Data["NoFight"]) {
                    App.Insert(App.Move.NewToCommand(App.Params.LocDazuo),)
                }
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("study", App.Proposals.NewProposal(function (proposals, context, exclude) {
        if (App.Core.Study.HitMinPot()) {
            return null
        }
        let maxpot = GetVariable("max_pot") - 0
        if (!isNaN(maxpot) && maxpot > 0 && App.Data.Player.HP["潜能"] >= maxpot) {
            let skill = App.Core.Study.FilterSkill()
            if (skill) {
                App.Core.Study.CurrentSkill = skill
                App.Core.Study.LastPot = 0
                App.Core.Study.LearndTimes = 0
                let data = Object.create(context)
                data.NeiliMin = 15
                return () => {
                    $.PushCommands(
                        $.Function(() => { App.Core.Study.DoLearn(data) })
                    )
                    $.Next()
                }
            }
        }
        return null
    }))
    App.UserQueue.UserQueue.RegisterCommand("#study", function (uq, data) {
        uq.Commands.Append(
            App.NewPrepareCommand("commonWithStudy"),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })
    App.Sender.RegisterAlias("#jifa", function (data) {
        App.Send(GetVariable("jifa"))
    })
    App.UserQueue.UserQueue.RegisterCommand("#jifa", function (uq, data) {
        uq.Commands.Append(
            App.Commands.NewDoCommand(GetVariable("jifa")),
            uq.Commands.NewFunctionCommand(function () { uq.Next() }),
        )
        uq.Commands.Next()
    })
})(App)