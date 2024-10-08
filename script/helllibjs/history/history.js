(function(app){
    let ring=app.Include("helllibjs/lib/container/ring.js")
    let line=app.Include("helllibjs/lib/line/line.js")
    class History{
        constructor(size){
            this.Lines=ring.New(size)
            this.Size=size
        }
        OnEvent(event){
            if (event.Name=="line"){
                this.Current=event.Data.Output
                this.CurrentOutput=line.Line.FromOutput(JSON.parse(DumpOutput(1))[0])
                this.Lines=this.Lines.Next().WithValue({
                    Line:this.Current,
                    Output:this.CurrentOutput,
                })
            }
        }
        GetLast(n){
            let result=[]
            if (n>this.Size){
                n=this.Size
            }
            let r=this.Lines
            for (let i=0;i<n;i++){
                let v=r.Value()
                if (v!=null){
                    result.unshift(v)
                }
                r=r.Prev()
            }
            return result
        }
        static Install(size){
            app.History=new History(size)
            app.Engine.BindEventHandler(function(event){
                app.History.OnEvent(event)
            })
        }
        Size=0
        Lines=null
        Current=""
        CurrentOutput=null
        LineModule=line
    }
    return History
})