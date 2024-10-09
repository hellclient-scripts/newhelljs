(function(app){
    app.Stop=function(){
        Note("停止继续任务")
        app.RaiseEvent(new app.Event("core.stop"))
    }
    app.Core={}
    app.Positions={}
    app.Include("src/core/init.js")
    app.Include("src/core/committee.js")
    app.Include("src/core/commands.js")
    app.Include("src/core/connect.js")
    app.Include("src/core/player.js")
    app.Include("src/core/room.js")
    app.Include("src/core/move.js")
    app.Include("src/core/item.js")
    app.Include("src/core/mapper.js")
    app.Include("src/core/sender.js")
    app.Include("src/core/maze.js")
    app.Include("src/core/userqueue.js")
    app.Include("src/core/alias.js")
    app.Include("src/core/food.js")

})(App)