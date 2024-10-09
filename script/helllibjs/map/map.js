(function (app) {
    let movementModule = app.RequireModule("helllibjs/map/movement.js")
    let module = {}
    module.DefaultStepTimeout = 3000
    class Room {
        ID = ""
        Name = ""
        #nameRaw = null
        Zone = ""
        Exits = []
        Data = {}
        WithName(name) {
            this.Name = name
            return this
        }
        WithZone(zone) {
            this.Zone = zone
            return this
        }
        WithExits(exits) {
            this.Exits = exits
            return this
        }
        WithNameRaw(raw) {
            this.#nameRaw = raw
            return this
        }
        GetNameRaw() {
            return this.#nameRaw
        }
        WithData(name, value) {
            this.Data[name] = value
            return this
        }
        WithID(id) {
            this.ID = id
            return this
        }
    }
    let DefaultCheckEnterMaze = function (map, move, step) {
            let maze = map.Mazes[map.Room.Name]
            if (maze && maze.CheckEnter(maze, move, this, step)) {
                return maze
            }
        return null
    }
    class Map {
        constructor(position) {
            this.Position = position
            this.Movement = movementModule
            this.StepTimeout = module.DefaultStepTimeout
        }
        CheckEnterMaze=DefaultCheckEnterMaze
        Position = null
        Room = new Room()
        Move = null
        #tags = {}
        Data = {}
        Movement = null
        StepPlan = null
        StepTimeout = 0
        Mazes = {}
        EnterNewRoom() {
            this.Room = new Room()
            this.Position.StartNewTerm()
            return this.Room
        }
        FlashTags() {
            this.#tags = {}
        }
        SetTag(name, value, force) {
            let old = this.#tags[name]
            if (old == null || force) {
                this.#tags[name] = value
            }
        }
        InitTags() {
            this.FlashTags()
            if (this.Move != null) {
                this.Move.InitTags(this)
            }
            app.RaiseEvent(new app.Event("lib.map.inittags", this))
        }
        GetPath(from, fly, to, options) {
            if (typeof (to) != "object") {
                to = [to]
            }
            let result = Mapper.GetPath(from, fly, to, options)
            if (result == null) {
                return null
            }
            let path = []
            result.forEach(step => {
                path.push(new Step(step.command, step.to))
            })
            return path
        }
        OnWalking() {
            if (this.Move != null) {
                this.Move.OnWalking(this)
            }
        }
        TrySteps(steps) {
            if (this.Move != null) {
                this.Move.TrySteps(this, steps)
            }
        }
        OnStepTimeout() {
            if (this.Move != null) {
                this.Move.StepTimeout(this)
            }

        }
        FinishMove() {
            if (this.Move != null) {
                let move = this.Move
                this.Move = null
                move.OnFinish(this.Move, this)
            }
        }
        CancelMove() {
            if (this.Move != null) {
                let move = this.Move
                this.Move = null
                move.OnCancel(this.Move, this)
            }
        }
        StartMove(move) {
            this.Move = move
            move.Walk(this)
        }
        NewRoute(...initers) {
            return new Route(this, ...initers)
        }
        NewStep(command, target) {
            return new Step(command, target)
        }
        NewMaze() {
            return new Maze()
        }
        RegisterMaze(name, maze) {
            this.Mazes[name] = maze
        }
    }
    class Step {
        constructor(command, target) {
            this.Command = command
            this.Target = target
        }
        Command = null
        Target = null
    }
    module.DefaultOnFinish = function (move, map) {

    }
    module.DefaultOnCancel = function (move, map) {

    }
    let DefaultMoveRetry = function (move, map) {
    }
    let DefaultMoveNext = function (move, map) {
        return []
    }
    let DefaultMoveOnRoom = function (move, map, step) {

    }
    let DefaultMoveOnArrive = function (move, map) {
        move.Walk(map)
    }

    let DefaultOnInitTags = function (move, map) {

    }
    let DefaultOnStepTimeout = function (move, map) {
    }
    class Move {
        StartCommand = ""
        Data = {}
        Retry = DefaultMoveRetry
        Next = DefaultMoveNext
        OnRoom = DefaultMoveOnRoom
        OnArrive = DefaultMoveOnArrive
        Vehicle = DefaultVehicle
        OnFinish = module.DefaultOnFinish
        OnCancel = module.DefaultOnCancel
        OnInitTags = DefaultOnInitTags
        OnStepTimeout = DefaultOnStepTimeout
        Option = new Option()
        #walking = []
        Pending = null
        #maze = null
        Walk(map) {
            let steps
            if (this.#maze && this.#maze.CheckEscaped(this.#maze, this, map)) {
                this.#maze = null
            }
            if (this.Pending && this.Pending.length) {
                steps = this.Pending
                this.Pending = null
            } else if (this.#maze) {
                this.#maze.Walk(this.#maze, this, map)
                return
            } else {
                steps = this.Next(this, map)
            }
            if (steps == null || steps.length == 0) {
                map.FinishMove()
                return
            }
            if (steps.length == 1 && this.#maze == null && map.Room.ID) {
                let maze = map.CheckEnterMaze(map, this, steps[0])
                if (maze != null) {
                    this.#maze = maze
                    maze.NextRoom = steps[0].Next
                    maze.Walk(maze, this, map)
                    return
                }
            }
            this.TrySteps(map, steps)
        }
        StepTimeout(map) {
            this.OnStepTimeout(this, map)
        }
        OnWalking(map) {
            if (this.#walking.length == 0) {
                this.OnArrive(this, map, step)
                return
            }
            let step = this.#walking.shift()
            if (step.Target) {
                map.Room.ID = step.Target
            }
            this.OnRoom(this, map, step)
            if (this.#walking.length == 0) {
                this.OnArrive(this, map, step)
                return
            }
            if (map.StepPlan) {
                map.StepPlan.Execute()
            }
        }
        TrySteps(map, steps) {
            this.#walking = steps
            this.Resend(map)
        }
        Resend(map) {
            if (this.#walking && this.#walking.length) {
                this.#walking.forEach(step => {
                    this.Vehicle.Send(step, map)
                });
                if (map.StepPlan) {
                    map.StepPlan.Execute()
                }
            }
        }
        InitTags(map) {
            if (this.Option != null) {
                this.Option.Tags.forEach((value, key) => {
                    if (value != null) {
                        map.SetTag(key, value)
                    }
                })
                this.Vehicle.OnInitTags(this, map)
                this.OnInitTags(this, map)
            }
        }
    }
    let DefaultVehicleSend = function (step, map) {
        app.Send(step.Command, true)
    }
    class Vehicle {
        Send = DefaultVehicleSend
        OnInitTags = DefaultOnInitTags
    }
    let DefaultVehicle = new Vehicle()
    module.MutlipleStep = true
    module.Fly = true
    module.MutlipleStepSplit = function (paths) {
        return paths
    }
    class Option {
        constructor() {
            this.MutlipleStep = module.MutlipleStep
            this.Fly = module.Fly
        }
        MutlipleStep = false
        Fly = false
        Tags = {}
        MapperOptions = null
        ApplyTo(move, map) {
            move.Option = this
        }

    }
    class Route {
        constructor(map, ...initers) {
            this.Map = map
            this.Initers = initers
        }
        Map = null
        Initers = []
        Execute() {
            let move = new Move()
            this.Initers.forEach(initer => {
                if (typeof (initer) == "function") {
                    initer(move, this.Map)
                } else {
                    initer.ApplyTo(move, this.Map)
                }

            })
            this.Map.StartMove(move)
        }
    }
    let DefaultMazeCheckEnter = function (maze, move, map, steps) {
        return false
    }
    let DefaultMazeEscaped = function (maze, move, map) {
        return true
    }
    let DefaultMazeWalk = function (maze, move, map) {
        return
    }
    class Maze {
        Data = null
        CheckEnter = DefaultMazeCheckEnter
        CheckEscaped = DefaultMazeEscaped
        Walk = DefaultMazeWalk
        NextRoom = ""
        WithCheckEnter(fn) {
            this.CheckEnter = fn
            return this
        }
        WithCheckEscaped(fn) {
            this.CheckEscaped = fn
            return this
        }
        WithWalk(fn) {
            this.Walk = fn
            return this
        }
    }
    module.Map = Map
    module.Room = Room
    module.Vehicle = Vehicle
    module.Move = Move
    module.Step = Step
    module.Option = Option
    return module
})