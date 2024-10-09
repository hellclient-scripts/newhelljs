(function (app) {
    let module={}
    let re=/\|/g
    let DefaultSpliter=function(str){
        return str.split(re)
    }
    module.Wait=function(uq,data){
        uq.Commands.Append(
            uq.Commands.NewCommandWait(data-0),
            uq.Commands.NewCommandFunction(function(){uq.Next()}),
        )
        uq.Commands.Next()
    }
    module.Loop=function(uq,data){
        uq.Remain=[...uq.All]
        uq.Commands.Append(
            uq.Commands.NewCommandWait(1000),
            uq.Commands.NewCommandFunction(function(){uq.Next()}),
        )
        uq.Commands.Next()
    }
    module.Do=function(uq,data){
        uq.Commands.Append(
            uq.Commands.NewCommandDo(data),
            uq.Commands.NewCommandFunction(function(){uq.Next()}),
        )
        uq.Commands.Next()
    }
    class QueueItem{
        constructor(command,data){
            this.Data=data
            this.Command=command
        }
        Command=null
        Data=""
    }
    class UserQueue{
        All=[]
        Remain=[]
        constructor(commands){
            this.Commands=commands
        }
        Commands=null
        Stopped=false
        CommandPrefix="#"
        Spliter=DefaultSpliter
        #registerCommands={}
        RegisterCommand(name,fn){
            this.#registerCommands[name]=fn
        }
        Exec(str){
            this.Stopped=false
            let data=this.Spliter(str)
            data.forEach(text => {
                if (text.startsWith(this.CommandPrefix)){
                    let result=SplitN(text," ",2)
                    let cmd=this.#registerCommands[result[0]]
                    if (cmd){
                        this.All.push(new QueueItem(cmd,text.slice(result[0].length).trim()))
                        return
                    }
                }
                this.All.push(new QueueItem(module.Do,text))
            });
            this.Remain=[...this.All]
            this.Next()
        }
        Stop(){
            this.Stopped=true
        }
        Next(){
            if (!this.Stopped){
                if (this.Remain.length){
                    let item=this.Remain.shift()
                    this.Commands.Append(
                        this.Commands.NewCommandFunction(()=>{
                            item.Command(this,item.Data)
                        })
                    )
                }else{
                    this.Stopped=true
                }
            }
            this.Commands.Next()
        }
    }
    module.UserQueue=UserQueue
    return module
})