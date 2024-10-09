(function (app) {
    app.Map.RegisterMaze("南疆沙漠",app.Map.NewMaze().WithCheckEnter(
        function (maze, move, map, step) {
            if (map.Room.Name == "南疆沙漠") {
                maze.Data = step
                return true
            }
            return false
        }
    ).WithCheckEscaped(
        function (maze, move, map) {
            return map.Room.Name != "南疆沙漠"
        }
    ).WithWalk(
        function (maze, move, map) {
            app.Send("drink shui dai")
            map.TrySteps([maze.Data])
        }
    ))
})(App)