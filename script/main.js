var onOpen=function (){

}

var onClose=function (){

}

var onConnected=function (){
    App.RaiseEvent(new App.Event("connected").WithType("system"))
}

var onDisconnected=function (){
    App.RaiseEvent(new App.Event("disconnected").WithType("system"))
}

var onAssist=function(){

}

var onBroadcast=function(msg,global,channel){
    
}
var onResponse=function(type,id,data){
    
}
var onkeyup=function(key){

}
NoteJSON=function(data){
    print(JSON.stringify(data,null,2))
}
Dump=function(data){
    NoteJSON(data)
}
var onTime=function(){
    App.Engine.OnTime()
}
var App=eval(world.ReadFile("helllibjs/app.js"),"helllibjs/app.js").CreateAppliction()
AddTimer("enginetimer",0,0,0.1,"",1+32+16384,"onTime")
App.Include("src/index.js")