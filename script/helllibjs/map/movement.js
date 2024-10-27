(function (App) {
    let cancelMove = (map) => { map.CancelMove() }
    let module = {}
    module.CheckRoomCmd = "l"
    module.Filter = (steps, filter) => {
        let result = []
        let dup = {}
        filter.forEach(e => { dup[e] = true })
        steps.forEach(step => {
            if (step.Target && dup[step.Target]) {
                result.push(step.Target)
            }
        })
        return result
    }
    module.FilterRooms = (steps, filter) => {
        let result = {}
        steps.forEach(step => {
            if (step.Target && filter[step.Target]) {
                result[step.Target] = true
            }
        })
        return result
    }
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
                let level = this.DFS.Skip()
                if (level == null) {
                    map.CancelMove()
                    return false
                }
                this.DFS = level.Next()
                move.Pending = [map.NewStep(this.DFS.Command)]
                move.Walk(map)
                return false
            }
            return true
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
            this.Path = null
        }
        Next(move, map) {
            if (move.StartCommand) {
                move.StartCommand = ""
                return [move.StartCommand]
            }
            if (this.Path == null) {
                return cancelMove
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
            return this.Locate.OnStepTimeout(move, map)
        }
        Retry(move, map) {
            this.Path = null
            this.Locate.DFS = null
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
                let result = move.GetPath(map, map.Room.ID, this.Target)
                if (result == null) {
                    return cancelMove
                }
                this.Path = module.MutlipleStepConverter.Convert(result, move, map)
                return this.Next(move, map)
            }
            return this.Locate.Next(move, map)
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
            this.Locate.DFS = null
        }
        OnStepTimeout(move, map) {
            if (this.Locate) {
                return this.Locate.OnStepTimeout(move, map)
            }
            return true
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
                keys.unshift(map.Room.ID)
                let result = move.WalkAll(map, keys)
                let rooms = []
                result.forEach(step => {
                    if (step.Target) {
                        rooms.push(step.Target)
                    }
                })
                this.Path = result == null ? [[]] : module.MutlipleStepConverter.Convert(result, move, map)
                this.Rooms = module.FilterRooms(result, this.Rooms)
                return this.Next(move, map)
            }
            return this.Locate.Next(move, map)
        }
        OnStepFinsih(move, map, step) {
            if (map.Room.ID) {
                delete (this.Rooms[map.Room.ID])
            }
        }
        ApplyTo(move, map) {
            this.Raw.forEach(roomid => {
                this.Rooms[roomid + ""] = true
            })
            move.Retry = this.Retry.bind(this)
            move.Next = this.Next.bind(this)
            move.OnStepTimeout = this.OnStepTimeout.bind(this)
            move.OnStepFinsih = this.OnStepFinsih.bind(this)
            move.Data.Movement = this
        }
    }
    class Ordered {
        constructor(rooms) {
            if (typeof (rooms) != 'object') {
                rooms = [rooms + ""]
            }
            this.Raw = rooms
            this.Rooms = [...rooms]
        }
        Raw = []
        Rooms = []
        Locate = new Locate()
        Path = null
        Retry(move, map) {
            this.Path = null
            this.Locate.DFS = null
        }
        OnStepTimeout(move, map) {
            if (this.Locate) {
                return this.Locate.OnStepTimeout(move, map)
            }
            return true
        }
        Next(move, map) {
            if (this.Path != null && this.Path.length) {
                return this.Path.shift()
            }
            if (map.Room.ID) {
                this.Locate.OnFound(move, map)
                if (move.StartCommand) {
                    move.StartCommand = ""
                    return [move.StartCommand]
                }
                if (this.Rooms.length == 0) {
                    return null
                }
                let result = move.GetWalkOrdered(map, map.Room.ID, this.Rooms)
                if (result == null) {
                    return null
                }
                this.Rooms = module.Filter(result, this.Rooms)
                this.Path = module.MutlipleStepConverter.Convert(result, move, map)
                return this.Next(move, map)
            }
            return this.Locate.Next(move, map)
        }
        OnStepFinsih(move, map, step) {
            if (map.Room.ID && this.Rooms.length) {
                if (map.Room.ID == this.Rooms[0]) {
                    this.Rooms.shift()
                }
            }
        }
        ApplyTo(move, map) {
            move.Retry = this.Retry.bind(this)
            move.Next = this.Next.bind(this)
            move.OnStepTimeout = this.OnStepTimeout.bind(this)
            move.OnStepFinsih = this.OnStepFinsih.bind(this)
            move.Data.Movement = this
        }
    }

    module.Path = Path
    module.To = To
    module.Rooms = Rooms
    module.Ordered = Ordered
    module.MaxStep = 5
    module.Locate = Locate
    let DefaultChecker = function (step, index, move, map) {
        return dfsModule.Backward[step.Command] != null
    }
    class MutlipleStepConverter {
        constructor() { }
        Checker = DefaultChecker
        Convert(path, move, map) {
            let result = []
            let current = []
            path.forEach((step, index) => {
                if (!move.Option.MutlipleStep) {
                    result.push([step])
                    return
                }
                if (this.Checker(step, index, move, map)) {
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