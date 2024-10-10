(function (App) {
    let roomshModule=App.RequireModule("helllibjs/roomsh/roomsh.js")
    App.RoomsH=new roomshModule.File()
    let mapfile="data/rooms.h"
    Note("加载地图文件"+mapfile)
    App.RoomsH.Load(ReadLines(mapfile))
    App.Map.Data.RoomsByName={}
    _re=/·/g
    App.RoomsH.Data.forEach(line => {
        if (line.Ready()){
            if (!App.Map.Data.RoomsByName[line.Name]){
                App.Map.Data.RoomsByName[line.Name]=[]
            }
            App.Map.Data.RoomsByName[line.Name].push(line.ID)
            Mapper.setroomname(line.ID,line.Name)
            line.Exits.forEach(exit=>{
                if (exit.Ready()){
                    exit.Command=exit.Command.replaceAll(_re,"")
                    exit.AddToMapper()
                }
            })
        }
    });
})(App)