var onOpen = function () {

}

var onClose = function () {

}

var onConnected = function () {
    App.RaiseEvent(new App.Event("connected").WithType("system"))
}

var onDisconnected = function () {
    App.RaiseEvent(new App.Event("disconnected").WithType("system"))
}

var onAssist = function () {
    App.RaiseEvent(new App.Event("assist").WithType("system"))
}
var onHudClick=function(){
    App.RaiseEvent(new App.Event("hudclick").WithType("system"))
}
var onBroadcast = function (msg, global, channel) {
    App.Core.HelpFind.onBroadcast(msg, global)
}

var onResponse = function (type, id, data) {

}
var onkeyup = function (key) {

}
var onFocus = function () {
    App.RaiseEvent(new App.Event("onfocus").WithType("system"))
}
NoteJSON = function (data) {
    print(JSON.stringify(data, null, 2))
}
Dump = function (data) {
    NoteJSON(data)
}
var onTime = function () {
    App.Engine.OnTime()
}
Metronome.Discard(true)
var App = eval(world.ReadFile("helllibjs/app.js"), "helllibjs/app.js").CreateAppliction()
AddTimer("enginetimer", 0, 0, 0.1, "", 1 + 32 + 16384, "onTime")
App.Include("src/index.js")