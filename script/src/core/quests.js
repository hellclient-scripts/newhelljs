(function (App) {
    let questsModule=App.RequireModule("helllibjs/quests/quests.js")
    let conditionsModule=App.RequireModule("helllibjs/conditions/conditions.js")

    App.Quests=new questsModule.Quests(App.Positions["Quest"],App.Commands,new conditionsModule.Conditions)
})(App)