(function (App) {
    let line = App.Include("helllibjs/lib/line/line.js")

    App.Core.Fuben = {}
    App.Core.Fuben.Last = 0
    App.Core.Fuben.Current = null
    App.Core.Fuben.NewMaze = () => {
        if (App.Core.Fuben.Current) {
            App.Core.Fuben.Current.Destory()
        }
        App.Core.Fuben.Current = new Maze()

    }
    App.Core.Fuben.OnInitTags = (map) => {
        if (App.Core.Fuben.Current) {
            App.Core.Fuben.Current.Paths.forEach((p) => {
                map.AddTemporaryPath(p.from, p)
            })
        }
    }
    App.Map.AppendTagsIniter(App.Core.Fuben.OnInitTags)
    let matcherLine = /^([◎─ ●│]+)$/
    class Maze {
        Prefix = "mazemap"
        Rooms = []
        Paths = []
        Landmark = {}
        AddRoom(x, y) {
            let room = `${this.Prefix}-${x}-${y}`
            this.Rooms.push(room)
            return room
        }
        AddRoomPath(x, y, x2, y2, to, from) {
            this.AddPath(`${this.Prefix}-${x}-${y}`, `${this.Prefix}-${x2}-${y2}`, to)
            this.AddPath(`${this.Prefix}-${x2}-${y2}`, `${this.Prefix}-${x}-${y}`, from)
        }
        AddPath(from, to, command) {
            let path = Mapper.newpath()
            path.from = from
            path.to = to
            path.command = command
            this.Paths.push(path)
        }
        Install() {
            Mapper.ResetTemporary()
            this.Rooms.forEach((room) => {
                Mapper.SetRoomName(room)
            })
        }
        Destory() {

        }
    }

    let PlanMazeMap = new App.Plan(
        App.Positions["Response"],
        (task) => {
            let y = 0
            let linenum = 0
            App.Core.Fuben.NewMaze()
            task.AddTrigger(matcherLine, (tri, result) => {
                task.Data = "ok"
                let data = result[0]
                data = data.replaceAll("  ", "　")
                if (linenum % 2 == 0) {
                    let x = 0
                    for (var i = 0; i < data.length; i = i + 2) {
                        let room = App.Core.Fuben.Current.AddRoom(x, y)
                        if (data[i] == "●") {
                            let newline = new line.Line()
                            App.History.CurrentOutput.Words.forEach((w) => {
                                newline.AppendWord(w.CopyStyle(w.Text.replaceAll("  ", "　")))
                            })
                            let l = newline.Slice(i, 1)
                            switch (l.Words[0].Color) {
                                case "Green":
                                    App.Core.Fuben.Current.Landmark["entry"] = room
                                    break
                                case "Magenta":
                                    App.Core.Fuben.Current.Landmark["exit"] = room
                                    break
                            }
                        }
                        if (i > 0 && data[i - 1] == "─") {
                            App.Core.Fuben.Current.AddRoomPath(x - 1, y, x, y, "e", "w")
                        }
                        x++
                    }
                    y++
                } else {
                    for (var i = 0; i < data.length; i = i + 2) {
                        let x = 0
                        for (var i = 0; i < data.length; i = i + 2) {
                            if (data[i] == "│") {
                                App.Core.Fuben.Current.AddRoomPath(x, y - 1, x, y, "s", "n")
                            }
                            x++
                        }
                    }
                }
                linenum++
                return true
            })
            task.AddTrigger("系统气喘嘘地叹道：慢慢来 ....", (tri, result) => {
                task.Data = "retry"
                return true
            })
            App.Send("mazemap")
            App.Sync()
        },
        (result) => {
            switch (result.Task.Data) {
                case "retry":
                    Note("等待重试")
                    App.Insert(
                        App.Commands.NewWaitCommand("5000"),
                        $.Function(App.Core.Fuben.LoadMazeMap),
                    )
                    App.Next()
                    return
                case "ok":
                    App.Core.Fuben.Current.Install()
                    App.Next()
                    return
            }
            App.Core.Fuben.Current = null
        }
    )
    App.Core.Fuben.LoadMazeMap = () => {
        App.Commands.PushCommands(
            App.Commands.NewPlanCommand(PlanMazeMap)
        )
        App.Next()
    }
})(App)