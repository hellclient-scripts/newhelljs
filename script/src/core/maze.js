(function (App) {
    App.Map.RegisterMaze("南疆沙漠",App.Map.NewMaze().WithCheckEnter(
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
            App.Eat(true)
            map.TrySteps([maze.Data])
        }
    ))
})(App)