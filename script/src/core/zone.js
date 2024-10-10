(function (App) {
    App.Zone={}
    App.Zone.Maps={}
    let convertPath=function(fr,cmds){
        return App.Map.TraceRooms(fr,...cmds.split(";"))
    }
    App.Zone.Maps["扬州"]=convertPath("54","w;w;w;n;w;s;e;e;e;e;e;e;e;e;n;s;se;nw;w;w;w;w;s;s;s;s;su;nd;w;e;e;w;n;n;se;s;n;e;ne;e;w;sw;w;nw;n;n;n;e;w;w;e;n;w;u;d;e;n;e;s;n;e;s;n;e;n;e;n;w;n;s;s;s;s;s;w;e;se;nw;n;n;n;n;e;e;ne;n;n;s;s;sw;se;s;e;w;s;n;w;e;n;nw;w;w;w;w;w;w;n;s;s;n;w;n;n;n;s;s;s;w;w;w;w;s;s;n;n;w;n;s;w;e;e;e;e;e;e;e;e;n;w;e;n;e;u;d;w;n;n;n;n;n;s;s;s;s;w;w;w;n;n;s;w;s;e;e;e;e;s;s;w;e;s;w;n;s;s;n;w;e;e;e;e;w;s;n;w;s;w;e;s;s;n;n;n;w;s;n;n;s;e;s;s;s")
    App.UserQueue.UserQueue.RegisterCommand("#search",function(uq,data){
        let result=SplitN(data," ",2)
        if (result.length!=2){
            Note("#search 格式错误，应该为 #search 地区 NPC中文名")
            uq.Commands.Next()
            return    
        }
        let rooms=App.Zone.Maps[result[0]]
        if (!rooms){
            Note("#search 地图未招到")
            uq.Commands.Next()
            return    
        }
        let npc=result[1]
        if (!npc){
            npc=""
        }
        uq.Commands.Append(
            App.Move.NewRoomsCommand(rooms,App.Move.Search(npc)),
            uq.Commands.NewFunctionCommand(function(){uq.Next()}),
        )
        uq.Commands.Next()
    })
})(App)