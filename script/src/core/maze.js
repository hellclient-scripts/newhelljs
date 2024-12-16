(function (App) {
    App.Map.RegisterMaze("南疆沙漠", App.Map.NewMaze().WithCheckEnter(
        function (maze, move, map, step) {
            if (map.Room.Name == "南疆沙漠") {
                maze.Data = { Step: step, Count: 0 }
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

            let cmd = App.Move.Filterdir(maze.Data.Step.Command)
            maze.Data.Count = maze.Data.Count + 1
            if (maze.Data.Count % 8 == 0) {
                App.Eat(true)
            }
            if (cmd == "sw") {
                if (maze.Data.Count < 10) {
                    cmd = "sw"
                } else {
                    cmd = "ne"
                }
            }
            map.TrySteps([cmd != maze.Data.Step.Command ? App.Map.NewStep(cmd) : maze.Data.Step])
        }
    ))
    App.Map.RegisterMaze("戈壁滩", App.Map.NewMaze().WithCheckEnter(
        function (maze, move, map, step) {
            if (map.Room.Name == "戈壁滩") {
                maze.Data = { Step: step, Count: 0 }
                return true
            }
            return false
        }
    ).WithCheckEscaped(
        function (maze, move, map) {
            return map.Room.Name != "戈壁滩"
        }
    ).WithWalk(
        function (maze, move, map) {
            let cmd = App.Move.Filterdir(App.Move.Filterdir(maze.Data.Step.Command))
            if (cmd == "e") {
                if (maze.Data.Count < 2) {
                    cmd = "s"
                } else if (maze.Data.Count % 2) {
                    cmd = "e"
                } else {
                    cmd = "s"
                }
            } else if (cmd == "w") {
                if (maze.Data.Count < 2) {
                    cmd = "w"
                } else if (maze.Data.Count % 2) {
                    cmd = "n"
                } else {
                    cmd = "w"
                }
            }
            maze.Data.Count = maze.Data.Count + 1
            map.TrySteps([cmd != maze.Data.Step.Command ? App.Map.NewStep(cmd) : maze.Data.Step])
        }
    ))
    App.Map.RegisterMaze("桃花迷阵", App.Map.NewMaze().WithCheckEnter(
        function (maze, move, map, step) {
            if (map.Room.Name == "桃花迷阵") {
                maze.Data = step
                return true
            }
            return false
        }
    ).WithCheckEscaped(
        function (maze, move, map) {
            return map.Room.Name != "桃花迷阵"
        }
    ).WithWalk(
        function (maze, move, map) {
            App.Eat(true)
            map.TrySteps([App.Map.NewStep(cmd)])
        }
    ))
    App.Map.RegisterMaze("大沙漠", App.Map.NewMaze().WithCheckEnter(
        function (maze, move, map, step) {
            if (map.Room.Name == "大沙漠") {
                maze.Data = { Step: step, Count: 0 }
                return true
            }
            return false
        }
    ).WithCheckEscaped(
        function (maze, move, map) {
            return map.Room.Name != "大沙漠"
        }
    ).WithWalk(
        function (maze, move, map) {
            let cmd = App.Move.Filterdir(maze.Data.Step.Command)
            if (cmd == "w") {
                if (Math.floor(Math.random() * 5) == 1) cmd = "s";
            }
            maze.Data.Count = maze.Data.Count + 1
            if (maze.Data.Count % 5 == 0) {
                App.PushCommands(
                    App.Core.Heal.NewRestCommand(),
                    App.Commands.NewFunctionCommand(() => {
                        App.Eat(true)
                        App.Send("yun recover;yun regenerate;hp")
                        map.TrySteps([cmd != maze.Data.Step.Command ? App.Map.NewStep(cmd) : maze.Data.Step])
                    })
                )
            } else {
                App.PushCommands(
                    App.Commands.NewFunctionCommand(() => {
                        map.TrySteps([cmd != maze.Data.Step.Command ? App.Map.NewStep(cmd) : maze.Data.Step])
                    })
                )
            }
            App.Next()
        }
    ))
})(App)