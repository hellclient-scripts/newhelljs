(function (App) {
    let Mode=0
    let LastTry=0
    let rooms=[]
    let rides=[]
    let paths=[]
    let load=function(file,target){
        let lines=ReadLines(file)
        lines.forEach(line => {
            line=line.trim()
            if (line=="" || line.startsWith("//")){
                return
            }
            target.push(line)
        });
    }
    load("data/ridable.h",rooms)
    load("data/ridable2.h",rooms)
    load("data/rideto.h",rides)
    rides.forEach(line=>{
        paths.push(App.RoomsH.ParsePath("-1",line))
    })
    rooms.forEach(room=>{
        paths.forEach(path=>{
            path.From=room
            path.AddToMapper()
        })
    })
    ridable=function(){
        var cmd = GetVariable("cmd_ride") || ""
        cmd = cmd.trim()
        if (cmd) {
            if (Mode == 0 || Mode == 1) {
                return true
            }
            if ((new Date()).getTime()-LastTry>5*1000){
                Mode.mode = 0
                return true
            }
        }
        return false
    
    }
    App.Map.AppendTagsIniter(function(){
        App.Map.SetTag("ride",ridable())
    })
    App.Engine.SetFilter("core.ride.nohorse", function (event) {
        var cmd = GetVariable("cmd_ride") || ""
        cmd = cmd.trim()
        if (Mode == 0 && cmd) {
            Mode = 1
            App.Send(cmd + ";whistle;" + cmd)
            App.RaiseEvent(event)
            return
        }
        LastTry=(new Date()).getTime()
        Mode = 2
        App.RaiseEvent(event)
    })

})(App)