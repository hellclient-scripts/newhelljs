(function (app) {
    App.Move = {}
    App.Move.NewPath = function (path, ...initers) {
        return App.Map.NewRoute(new App.Map.Movement.Path(path.map(value => App.Map.NewStep(value))), ...initers)
    }
    App.Move.NewTo = function (target, ...initers) {
        return App.Map.NewRoute(new App.Map.Movement.To(target, ...initers))
    }
    App.Move.NewRooms = function (rooms, ...initers) {
        return App.Map.NewRoute(new App.Map.Movement.Rooms(rooms, ...initers))
    }
    App.Map.StepPlan = new App.Plan(
        App.Map.Position,
        function (task) {
            task.NewTimer(App.Map.StepTimeout).WithName("timeout")
            task.NewCatcher("core.wrongway").WithName("wrongway")
            task.NewCatcher("core.walkbusy").WithName("walkbusy")
        },
        function (result) {
            switch (result.Type) {
                case "result":
                    break
                default:
                    switch (result.Name) {
                        case "timeout":
                            App.Map.OnStepTimeout()
                            break
                        case "wrongway":
                            App.Map.OnWrongway()
                            break
                        case "walkbusy":
                            App.Map.Resend()
                            break
                    }
            }
        }
    )
    App.BindEvent("core.roomentry", function (event) {
        event.Context.ProposeLater("", function () {
            App.Map.OnWalking()
        })
    })
})(App)