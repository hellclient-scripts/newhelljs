(function (app) {
    let module = {}
    module.CheckRoomCmd = "l"
    let dfsModule = app.RequireModule("helllibjs/map/dfs.js")
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
            if (move.StartCommand){
                move.StartCommand=""
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
        DFS = null
        Path = null
        Retry(move, map) {
            this.Path = null
        }
        Next(move, map) {
            if (this.Path != null) {
                if (move.StartCommand){
                    move.StartCommand=""
                    return [move.StartCommand]
                }
                return this.Path.shift()
            }
            if (map.Room.ID) {
                if (this.DFS) {
                    this.DFS = null
                    App.RaiseEvent("lib.map.roomfound",move)
                }
                let result = map.GetPath(map.Room.ID, move.Option.Fly, this.Target, move.Option.MapperOptions)
                this.Path = result == null ? [] : module.MutlipleStepConverter.Convert(result, move, map)
                return this.Next(move.map)
            }
            if (this.DFS == null) {
                this.DFS = new dfsModule.DFS().New()
                App.RaiseEvent("lib.map.roommiss",move)
                return [map.NewStep(module.CheckRoomCmd)]
            }
            this.DFS = this.DFS.Arrive(map.Room.Exits).Next()
            if (this.DFS == null) {
                return []
            }
            return [map.NewStep(this.DFS.Command)]
        }
        ApplyTo(move, map) {
            move.Retry = this.Retry.bind(this)
            move.Next = this.Next.bind(this)
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
        DFS = null
        Path = null
        Retry(move, map) {
            this.Path = null
        }
        Next(move, map) {
            if (this.Path != null && this.Path.length) {
                return this.Path.shift()
            }
            if (map.Room.ID) {
                if (this.DFS) {
                    this.DFS = null
                    App.RaiseEvent("lib.map.roomfound",move)
                }
                if (this.Rooms[map.Room.ID]&&move.StartCommand){
                    move.StartCommand=""
                    return [move.StartCommand]
                }
                delete (this.Rooms[map.Room.ID])
                let keys = Object.keys(this.Rooms)
                if (keys.length == 0) {
                    return null
                }
                let result = map.GetPath(map.Room.ID, move.Option.Fly, keys, move.Option.MapperOptions)
                this.Path = result == null ? [] : module.MutlipleStepConverter.Convert(result, move, map)
                return this.Next(move.map)
            }
            if (this.DFS == null) {
                this.DFS = new dfsModule.DFS().New()
                App.RaiseEvent("lib.map.roommiss",move)
                return [map.NewStep(module.CheckRoomCmd)]
            }
            this.DFS = this.DFS.Arrive(map.Room.Exits).Next()
            if (this.DFS == null) {
                return []
            }
            return [map.NewStep(this.DFS.Command)]

        }
        ApplyTo(move, map) {
            this.Raw.forEach(roomid => {
                this.Rooms[roomid + ""] = true
            })
            move.Retry = this.Retry.bind(this)
            move.Next = this.Next.bind(this)
            move.Data.Movement = this
        }
    }
    module.Path = Path
    module.To = To
    module.Rooms = Rooms
    module.MaxStep = 5
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
                    result.push(step)
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
    module.StartCommand=function(cmd){
        return function(move,map){
            move.StartCommand=cmd
        }
    }
    module.MutlipleStepConverter = new MutlipleStepConverter()
    return module
})