$.Module(function (App) {
    let Quest = App.Quests.NewQuest("eatlu")
    Quest.Name = "去Pkd吃天香玉露"
    Quest.Desc = "带要吃的露在身上，确保自己没不能进pkd的状态"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.GetReady = function (q, data) {
        if (App.Data.Item.List.FindByIDLower("magic water").First()) {
            return Quest.Start
        }
        return null
    }

    Quest.Start = function (data) {
        App.Core.EatLu()
    }
    App.Quests.Register(Quest)
})