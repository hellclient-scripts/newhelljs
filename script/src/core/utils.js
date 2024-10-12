(function (App) {
    App.Random=function(target){
        if (typeof(target)=="object"){
            if (target instanceof Array){
                return target[App.Random(target.length)]
            }else{
                return target[App.Random(Object.keys(target))]
            }
        }
        return Math.floor(Math.random()*(target-0))
    }
})(App)