//检查器模块
(function (App) {
    let checkerModule=App.RequireModule("helllibjs/checker/checker.js")
    App.Checker=new checkerModule.Checker()
})(App)