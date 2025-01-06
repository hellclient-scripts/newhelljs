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
var onHudClick = function () {
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

// 以JSON格式打印内容
NoteJSON = function (data) {
    print(JSON.stringify(data, null, 2))
}
// 用于打印测试，正常需要显示数据时应该使用NoteJSON方法。
// 发布版应该没有使用这个函数的代码
Dump = function (data) {
    NoteJSON(data)
}
// 接管计时器的回调
var onTime = function () {
    App.Engine.OnTime()
}

// 引入helllibjs框架
Metronome.Discard(true)
var App = eval(world.ReadFile("helllibjs/app.js"), "helllibjs/app.js").CreateAppliction()
AddTimer("enginetimer", 0, 0, 0.1, "", 1 + 32 + 16384, "onTime")
// 引入机器人主代码
App.Include("src/index.js")