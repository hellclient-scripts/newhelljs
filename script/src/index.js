(function(app){
    print("加载脚本")
    app.Data={}
    app.Params=app.Include("src/params.js")
    app.RequireModule("helllibjs/history/history.js").Install(100)
    app.Include("src/core/index.js")
    
})(App)