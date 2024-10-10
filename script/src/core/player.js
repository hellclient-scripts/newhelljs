(function (App) {
    App.Data.Player = {
        HP: {},
        Special: {},
        Score:{},
        Skills:{},
    }
    var matcherHPLine1 = /^│【精气】\s*(-?\d+)\s*\/\s+(-?\d+)\s*\[\s*(-?\d+)%\]\s+│【精力】\s+(-?\d+)\s+ \/\s*(-?\d+)\s+\(\+\s*(\d+)\)\s+│$/
    var matcherHPLine2 = /^│【气血】\s*(-?\d+)\s*\/\s+(-?\d+)\s*\[\s*(-?\d+)%\]\s+│【内力】\s+(-?\d+)\s+ \/\s*(-?\d+)\s+\(\+\s*(\d+)\)\s+│$/
    var matcherHPLine3 = /^│【食物】\s*(-?\d+)\s*\/\s+(-?\d+)\s*\[.+\]\s+│【潜能】\s+(-?\d+)\s+│$/
    var matcherHPLine4 = /^│【饮水】\s*(-?\d+)\s*\/\s+(-?\d+)\s*\[.+\]\s+│【经验】\s+(-?\d+)\s+│$/
    var matcherHPLine5 = /^│\s+│【体会】\s+(-?\d+)\s+│$/
    var matcherHPEnd = /^└─+.+─+─┘$/
    var PlanOnHP = new App.Plan(App.Positions.Connect,
        function (task) {
            task.NewTrigger(matcherHPLine1, function (trigger, result, event) {
                App.Data.Player.HP["当前精气"] = result[1] - 0
                App.Data.Player.HP["精气上限"] = result[2] - 0
                App.Data.Player.HP["精气百分比"] = result[3] - 0
                App.Data.Player.HP["当前精力"] = result[4] - 0
                App.Data.Player.HP["精力上限"] = result[5] - 0
                App.Data.Player.HP["加精"] = result[6] - 0
                return true
            })
            task.NewTrigger(matcherHPLine2, function (trigger, result, event) {
                App.Data.Player.HP["当前气血"] = result[1] - 0
                App.Data.Player.HP["精气气血"] = result[2] - 0
                App.Data.Player.HP["气血百分比"] = result[3] - 0
                App.Data.Player.HP["当前内力"] = result[4] - 0
                App.Data.Player.HP["内力上限"] = result[5] - 0
                App.Data.Player.HP["加力"] = result[6] - 0
                return true
            })
            task.NewTrigger(matcherHPLine3, function (trigger, result, event) {
                App.Data.Player.HP["当前食物"] = result[1] - 0
                App.Data.Player.HP["最大食物"] = result[2] - 0
                App.Data.Player.HP["潜能"] = result[3] - 0
                return true
            })
            task.NewTrigger(matcherHPLine4, function (trigger, result, event) {
                App.Data.Player.HP["当前饮水"] = result[1] - 0
                App.Data.Player.HP["最大饮水"] = result[2] - 0
                App.Data.Player.HP["经验"] = result[3] - 0
                return true
            })
            task.NewTrigger(matcherHPLine5, function (trigger, result, event) {
                App.Data.Player.HP["体会"] = result[1] - 0
                return true
            })
            task.NewTimer(5000)
            task.NewTrigger(matcherHPEnd)
        },
        function (result) {
            Dump(App.Data.Player.HP)
        })
    App.Core.OnHP = function (event) {
        event.Context.Propose("", function () {
            App.Data.Player.HP = {}
            PlanOnHP.Execute()
        })
    }
    matcherSpecial = /^\S+\(([a-z]+)\)$/
    App.BindEvent("core.hp", App.Core.OnHP)
    var PlanOnSpecial = new App.Plan(App.Positions.Connect,
        function (task) {
            task.NewTrigger(matcherSpecial, function (trigger, result, event) {
                App.Data.Player.Special[result[1]] = true
                event.Context.Set("core.player.onspecial", true)
                return true
            })
            task.NewCatcher("line", function (catcher, event) {
                return event.Context.Get("core.player.onspecial")
            })
            task.NewTimer(5000)
        },
        function (result) {
            Dump(App.Data.Player.Special)
        })
    App.Core.OnSpecial = function (event) {
        event.Context.Propose("", function () {
            App.Data.Player.Special = {}
            PlanOnSpecial.Execute()
        })
    }
    App.BindEvent("core.special", App.Core.OnSpecial)
    var LastID=""
    var LastName=""
    App.Core.OnTitle = function (event) {
        LastName=event.Data.Wildcards[0]
        LastID=event.Data.Wildcards[1].toLowerCase()
    }
    App.BindEvent("core.title",App.Core.OnTitle)
    App.Core.OnScore=function(event){
        event.Context.Propose("", function () {
            App.Data.Player.Score = {}
            App.Data.Player.Score["名字"]=LastName
            App.Data.Player.Score.ID=LastID
            PlanOnScore.Execute()
        })

    }
    App.BindEvent("core.score",App.Core.OnScore)
    var matcherScoreEnd = /^└─+┴─+.+─+┘$/
    var matcherScoreFamily=/│年龄：(\S+)\s+婚姻：(\S+)\s+│门派：(\S+)\s+│/
    var PlanOnScore = new App.Plan(App.Positions.Connect,
        function(task){
            task.NewTrigger(matcherScoreFamily,function(trigger,result,event){
                App.Data.Player.Score["门派"]=result[3]
                return true
            })
            task.NewTimer(5000)
            task.NewTrigger(matcherScoreEnd)
        },
        function(result){
            Dump(App.Data.Player.Score)
        })
    var LastType=""
    App.Core.OnSkills=function(event){
        event.Context.Propose("", function () {
            App.Data.Player.Skills={}
            LastType=""
            PlanOnSkills.Execute()
        })
    }
    App.BindEvent("core.skills",App.Core.OnSkills)
    var matcherSkillsType=/^├─+.+项([^─]+)─+┼─+┼─+┼─+┤$/
    var matcherSkills=/^│(  |□)(\S+)\s+│(\S+)\s+│【.+】│\s*(\d+) \/\s*(\d+)\s*│$/
    var matcherSkillsEnd=/^└─*┴─*┴─*┴─*┘$/
    var PlanOnSkills = new App.Plan(App.Positions.Connect,
        function(task){
            task.NewTrigger(matcherSkillsType,function(trigger,result,event){
                LastType=result[1]
                return true
            })
            task.NewTrigger(matcherSkills,function(trigger,result,event){
                let skill={}
                skill.ID=result[3]
                skill["名称"]=result[2]
                skill["激发"]=(result[1].trim()!="")
                skill["类型"]=LastType
                skill["等级"]=result[4]-0
                skill["进度"]=result[5]-0
                App.Data.Player.Skills[skill.ID]=skill
                return true
            })
            task.NewTimer(5000)
            task.NewTrigger(matcherSkillsEnd)
        },
        function(result){
        })
        App.Core.OnNoSkill=function(event){
            event.Context.Propose("", function () {
                App.Data.Player.Skills={}
                LastType=""
            })
        }
        App.BindEvent("core.noskill",App.Core.OnNoSkill)
    
})(App)