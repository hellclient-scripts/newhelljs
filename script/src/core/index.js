(function(app){
    app.Core={}
    app.Positions={}
    app.Include("src/core/init.js")
    app.Include("src/core/committee.js")
    app.Include("src/core/connect.js")
    app.Include("src/core/player.js")
    app.Include("src/core/room.js")
    app.Include("src/core/move.js")
    app.Include("src/core/item.js")
    app.Include("src/core/mapper.js")
    app.Include("src/core/sender.js")

})(App)