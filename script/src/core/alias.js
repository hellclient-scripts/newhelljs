//别名响应模块
(function (App) {
    App.Alias={}
    App.Alias.Stop=function(n,l,w){
        App.Stop()
    }
    App.Alias.ForceStop = function (n, l, w) {
        App.Quests.ForceStop()
    }

})(App)