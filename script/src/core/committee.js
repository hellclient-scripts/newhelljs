(function (app) {
  let committeeModule = App.RequireModule("helllibjs/committee/committee.js")
  App.Committee = new committeeModule.Committee()
  App.Committee.OnTermStart = function (position) {
    App.RaiseEvent("core.newterm." + position.Name, OnTermStart)
  }
  App.Engine.BindEventHandler(function (event) { App.Committee.OnEvent(event) })
  App.Engine.BindTimeHandler(function () { App.Committee.OnTime() })
  App.Positions["Connect"] = App.Committee.RegisterPosition("Connect")
  App.Committee.EventBus.BindEvent("disconnected", function () { App.Positions["Connect"].StartNewTerm() })
  App.Positions["Quest"] = App.Committee.RegisterPosition("Quest")
  App.Positions["Room"] = App.Committee.RegisterPosition("Room")
  App.Positions["Combat"] = App.Committee.RegisterPosition("Combat")
  App.Positions["Move"] = App.Committee.RegisterPosition("Move")
  App.Positions["Response"] = App.Committee.RegisterPosition("Response")
  App.Committee.EventBus.BindEvent("core.newmove", function () { App.Positions["Move"].StartNewTerm() })
  App.Positions["Command"] = App.Committee.RegisterPosition("Command")
  App.Positions["CommandQueue"] = App.Committee.RegisterPosition("CommandQueue")
  App.Plan = committeeModule.Plan
})(App)