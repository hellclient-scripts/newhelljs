(function(app){
    let module={}
    module.DefaultParser=function(cmd,Grouped){
        return [[cmd]]
    }
    module.DefaultGetterEcho=function(){
        return true
    }
    class Sender{
        Aliases={}
        GetterEcho=module.DefaultGetterEcho
        Parser=module.DefaultParser
        Send(cmd,Grouped){
            let result=this.Parser(cmd,Grouped)
            if (result){
                result.forEach(cmds => {
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