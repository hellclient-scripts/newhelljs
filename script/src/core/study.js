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
    }
    App.Core.Study.LearnMode = 0
    App.Core.Study.LearnMax = 100
    App.Core.Study.YanjiuMax = 100
    App.Core.Study.Learn = []
    App.Core.Study.TeacherID = ""
    App.Core.Study.TeacherLoc = ""
    class Learn {
        constructor(line) {
            line = line.trim()
            if (line[0] == "!") {
                this.Important = true
                line = line.slice(1)
            }
            let data = line.split("|")
            this.SkillID = data[0].trim()
            this.Limit = data[1] ? data[1].split(",").map((val) => val.trim()) : []
            this.Type = data[2] ? data[2] : "yanjiu"
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
            result += this.Type ? this.Type : "yanjiu"
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
                    $.PushCommands(
                        $.To(loc),
                        $.Do("yanjiu " + this.SkillID + " " + times),
                        $.Do("hp"),
                        $.Wait(1000),
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
                    $.PushCommands(
                        $.To(loc),
                        $.Do("learn " + from + " about " + this.SkillID + " " + times),
                        $.Do("hp"),
                        $.Wait(1000),
                        $.Sync(),
                    )
                    $.Next()

                    break
                case "exec":
                    if (!this.Loc) {
                        PrintSystem("未知的学习位置 " + this.Loc)
                        return
                    }
                    if (!this.From) {
                        PrintSystem("未知的学习目标 " + this.From)
                        return
                    }
                    $.PushCommands(
                        $.To(this.Loc),
                        $.Do(this.From),
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
                if (skill["类型"] == "基本功夫" && skill["等级"] >= App.Data.Player.HPM["当前等级"]) {
                    return false
                }
            }
            if (this.Type == "yanjiu") {
                if (!skill || skill["等级"] < 180) {
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
        Import = false
        Next = 0
    }
    App.Core.Study.FilterSkill = () => {
        let filtered = []
        let important = null
        App.Core.Study.Learn.forEach(learn => {
            if (learn.Check()) {
                filtered.push(learn)
                if (learn.Important && important == null) {
                    important = learn
                }
            }
        })
        if (important) {
            return important
        }
        if (filtered.length) {
            switch (App.Core.Study.LearnMode) {
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
                        $.Function(()=>{App.Core.Study.DoLearn(context)}),
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

    }
    App.Core.Study.Load()
    App.Proposals.Register("jiqu", App.Proposals.NewProposal(function (proposals, context,exclude) {
        if (App.Data.Player.HP["经验"] > 100000 && App.Core.Study.Jiqu.Max && App.Core.Study.Jiqu.Max > 0 && App.Core.Study.Jiqu.Commands.length && App.Data.Player.HP["体会"] > App.Core.Study.Jiqu.Max) {
            return function () {
                App.Commands.PushCommands(
                    App.Move.NewToCommand(App.Params.LocDazuo),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand(App.Random(App.Core.Study.Jiqu.Commands)),
                    App.NewNobusyCommand(),
                    App.Commands.NewDoCommand("hp"),
                    App.NewSyncCommand("hp"),
                )
                App.Next()
            }
        }
        return null
    }))
    App.Proposals.Register("study", App.Proposals.NewProposal(function (proposals, context,exclude) {
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
                data.NeiliMin = 25
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
            App.NewPrepareCommand("commonWithStudy")
        )
        uq.Commands.Next()
    })
})(App)