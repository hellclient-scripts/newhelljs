(function (App) {
    print("加载脚本")
    App.Data = {}
    App.Include("src/params.js")
    App.RequireModule("helllibjs/history/history.js").Install(100)
    App.Include("src/core/index.js")
    App.Include("src/userspace.js")
    App.Include("src/ui/index.js")
    App.Include("src/quests/index.js")

})(App)