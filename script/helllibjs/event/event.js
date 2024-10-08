(function(app){
    var module={}
    class Context{
        constructor(){}
        Data={}
        #proposalsEarlier=[]
        #proposalsEarly=[]
        #proposals=[]
        #proposalsLate=[]
        #proposalsLater=[]
        #usedname={}
        Set(name,data){
            this.Data[name]=data
        }
        Get(name,defaultvalue){
            let result=this.Data[name]
            if (result===null||result==undefined){
                return defaultvalue
            }
            return result
        }
        Propose(name,callback){
            return this.#propose(this.#proposals,name,callback)
        }
        ProposeEarly(name,callback){
            return this.#propose(this.#proposalsEarly,name,callback)
        }
        ProposeEarlier(name,callback){
            return this.#propose(this.#proposalsEarlier,name,callback)
        }
        ProposeLate(name,callback){
            return this.#propose(this.#proposalsLate,name,callback)
        }
        ProposeLater(name,callback){
            return this.#propose(this.#proposalsLater,name,callback)
        }
        Execute(){
            [this.#proposalsEarlier,this.#proposalsEarly,this.#proposals,this.#proposalsLate,this.#proposalsLater].forEach(proposals => {
                proposals.forEach(hook=>{
                    hook()
                })
            });
        }
        #propose(proposals,name,callback) {
            if (name && this.#usedname[name]){
                return false
            }
            this.#usedname[name]=true
            proposals.push(callback)
            return true
        }
    }
    class Event{
        constructor(n,d){
            this.Name=n
            this.Data=d
            this.Context=new Context()
        }
        WithType(t){
            this.Type=t
            return this
        }
        Type=""
        Name=""
        Data=null
        Context=null
    }
    class Bus{
        constructor(){}
        #handlers={}
        BindEvent(eventname,handler){
            if (!this.#handlers[eventname]){
                this.#handlers[eventname]=[]
            }
            this.#handlers[eventname].push(handler)
        }
        UnbindEvent(eventname,handler){
            if (!this.#handlers[eventname]){
                return
            }
            let result={}
            this.#handlers[eventname].array.forEach(element => {
                if (element!=handler){
                    result.push(element)
                }
            });
            if (result.length){
                this.#handlers[eventname]=result
            }else{
                delete this.#handlers[eventname]
            }
        }
        UnbindAll(eventname){
            delete this.#handlers[eventname]
        }
        Reset(){
            this.#handlers={}
        }
        RaiseEvent(event){
            if (this.#handlers[event.Name]){
                this.#handlers[event.Name].forEach(function(callback){
                    callback(event)
                })
            }
        }
    }
    module.Event=Event
    module.Bus=Bus
    return module
})