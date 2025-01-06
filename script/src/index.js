// 机器组加载函数
(function (App) {
    print("加载脚本")
    App.Data = {}
    App.Include("src/params.js")
    App.Include("src/questparams.js")
    App.RequireModule("helllibjs/history/history.js").Install(100) //加载历史信息组件,并定义大小
    App.Include("src/core/index.js")
    App.Include("src/userspace.js")
    App.Include("src/ui/index.js")
    App.Include("src/quests/index.js")
    App.Include("src/tools/index.js")

})(App)