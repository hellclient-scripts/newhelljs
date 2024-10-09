(function(app){
    let cnumberModule = app.RequireModule("helllibjs/cnumber/cnumber.js")

    let module={}
    module.CNumber=new cnumberModule.CNumber()
    class ObjectData{
        constructor(){
        }
        IDLower=""
        Unit=""
        Count=1
        Name=""
    }
    module.DataParaser=function(obj){
        if (obj.Data==null){
            obj.Data=new ObjectData()
            obj.Data.IDLower=obj.ID.toLowerCase()
            let result=module.CNumber.Convert(obj.Label)
            obj.Data.Count=result.Count
            obj.Data.Unit=result.Unit
            obj.Data.Name=result.Name
        }
    }
    class Object{
        constructor(label,id,raw){
            this.ID=id
            this.Label=label
            this.#raw=raw
        }
        GetData(){
            module.DataParaser(this)
            return this.Data
        }
        GetRaw(){
            return this.#raw
        }
        WithParam(name,data){
            this.Params[name]=data
            return this
        }
        Data=null
        ID=""
        #raw=null
        Label=""
        Params={}
        Mode=0
    }
    class List{
        constructor(){
        }
        Items=[]
        Append(item){
            this.Items.push(item)
        }
        FindByID(id){
            let result=new List()
            this.Items.forEach(item=>{
                if (item.ID==id){
                    result.Append(item)
                }
            })
            return result
        }
        FindByIDLower(id){
            id=id.toLowerCase()
            let result=new List()
            this.Items.forEach(item=>{
                if (item.GetData().IDLower==id){
                    result.Append(item)
                }
            })
            return result
        }
        FindByLabel(label){
            let result=new List()
            this.Items.forEach(item=>{
                if (item.Label==label){
                    result.Append(item)
                }
            })
            return result
        }
        FindByName(name){
            let result=new List()
            this.Items.forEach(item=>{
                if (item.GetData().Name==name){
                    result.Append(item)
                }
            })
            return result
        }
    }
    module.Object=Object
    module.List=List
    return module
})