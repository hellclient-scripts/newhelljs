(function (App) {
    let martial = {
        "force": true,
        "dodge": true,
        "parry": true,
        "unarmed": true,
        "cuff": true,
        "strike": true,
        "finger": true,
        "hand": true,
        "claw": true,
        "sword": true,
        "blade": true,
        "staff": true,
        "hammer": true,
        "club": true,
        "whip": true,
        "dagger": true,
        "throwing": true,
        "poison": true,
    }
    App.Data.Player = {
        NoForce: true,
        HP: {},
        HPM: {},
        Special: {},
        Score: {},
        Skills: {},
        Jifa: {},
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
                App.Data.Player.HP["气血上限"] = result[2] - 0
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
    var matcherScoreFamily = /^│年龄：(\S+)\s+婚姻：(\S+)\s+│门派：(\S+)\s+│$/
    var matcherScoreBank = /^│钱庄：(\d+)\.\d+\.\d+\s*│帮派：.*│$/
    var matcherScoreBond = /^│债券：(\S+)\s*│威望：(\d+)\s*│$/
    var matcherScoreYueli = /^│灵慧：(\d+)\s+正气：(\d+)\s+│阅历：(\d+)\s+│$/
    var matcherScoreMenzhong = /^│住宅：(\S+)\s+│门贡：(\d+)\s*点\s*│$/
    var PlanOnScore = new App.Plan(App.Positions.Connect,
        function (task) {
            task.AddTrigger(matcherScoreFamily, function (trigger, result, event) {
                App.Data.Player.Score["门派"] = result[3]
                return true
            })
            task.AddTrigger(matcherScoreBank, (tri, result) => {
                App.Data.Player.Score["存款"] = result[1] - 0
                return true
            })
            task.AddTrigger(matcherScoreBond, (tri, result) => {
                App.Data.Player.Score["债券"] = isNaN(result[1]) ? 0 : result[1] - 0
                App.Data.Player.Score["威望"] = result[2] - 0
                return true
            })
            task.AddTrigger(matcherScoreYueli, (tri, result) => {
                App.Data.Player.Score["灵慧"] = result[1] - 0
                App.Data.Player.Score["正气"] = result[2] - 0
                App.Data.Player.Score["阅历"] = result[3] - 0
                return true
            })
            task.AddTrigger(matcherScoreMenzhong, (tri, result) => {
                App.Data.Player.Score["住宅"] = result[1]
                App.Data.Player.Score["门贡"] = result[2] - 0

                return true
            })
            task.AddTimer(5000)
            task.AddTrigger(matcherScoreEnd)
        },
        function (result) {
            checkerScore.Reset()
        })

    var LastType = ""
    var LastBasic = ""
    App.Core.OnSkills = function (event) {
        event.Context.Propose(function () {
            App.Data.Player.Skills = {}
            LastType = ""
            LastBasic = ""
            PlanOnSkills.Execute()
        })
    }
    App.Core.GetMaxSkillLevel = function () {
        let max = 0
        let maxskill = null
        for (var key in App.Data.Player.Skills) {
            let skill = App.Data.Player.Skills[key]
            if (skill["受限经验"]) {
                if (skill["等级"] > max) {
                    max = skill["等级"]
                    maxskill = skill
                }
            }
        }
        return maxskill
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
                if (skill["类型"] == "基本功夫") {
                    let isBasic = App.History.CurrentOutput.Words[1].Color == "Cyan"
                    if (isBasic) {
                        skill["基本"] = skill.ID
                        LastBasic = skill.ID
                    } else {
                        skill["基本"] = LastBasic
                    }
                } else {
                    skill["基本"] = ""
                }
                skill["受限经验"] = martial[skill["基本"]] == true
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
            LastBasic = ""
        })
    }
    App.BindEvent("core.noskill", App.Core.OnNoSkill)


    App.Core.OnChaForce = function (event) {
        event.Context.Propose(function () {
            App.Data.Player.NoForce = true
            PlanOnChaForce.Execute()
        })
    }
    var PlanOnChaForce = new App.Plan(App.Positions.Connect,
        function (task) {
            task.AddTrigger(matcherSkills, function (trigger, result, event) {
                if (result[2] != "基本内功") {
                    App.Data.Player.NoForce = false
                }
                return true
            })
            task.AddTimer(5000)
            task.AddTrigger(matcherSkillsEnd)
        })
    App.BindEvent("core.chaforce", App.Core.OnChaForce)

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

    let checkerJifa = App.Checker.Register("jifa", "jifa", 30 * 60 * 1000)
    App.Core.OnJifa = function (event) {
        event.Context.Propose(function () {
            App.Data.Player.Jifa = {}
            PlanOnJifa.Execute()
        })
    }
    App.BindEvent("core.jifa", App.Core.OnJifa)

    // ┌───基本功夫────┬───────────┬───────────┐
    // │内功 (force)          │叫花内功              │有效等级：    106     │
    // │轻功 (dodge)          │飞檐走壁              │有效等级：    22      │
    // │招架 (parry)          │无                    │有效等级：    1       │
    // ├───其他功夫────┼───────────┼───────────┤
    // └───────────┴───────────┴───────────┘
    let matcherJifa = /^│(\S+) \((.+)\)\s*│(\S+)\s*│有效等级：\s*(\d+)\s*│$/
    var PlanOnJifa = new App.Plan(App.Positions.Connect,
        function (task) {
            task.AddTrigger(matcherJifa, function (trigger, result, event) {
                let jifa = {
                    Label: result[1],
                    ID: result[2],
                    Skill: result[3],
                    Level: result[4] - 0,
                }
                App.Data.Player.Jifa[jifa.ID] = jifa
                return true
            })
            task.AddTimer(5000)
            task.AddTrigger("└───────────┴───────────┴───────────┘")
        },
        function (result) {
            checkerJifa.Reset()
        })
    App.Core.OnNoJifa = function (event) {
        event.Context.Propose(function () {
            App.Data.Player.Jifa = {}
        })
    }
    App.BindEvent("core.nojifa", App.Core.OnNoJifa)

    App.BindEvent("core.hpm", App.Core.OnHPM)
    App.BindEvent("core.skillimproved", function () {
        checkerHPM.Force()
        checkerSkills.Force()
        checkerJifa.Force()
    })
    App.Core.GetMaxExp = () => {
        let expmax = GetVariable("max_exp").trim()
        return (expmax && !isNaN(expmax)) ? expmax - 0 : 0
    }
    let PlanLeavePkd = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.AddTrigger("你逃出了屠人场。", (tri, result) => {
                task.Data = "leave"
                return true
            })

            App.Send("quit")
            App.Sync()
        },
        (result) => {
            switch (result.Task.Data) {
                case "leave":
                    App.Next()
                    return
            }
            App.Fail()
        }
    )

    let PlanEatLu = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.AddTrigger("你眼前忽然一花...", (tri, result) => {
                task.Data = "enter"
                return true
            })
            App.Send("join")
            App.Sync()
        },
        (result) => {
            switch (result.Task.Data) {
                case "enter":
                    App.Next()
                    return
            }
            App.Fail()
        }
    )
    let pkd = {
        "屠人场": true,
        "宰人场": true,
        "剁人场": true,
        "碎尸场": true,
        "喋血场": true,
        "毒人场": true,
        "丧命场": true,
        "殒命场": true,
        "送命场": true,
        "宰人场": true,
        "诛人场": true,
        "戮人场": true,
    }
    App.Core.EatLu = () => {
        $.PushCommands(
            $.To("306"),
            $.Plan(PlanEatLu),
            $.Function(() => {
                if (pkd[App.Map.Room.Name]) {
                    App.Send("eat magic water;hp;hp -m;i")
                    App.Next()
                    return
                }
                App.Fail()
            }),
            $.Nobusy(),
            $.Plan(PlanLeavePkd)
        )
        $.Next()
    }
})(App)