(function(app){
    App.Move={}
    App.Move.NewPath=function(path,...initers){
        return App.Map.NewRoute(new App.Map.Movement.Path(path.map(value=>App.Map.NewStep(value)) ),...initers)
    }
    App.Move.NewTo=function(target,...initers){
        return App.Map.NewRoute(new App.Map.Movement.To(target,...initers))
    }
    App.Move.NewRooms=function(rooms,...initers){
        return App.Map.NewRoute(new App.Map.Movement.Rooms(rooms,...initers))
    }
    App.BindEvent("core.roomentry",function(event){
        event.Context.ProposeLater("",function(){
            App.Map.OnWalking()
        })
    })
})(App)