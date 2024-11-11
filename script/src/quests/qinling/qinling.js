$.Module(function (App) {
    let Qinling={}
    Qinling.Start=()=>{
        
    }
    let Quest = App.Quests.NewQuest("qinling")
    Quest.Name = "秦岭副本"
    Quest.Desc = ""
    Quest.Intro = ""
    Quest.Help = ""
    Quest.OnHUD = () => {
        return null
    }
    Quest.OnSummary = () => {
        return null
    }
    Quest.OnReport = () => {
        return null
    }
    Quest.Start = function (data) {
        Qinling.Start()
    }
    App.Quests.Register(Quest)
    App.Quests.Xuemo = Xuemo
})