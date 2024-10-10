(function(app){
    App.Stop=function(){
        Note("停止继续任务")
        App.RaiseEvent(new App.Event("core.stop"))
    }
    App.Core={}
    App.Positions={}
    App.Include("src/core/init.js")
    App.Include("src/core/committee.js")
    App.Include("src/core/commands.js")
    App.Include("src/core/userqueue.js")
    App.Include("src/core/connect.js")
    App.Include("src/core/player.js")
    App.Include("src/core/room.js")
    App.Include("src/core/move.js")
    App.Include("src/core/item.js")
    App.Include("src/core/mapper.js")
    App.Include("src/core/sender.js")
    App.Include("src/core/maze.js")
    App.Include("src/core/response.js")
    App.Include("src/core/alias.js")
    App.Include("src/core/goods.js")
    App.Include("src/core/prepare.js")    
    App.Include("src/core/zone.js")
})(App)