(function(app){
    let module={}
    module.DefaultParser=function(cmd,Grouped){
        return [[cmd]]
    }
    module.DefaultGetterEcho=function(){
        return true
    }
    module.DefaultTryAlias=function(sender,cmd){
        return false
    }
    class Sender{
        Aliases={}
        TryAlias=module.DefaultTryAlias
        GetterEcho=module.DefaultGetterEcho
        Parser=module.DefaultParser
        Send(cmd,Grouped){
            let result=this.Parser(cmd,Grouped)
            if (result){
                result.forEach(cmds => {
                    if (cmds.length==1){
                        if (this.TryAlias(this,cmds[0])){
                            return
                        }
                    }
                    Metronome.push(cmds,true,this.GetterEcho())
                });
            }
        }
        RegisterAlias(name,callback){
            this.Aliases[name]=callback
        }
    }
    module.Sender=Sender
    return module
})