(function (App) {
    let module = {}
    module.CheckRoomCmd = "l"
    let dfsModule = App.RequireModule("helllibjs/map/dfs.js")
    class Locate {
        DFS = null
        OnFound(move, map) {
            if (map.Room.ID) {
                if (this.DFS) {
                    this.DFS = null
                    App.RaiseEvent(new App.Event("lib.map.roomfound", move))
                }
            }
        }
        OnStepTimeout(move, map) {
            if (this.DFS != null) {
                let level=this.DFS.Skip()
                if (level == null) {
                    map.CancelMove()
                    return
                }
                this.DFS = level.Next()
                move.Pending = [map.NewStep(this.DFS.Command)]
                move.Walk(map)
            }
        }
        Next(move, map) {
            if (this.DFS == null) {
                this.DFS = new dfsModule.DFS().New()
                App.RaiseEvent(new App.Event("lib.map.roommiss", move))
                return [map.NewStep(module.CheckRoomCmd)]
            }
            this.DFS = this.DFS.Arrive(map.Room.Exits).Next()
            if (this.DFS == null) {
                return []
            }
            return [map.NewStep(this.DFS.Command)]
        }
    }
    class Path {
        constructor(path) {
            this.Raw = path
        }
        Raw = null
        Path = null
        Retry(move, map) {
            this.Path = []
        }
        Next(move, map) {
            if (move.StartCommand) {
                move.StartCommand = ""
                return [move.StartCommand]
            }
            if (this.Path.length) {
                return this.Path.shift()
            }
            return null
        }
        ApplyTo(move, map) {
            this.Path = module.MutlipleStepConverter.Convert(this.Raw, move, map)
            move.Retry = this.Retry.bind(this)
            move.Next = this.Next.bind(this)
            move.Data.Movement = this
        }
    }
    class To {
        constructor(target) {
            if (target == null) {
                this.Target = []
            } else if (typeof (target) != 'object') {
                this.Target = [target + ""]
            } else {
                this.Target = target
            }
        }
        Target = null
        Locate = new Locate()
        Path = null
        OnStepTimeout(move, map) {
            this.Locate.OnStepTimeout(move, map)
        }
        Retry(move, map) {
            this.Path = null
            this.Locate.DFS=null
        }
        Next(move, map) {
            if (this.Path != null) {
                if (move.StartCommand) {
                    move.StartCommand = ""
                    return [move.StartCommand]
                }
                return this.Path.shift()
            }
            if (map.Room.ID) {
                this.Locate.OnFound(move, map)
                let result = move.GetPath(map,map.Room.ID,this.Target)
                this.Path = result == null ? [] : module.MutlipleStepConverter.Convert(result, move, map)
                return this.Next(move, map)
            }
            return this.Locate.Next(move, map)
        }
        OnStepTimeout(move, map){
            if (this.Locate){
                this.Locate.OnStepTimeout(move,map)
            }
        }
        ApplyTo(move, map) {
            move.Retry = this.Retry.bind(this)
            move.Next = this.Next.bind(this)
            move.OnStepTimeout = this.OnStepTimeout.bind(this)
            move.Data.Movement = this
        }
    }
    class Rooms {
        constructor(rooms) {
            if (typeof (rooms) != 'object') {
                rooms = [rooms + ""]
            }
            this.Raw = rooms
        }
        Raw = []
        Rooms = {}
        Locate = new Locate()
        Path = null
        Retry(move, map) {
            this.Path = null
            this.Locate.DFS=null
        }
        OnStepTimeout(move, map){
            if (this.Locate){
                this.Locate.OnStepTimeout(move,map)
            }
        }
        Next(move, map) {
            if (this.Path != null && this.Path.length) {
                return this.Path.shift()
            }
            if (map.Room.ID) {
                this.Locate.OnFound(move, map)
                if (this.Rooms[map.Room.ID] && move.StartCommand) {
                    move.StartCommand = ""
                    return [move.StartCommand]
                }
                delete (this.Rooms[map.Room.ID])
                let keys = Object.keys(this.Rooms)
                if (keys.length == 0) {
                    return null
                }
                let result = move.GetPath(map,map.Room.ID,keys[0])
                this.Path = result == null ? [] : module.MutlipleStepConverter.Convert(result, move, map)
                return this.Next(move, map)
            }
            return this.Locate.Next(move, map)
        }
        ApplyTo(move, map) {
            this.Raw.forEach(roomid => {
                this.Rooms[roomid + ""] = true
            })
            move.Retry = this.Retry.bind(this)
            move.Next = this.Next.bind(this)
            move.OnStepTimeout = this.OnStepTimeout.bind(this)
            move.Data.Movement = this
        }
    }
    module.Path = Path
    module.To = To
    module.Rooms = Rooms
    module.MaxStep = 5
    module.Locate=Locate
    let DefaultChecker = function (step, move, map) {
        return dfsModule.Backward[step.Command] != null
    }
    class MutlipleStepConverter {
        constructor() { }
        Checker = DefaultChecker
        Convert(path, move, map) {
            let result = []
            let current = []
            path.forEach(step => {
                if (!move.Option.MutlipleStep) {
                    result.push([step])
                    return
                }
                if (this.Checker(step, move, map)) {
                    current.push(step)
                    if (current.length >= module.MaxStep) {
                        result.push(current)
                        current = []
                    }
                } else {
                    if (current.length) {
                        result.push(current)
                    }
                    result.push([step])
                    current = []
                }
            });
            if (current.length) {
                result.push(current)
            }
            return result
        }
    }
    module.SingleStep = function (move, map) {
        move.Option.MutlipleStep = false
    }
    module.StartCommand = function (cmd) {
        return function (move, map) {
            move.StartCommand = cmd
        }
    }
    module.MutlipleStepConverter = new MutlipleStepConverter()
    return module
})