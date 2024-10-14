(function (App) {
    App.Data.Player = {
        HP: {},
        HPM: {},
        Special: {},
        Score: {},
        Skills: {},
    }
    let checkerHP = App.Checker.Register("hp", "yun recover;yun regenerate;hp", 5000)
    // ┌───个人状态────────────┬───────────────────┐
    // │【精气】 160     / 160      [100%]    │【精力】 0       / 0       (+   0)    │
    // │【气血】 523     / 523      [100%]    │【内力】 1724    / 920     (+   0)    │
    // │【食物】 638     / 400      [很饱]    │【潜能】 14376                        │
    // │【饮水】 224     / 400      [缺水]    │【经验】 145283                       │
    // │                                      │【体会】 38                           │
    // ├───────────────────┴───────────────────┤
    // │【状态】 健康、平和                                                           │
    // └──────────────────────────────终极地狱─────┘
    var matcherHPLine1 = /^│【精气】\s*(-?\d+)\s*\/\s+(-?\d+)\s*\[\s*(-?\d+)%\]\s+│【精力】\s+(-?\d+)\s+ \/\s*(-?\d+)\s+\(\+\s*(\d+)\)\s+│$/
    var matcherHPLine2 = /^│【气血】\s*(-?\d+)\s*\/\s+(-?\d+)\s*\[\s*(-?\d+)%\]\s+│【内力】\s+(-?\d+)\s+ \/\s*(-?\d+)\s+\(\+\s*(\d+)\)\s+│$/
    var matcherHPLine3 = /^│【食物】\s*(-?\d+)\s*\/\s+(-?\d+)\s*\[.+\]\s+│【潜能】\s+(-?\d+)\s+│$/
    var matcherHPLine4 = /^│【饮水】\s*(-?\d+)\s*\/\s+(-?\d+)\s*\[.+\]\s+│【经验】\s+(-?\d+)\s+│$/
    var matcherHPLine5 = /^│\s+│【体会】\s+(-?\d+)\s+│$/
    var matcherHPEnd = /^└─+.+─+─┘$/

    var PlanOnHP = new App.Plan(App.Positions.Connect,
        function (task) {
            task.AddTrigger(matcherHPLine1, function (trigger, result, event) {
                App.Data.Player.HP["当前精气"] = result[1] - 0
                App.Data.Player.HP["精气上限"] = result[2] - 0
                App.Data.Player.HP["精气百分比"] = result[3] - 0
                App.Data.Player.HP["当前精力"] = result[4] - 0
                App.Data.Player.HP["精力上限"] = result[5] - 0
                App.Data.Player.HP["加精"] = result[6] - 0
                return true
            })
            task.AddTrigger(matcherHPLine2, function (trigger, result, event) {
                App.Data.Player.HP["当前气血"] = result[1] - 0
                App.Data.Player.HP["精气气血"] = result[2] - 0
                App.Data.Player.HP["气血百分比"] = result[3] - 0
                App.Data.Player.HP["当前内力"] = result[4] - 0
                App.Data.Player.HP["内力上限"] = result[5] - 0
                App.Data.Player.HP["加力"] = result[6] - 0
                return true
            })
            task.AddTrigger(matcherHPLine3, function (trigger, result, event) {
                App.Data.Player.HP["当前食物"] = result[1] - 0
                App.Data.Player.HP["最大食物"] = result[2] - 0
                App.Data.Player.HP["潜能"] = result[3] - 0
                return true
            })
            task.AddTrigger(matcherHPLine4, function (trigger, result, event) {
                App.Data.Player.HP["当前饮水"] = result[1] - 0
                App.Data.Player.HP["最大饮水"] = result[2] - 0
                App.Data.Player.HP["经验"] = result[3] - 0
                return true
            })
            task.AddTrigger(matcherHPLine5, function (trigger, result, event) {
                App.Data.Player.HP["体会"] = result[1] - 0
                return true
            })
            task.AddTimer(5000)
            task.AddTrigger(matcherHPEnd)
        },
        function (result) {
            checkerHP.Reset()
        })
    App.Core.OnHP = function (event) {
        event.Context.Propose(function () {
            App.Data.Player.HP = {}
            PlanOnHP.Execute()
        })
    }
    App.BindEvent("core.hp", App.Core.OnHP)

// 你现在会以下这些特技：
// 杀气(hatred)
// 小周天运转(self)
    matcherSpecial = /^\S+\(([a-z]+)\)$/
    var PlanOnSpecial = new App.Plan(App.Positions.Connect,
        function (task) {
            task.AddTrigger(matcherSpecial, function (trigger, result, event) {
                App.Data.Player.Special[result[1]] = true
                event.Context.Set("core.player.onspecial", true)
                return true
            })
            task.AddCatcher("line", function (catcher, event) {
                return event.Context.Get("core.player.onspecial")
            })
            task.AddTimer(5000)
        },
        function (result) {
        })
    App.Core.OnSpecial = function (event) {
        event.Context.Propose(function () {
            App.Data.Player.Special = {}
            PlanOnSpecial.Execute()
        })
    }
    App.BindEvent("core.special", App.Core.OnSpecial)
    var LastID = ""
    var LastName = ""
    App.Core.OnTitle = function (event) {
        LastName = event.Data.Wildcards[0]
        LastID = event.Data.Wildcards[1].toLowerCase()
    }
    App.BindEvent("core.title", App.Core.OnTitle)
    App.Core.OnScore = function (event) {
        event.Context.Propose(function () {
            App.Data.Player.Score = {}
            App.Data.Player.Score["名字"] = LastName
            App.Data.Player.Score.ID = LastID
            PlanOnScore.Execute()
        })

    }
    let checkerScore = App.Checker.Register("score", "score", 600000)

    App.BindEvent("core.score", App.Core.OnScore)
    var matcherScoreEnd = /^└─+┴─+.+─+┘$/
    var matcherScoreFamily = /│年龄：(\S+)\s+婚姻：(\S+)\s+│门派：(\S+)\s+│/
    var PlanOnScore = new App.Plan(App.Positions.Connect,
        function (task) {
            task.AddTrigger(matcherScoreFamily, function (trigger, result, event) {
                App.Data.Player.Score["门派"] = result[3]
                return true
            })
            task.AddTimer(5000)
            task.AddTrigger(matcherScoreEnd)
        },
        function (result) {
            checkerScore.Reset()
        })
    var LastType = ""
    App.Core.OnSkills = function (event) {
        event.Context.Propose(function () {
            App.Data.Player.Skills = {}
            LastType = ""
            PlanOnSkills.Execute()
        })
    }
    let checkerSkills = App.Checker.Register("skills", "skills", 300000)
    App.BindEvent("core.skills", App.Core.OnSkills)
    // ┌─────────────┬─────────────┬──────┬──────┐
    // │名称                      │ID                        │描述        │级别        │
    // ├───四项基本功夫────┼─────────────┼──────┼──────┤
    // │  基本内功                │force                     │【不足挂齿】│  71 / 56   │
    // │□叫花内功                │jiaohua-neigong           │【不足挂齿】│  71 / 7    │
    // ├─────────────┼─────────────┼──────┼──────┤
    // │  基本轻功                │dodge                     │【不堪一击】│  12 / 58   │
    // │  基本拳脚                │unarmed                   │【不堪一击】│   2 / 40   │
    // │  基本招架                │parry                     │【不堪一击】│   1 / 0    │
    // ├───一项知识技能────┼─────────────┼──────┼──────┤
    // │  读书写字                │literate                  │【新学乍用】│  26 / 97   │
    // └─────────────┴─────────────┴──────┴──────┘
    var matcherSkillsType = /^├─+.+项([^─]+)─+┼─+┼─+┼─+┤$/
    var matcherSkills = /^│(  |□)(\S+)\s+│(\S+)\s+│【.+】│\s*(\d+) \/\s*(\d+)\s*│$/
    var matcherSkillsEnd = /^└─*┴─*┴─*┴─*┘$/
    var PlanOnSkills = new App.Plan(App.Positions.Connect,
        function (task) {
            task.AddTrigger(matcherSkillsType, function (trigger, result, event) {
                LastType = result[1]
                return true
            })
            task.AddTrigger(matcherSkills, function (trigger, result, event) {
                let skill = {}
                skill.ID = result[3]
                skill["名称"] = result[2]
                skill["激发"] = (result[1].trim() != "")
                skill["类型"] = LastType
                skill["等级"] = result[4] - 0
                skill["进度"] = result[5] - 0
                App.Data.Player.Skills[skill.ID] = skill
                return true
            })
            task.AddTimer(5000)
            task.AddTrigger(matcherSkillsEnd)
        },
        function (result) {
            checkerSkills.Reset()
        })
    App.Core.OnNoSkill = function (event) {
        event.Context.Propose(function () {
            App.Data.Player.Skills = {}
            LastType = ""
        })
    }
    App.BindEvent("core.noskill", App.Core.OnNoSkill)

    App.Core.OnHPM = function (event) {
        event.Context.Propose(function () {
            App.Data.Player.HPM = {}
            PlanOnHPM.Execute()
        })
    }
    // ≡───────────────────────────────≡
    // 【精力上限】  480                  【内力上限】  1060
    // 【潜能上限】  21816                【体会上限】  1263
    // 【当前等级】  114                  【升级所需】  2871
    // 【最大加怒】  7000                 【最大加力】  53
    // ≡────────────────────────终极地狱───≡        
    var matcherHPMEnd = /^≡─+[^─]+─+≡$/
    var matcherHMP1 = /^【精力上限】\s*(\S+)\s*【内力上限】\s*(\S+)\s*$/
    var matcherHMP2 = /^【潜能上限】\s*(\S+)\s*【体会上限】\s*(\S+)\s*$/
    var matcherHMP3 = /^【当前等级】\s*(\S+)\s*【升级所需】\s*(\S+)\s*$/
    var matcherHMP4 = /^【最大加怒】\s*(\S+)\s*【最大加力】\s*(\S+)\s*$/

    var PlanOnHPM = new App.Plan(App.Positions.Connect,
        function (task) {
            task.AddTrigger(matcherHMP1, function (trigger, result, event) {
                App.Data.Player.HPM["精力上限"] = result[1] - 0
                App.Data.Player.HPM["内力上限"] = result[2] - 0
                return true
            })
            task.AddTrigger(matcherHMP2, function (trigger, result, event) {
                App.Data.Player.HPM["潜能上限"] = result[1] - 0
                App.Data.Player.HPM["体会上限"] = result[2] - 0
                return true
            })
            task.AddTrigger(matcherHMP3, function (trigger, result, event) {
                App.Data.Player.HPM["当前等级"] = result[1] - 0
                App.Data.Player.HPM["升级所需"] = result[2] - 0
                return true
            })
            task.AddTrigger(matcherHMP4, function (trigger, result, event) {
                App.Data.Player.HPM["最大加怒"] = result[1] - 0
                App.Data.Player.HPM["最大加力"] = result[2] - 0
                return true
            })
            task.AddTimer(5000)
            task.AddTrigger(matcherHPMEnd)
        },
        function (result) {
            checkerHPM.Reset()
        })

    let checkerHPM = App.Checker.Register("hpm", "hp -m", 300000)
    App.BindEvent("core.hpm", App.Core.OnHPM)

})(App)