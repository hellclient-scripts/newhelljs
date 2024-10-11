(function(app){
    print("加载脚本")
    App.Stopped=false
    App.Data={}
    App.Params=App.Include("src/params.js")
    App.RequireModule("helllibjs/history/history.js").Install(100)
    App.Include("src/core/index.js")
    App.Include("src/quests/index.js")

})(App)