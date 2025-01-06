// 委员会模块
(function (app) {
  let committeeModule = App.RequireModule("helllibjs/committee/committee.js")
  //委员会实例
  App.Committee = new committeeModule.Committee()
  //委员会事件绑定
  App.Committee.OnTermStart = function (position) {
    App.RaiseEvent("core.newterm." + position.Name, OnTermStart)
  }
  App.Engine.BindEventHandler(function (event) { App.Committee.OnEvent(event) })
  App.Engine.BindTimeHandler(function () { App.Committee.OnTime() })
  //当前连线Position
  App.Positions["Connect"] = App.Committee.RegisterPosition("Connect")
  App.Committee.EventBus.BindEvent("disconnected", function () { App.Positions["Connect"].StartNewTerm() })
  //当前任务Position
  App.Positions["Quest"] = App.Committee.RegisterPosition("Quest")
  //当前房间Position
  App.Positions["Room"] = App.Committee.RegisterPosition("Room")
  //当前战斗Position
  App.Positions["Combat"] = App.Committee.RegisterPosition("Combat")
  //当前移动Position
  App.Positions["Move"] = App.Committee.RegisterPosition("Move")
  App.Committee.EventBus.BindEvent("core.newmove", function () { App.Positions["Move"].StartNewTerm() })
  //当前同步Position
  App.Positions["Response"] = App.Committee.RegisterPosition("Response")
  //当前指令Position
  App.Positions["Command"] = App.Committee.RegisterPosition("Command")
  //当前指令队列Position
  App.Positions["CommandQueue"] = App.Committee.RegisterPosition("CommandQueue")
  //计划的别名
  App.Plan = committeeModule.Plan
})(App)