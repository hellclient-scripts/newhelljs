(function(app){
    let ring=App.Include("helllibjs/lib/container/ring.js")
    let line=App.Include("helllibjs/lib/line/line.js")
    class Line{
        constructor(text,output){
            this.Line=text
            this.Output=output
        }
        Line=""
        Output=null
    }
    class History{
        constructor(size){
            this.Lines=ring.New(size)
            this.Size=size
        }
        OnEvent(event){
            if (event.Name=="line"){
                this.Current=event.Data.Output
                this.CurrentOutput=line.Line.FromOutput(JSON.parse(DumpOutput(1))[0])
                this.Lines=this.Lines.Next().WithValue(new Line(this.Current,this.CurrentOutput))
            }
        }
        GetLine(){
            return new Line(this.Current,this.CurrentOutput)
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
            App.History=new History(size)
            App.Engine.BindEventHandler(function(event){
                App.History.OnEvent(event)
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