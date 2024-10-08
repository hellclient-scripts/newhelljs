(function(app){
    
    class Command{
        constructor(name,data){
            this.Name=name
            this.Data=data
        }
        Name=""
        Data=null
    }
    class Queue{
        constructor(...commands){
            this.Commands=commands
        }
        OnFinish=null
        OnFail=null
        Commands=[]
        WithOnFinish(callback){
            this.OnFinish=callback
        }
        WithOnFail(callback){
            this.OnFail=callback
        }
        Clone(){
            return new Queue(...this.Commands).WithOnFinish(this.OnFinish).WithOnFail(this.OnFail)
        }
    }
    class CommandManager{
        constructor(){

        }
        Queues=[]
        #registeredExecutor={}
        NewCommand(name,data){
            if (this.#registeredExecutor[name]==null){
                throw "Command executir["+name+"] not registered"
            }
            return new Command(name,data)
        }
        RegisterExecutor(name,executor){
            this.#registeredExecutor[name]=executor
        }
        Execute(command){
            let executor=this.#registeredExecutor[command.Name]
            if (!executor){
                throw "Command executir["+name+"] not registered"
            }
            return executor(command)
        }
        Next(){

        }
        Fail(){

        }
        Rollback(queues){
            this.Queues=queues
        }
        Snap(){
            let result=[]
            this.Queues.forEach(q=>{
                result.push(q.Clone())
            })
            return result
        }
    }
    
})