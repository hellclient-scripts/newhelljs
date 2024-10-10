(function (App) {
    let senderModule=App.RequireModule("helllibjs/sender/sender.js")
    App.Sender=new senderModule.Sender()
    let re=/;/g
    let re2=/[！·。]/g
    let linkre=/、/g
    App.Sender.Parser=function(cmd,Grouped){
        let result=[]
        if (Grouped){
            result.push([])
        }
        cmd=cmd.replaceAll(re2,"")
        let data=cmd.split(re)
        data.forEach(c => {
            let cmds=c.split(linkre)
            if (Grouped){
                result[0]=result[0].concat(cmds)
            }else{
                result.push(cmds)
            }
        });
        return result
    }
    App.Send=function(cmd,Grouped){
        App.Sender.Send(cmd,Grouped)
    }
})(App)