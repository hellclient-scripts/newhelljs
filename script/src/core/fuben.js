//副本基础模块
(function (App) {
    let line = App.Include("helllibjs/lib/line/line.js")

    App.Core.Fuben = {}
    //最后一次副本的事件
    App.Core.Fuben.Last = 0
    //当前副本
    App.Core.Fuben.Current = null
    App.Core.Fuben.CurrentRooms = []
    App.Core.Fuben.Loading = null
    //创建新的副本地图
    App.Core.Fuben.NewMaze = (maze) => {
        if (App.Core.Fuben.Current) {
            App.Core.Fuben.Current.Destory()
        }
        App.Core.Fuben.Current = maze != null ? maze : new Maze()

    }
    App.Core.Fuben.InFuben = (move, map) => {
        move.Data.InFuben = true
        move.Option.Fly = false
    }
    App.Core.Fuben.OnInitTags = (map) => {
        if (!((App.Map.Room.ID || "").startsWith(`mazemap-`))) {
            if (!map.Move || !map.Move.Data.InFuben) {
                return
            }
        }
        if (App.Core.Fuben.Current) {
            App.Core.Fuben.Current.Paths.forEach((p) => {
                map.AddTemporaryPath(p)
            })
            map.AddTemporaryRooms(App.Core.Fuben.CurrentRooms)
        }
    }
    App.Map.AppendInitiator(App.Core.Fuben.OnInitTags)
    //副本迷宫解析类
    class Maze {
        Prefix = "mazemap"
        Rooms = []
        Paths = []
        Landmark = {}
        GetRoomID(x, y) {
            return `${this.Prefix}-${x}-${y}`
        }
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
            let path = App.Mapper.HMM.Path.New()
            path.From = from
            path.To = to
            path.Command = command
            this.Paths.push(path)
        }
        Install() {
            App.Core.Fuben.CurrentRooms = []
            this.Rooms.forEach((room) => {
                App.Core.Fuben.CurrentRooms.push(
                    App.Mapper.NewRoom(room, "")
                )
            })
        }
        Destory() {

        }
    }

    let matcherLine = /^([◎─ ●│ ]+)$/
    // let matcherMigong = /^([ 　─│└┴┘★├┼┤┬┴]+)$/
    let matcherMigong = /^([ 　★├┼┤┬┴─│]+)$/


    //处理副本地图的计划
    let PlanMazeMap = new App.Plan(
        App.Positions["Response"],
        (task) => {
            App.Core.Fuben.Loading = new Maze()
            let y = 0
            let linenum = 0
            // App.Core.Fuben.NewMaze()
            // task.AddTrigger(matcherLine, (tri, result) => {
            //     task.Data = "ok"
            //     let data = result[0]
            //     data = data.replaceAll("  ", "　")
            //     if (linenum % 2 == 0) {
            //         let x = 0
            //         for (var i = 0; i < data.length; i = i + 2) {
            //             let room = App.Core.Fuben.Current.AddRoom(x, y)
            //             if (data[i] == "●") {
            //                 let newline = new line.Line()
            //                 App.History.CurrentOutput.Words.forEach((w) => {
            //                     newline.AppendWord(w.CopyStyle(w.Text.replaceAll("  ", "　")))
            //                 })
            //                 let l = newline.Slice(i, 1)
            //                 switch (l.Words[0].Color) {
            //                     case "Green":
            //                         App.Core.Fuben.Current.Landmark["entry"] = room
            //                         break
            //                     case "Magenta":
            //                         App.Core.Fuben.Current.Landmark["exit"] = room
            //                         break
            //                 }
            //             }
            //             if (i > 0 && data[i - 1] == "─") {
            //                 App.Core.Fuben.Current.AddRoomPath(x - 1, y, x, y, "e", "w")
            //             }
            //             x++
            //         }
            //         y++
            //     } else {
            //         let x = 0
            //         for (var i = 0; i < data.length; i = i + 2) {
            //             if (data[i] == "│") {
            //                 App.Core.Fuben.Current.AddRoomPath(x, y - 1, x, y, "s", "n")
            //             }
            //             x++
            //         }
            //     }
            //     linenum++
            //     return true
            // })
            task.AddTrigger(matcherMigong, (tri, result) => {
                task.Data = "ok"
                let data = result[0]
                data = data.replaceAll("  ", "　")
                if (linenum % 2 == 0) {
                    let x = 0
                    let pos = data.indexOf("★")
                    if (pos >= 0) {
                        App.Core.Fuben.Loading.Landmark["current"] = App.Core.Fuben.Loading.GetRoomID(((pos - 1) / 2), y)
                    }
                    App.History.CurrentOutput.Words.forEach((w) => {
                        switch (w.Background) {
                            case "White":
                                App.Core.Fuben.Loading.Landmark["entry"] = App.Core.Fuben.Loading.GetRoomID(((x - 1) / 2), y)
                                break
                            case "Red":
                                App.Core.Fuben.Loading.Landmark["exit"] = App.Core.Fuben.Loading.GetRoomID(((x - 1) / 2), y)
                                break
                        }
                        x += w.Text.replaceAll("  ", "　").length
                    })
                    x = 0
                    for (var i = 1; i < data.length; i = i + 2) {
                        App.Core.Fuben.Loading.AddRoom(x, y)
                        if (i > 0 && data[i - 1] == "　") {
                            App.Core.Fuben.Loading.AddRoomPath(x - 1, y, x, y, "e", "w")
                        }
                        x++
                    }
                    y++
                } else {
                    let x = 0
                    for (var i = 1; i < data.length; i = i + 2) {
                        if (data[i] == "　") {
                            App.Core.Fuben.Loading.AddRoomPath(x, y - 1, x, y, "s", "n")
                        }
                        x++
                    }
                }

                linenum++
                return true
            })

            task.AddTrigger("系统气喘嘘地叹道：慢慢来 ....", (tri, result) => {
                task.Data = "retry"
                return true
            })
            App.Send("yun regenerate;mazemap")
            App.Sync()
        },
        (result) => {
            switch (result.Task.Data) {
                case "retry":
                    Note("等待重试")
                    App.Insert(
                        App.Commands.NewWaitCommand("5000"),
                        $.Nobusy(),
                        App.Commands.NewPlanCommand(PlanMazeMap),
                    )
                    App.Next()
                    return
                case "ok":
                    App.Next()
                    return
            }
            App.Core.Fuben.Loading = null
        }
    )
    //加载副本地图
    App.Core.Fuben.LoadMazeMap = () => {
        App.Commands.PushCommands(
            $.Nobusy(),
            App.Commands.NewPlanCommand(PlanMazeMap),
            $.Function(() => {
                if (App.Core.Fuben.Loading != null) {
                    App.Core.Fuben.NewMaze(App.Core.Fuben.Loading)
                    App.Core.Fuben.Current.Install()
                } else {
                    App.Core.Fuben.Current = null
                }
                App.Next()
            })
        )
        App.Next()
    }
    App.Core.Fuben.Locate = () => {
        App.Commands.PushCommands(
            $.Nobusy(),
            App.Commands.NewPlanCommand(PlanMazeMap),
            $.Function(() => {
                if (App.Core.Fuben.Loading != null) {
                    App.Map.Room.ID = App.Core.Fuben.Loading.Landmark["current"] || ""
                    Note(`当前房间${App.Map.Room.ID}`)
                } else {
                    Note(`无法发现当前房间`)
                }
                App.Next()
            })
        )
        App.Next()
    }
    App.Core.Fuben.To = (x, y) => {
        $.PushCommands(
            $.Function(() => {
                App.Core.Fuben.LoadMazeMap()
            }),
            $.Sync(),
            $.Function(() => {
                App.Map.Room.ID = App.Core.Fuben.Current.Landmark["current"]
                $.Insert(
                    $.To(App.Core.Fuben.Current.GetRoomID(x, y), App.Map.SingleStep(), App.Core.Fuben.InFuben),
                )
                $.Next()
            })
        )
        $.Next()
    }
    App.Core.Fuben.NoteRoomID = function (move, map) {
        move.OnArrive = function (move, map) {
            Note(App.Map.Room.ID)
            move.Walk(map)
        }
    }
    App.Core.Fuben.WalkAll = () => {
        var current = ""
        $.PushCommands(
            $.Function(() => {
                App.Core.Fuben.LoadMazeMap()
            }),
            $.Sync(),
            $.Function(() => {
                App.Map.Room.ID = App.Core.Fuben.Current.Landmark["current"]
                let current = App.Map.Room.ID
                $.Insert(
                    $.Rooms(App.Core.Fuben.Current.Rooms, App.Map.SingleStep(), App.Core.Fuben.NoteRoomID, App.Core.Fuben.InFuben),
                    $.To(current)
                )
                $.Next()
            })
        )
        $.Next()
    }
    App.Core.Fuben.AliasTo = function (n, l, w) {
        App.Core.Fuben.To(w["0"], w["1"])
    }
    App.BindEvent("core.fubenrandom", function (event) {
        let snap = App.Map.Snap()
        if (snap) {
            $.Insert(
                $.Sync(),
                $.Function(App.Core.Fuben.Locate),
                $.Function(() => {
                    Note("恢复移动")
                    App.Map.Rollback(snap)
                    App.Map.InitTags()
                    App.Map.Retry()
                })
            )
            App.Next()
        }
    })
})(App)