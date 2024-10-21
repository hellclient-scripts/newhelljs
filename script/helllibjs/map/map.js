(function (App) {
    let movementModule = App.RequireModule("helllibjs/map/movement.js")
    let module = {}
    module.DefaultStepTimeout = 3000
    module.DefaultResendDelay = 500
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
    let DefaultTrace = function (map, fr, cmd) {
        if (fr != "") {
            let exits = Mapper.getexits(fr + "")
            for (var i = 0; i < exits.length; i++) {
                if (exits[i].command == cmd) {
                    return exits[i].to
                }
            }
        }
        return ""
    }
    class Snap {
        Move = null
        Term = null
    }
    class Map {
        constructor(position, moveposition) {
            this.Position = position
            this.MovePosition = moveposition
            this.Movement = movementModule
            this.StepTimeout = module.DefaultStepTimeout
            this.ResendDelay = module.DefaultResendDelay
        }
        CheckEnterMaze = DefaultCheckEnterMaze
        Position = null
        Room = new Room()
        #tagsIniter = []
        Move = null
        #tags = {}
        #blocked = []
        #temporaryPaths = []
        Data = {}
        Movement = null
        StepPlan = null
        StepTimeout = 0
        ResendDelay = 0
        Mazes = {}
        Trace = DefaultTrace
        AppendTagsIniter(fn) {
            this.#tagsIniter.push(fn)
        }
        TracePath(fr, ...commands) {
            let result = []
            if (!fr) {
                return null
            }
            let current = fr
            for (let cmd of commands) {
                let to = this.Trace(this, current, cmd)
                if (!to) {
                    PrintSystem("路径解析错误")
                    return null
                }
                result.push(new Step(cmd, to))
                current = to
            }
            return result
        }
        TraceRooms(fr, ...commands) {
            let result = [fr]
            let current = fr
            for (let cmd of commands) {
                let to = this.Trace(this, current, cmd)
                if (!to) {
                    PrintSystem("路径解析错误")
                    return null
                }
                result.push(to)
                current = to
            }
            return result
        }
        EnterNewRoom() {
            this.Room = new Room()
            this.Position.StartNewTerm()
            return this.Room
        }
        FlashTags() {
            this.#tags = {}
            Mapper.flashtags()
            Mapper.ResetTemporary()
            this.#blocked = []
            this.#temporaryPaths=[]
        }
        AddTemporaryPath(from, path) {
            this.#temporaryPaths.push({ From: from, Path: path })
        }
        BlockPath(from, to) {
            this.#blocked.push([from, to])
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
            this.#tagsIniter.forEach(fn => {
                fn(this)
            })
            for (var key in this.#tags) {
                if (this.#tags[key]) {
                    Mapper.settag(key, true)
                }
            }
            this.#temporaryPaths.forEach(tp => {
                Mapper.AddTemporaryPath(tp.from, tp.path)
            })
        }
        UpdateMapperOption(option) {
            if (option.blockedpath == null) {
                option.blockedpath = []
            }
            this.#blocked.forEach(val => {
                option.blockedpath.push(val)
            })
        }
        GetMapperPath(from, fly, to, options) {
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
        GetMapperWalkAll(rooms, fly, distance, options) {
            let result = Mapper.WalkAll(rooms, fly, distance, options)
            if (result == null) {
                return null
            }
            let path = []
            result.steps.forEach(step => {
                path.push(new Step(step.command, step.to))
            })
            return path
        }
        GetMapperWalkOrdered(from, rooms, fly, options) {
            let path = []
            let current = from
            for (var i in rooms) {
                let result = Mapper.GetPath(current, fly, [rooms[i]], options)
                if (result != null) {
                    result.forEach(step => {
                        path.push(new Step(step.command, step.to))
                    })
                    current = rooms[i]
                }
            }
            return path
        }
        OnWalking() {
            if (this.Move != null) {
                this.Move.OnWalking(this)
            }
        }
        Retry() {
            if (this.Move != null) {
                this.Move.Retry(this.Move, this)
                this.Move.Walk(this)
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
        Resend(delay, offset) {
            if (delay == null) {
                delay = this.ResendDelay
            }
            if (delay <= 0) {
                if (this.Move) {
                    this.Move.Resend(this)
                }
                return
            }
            this.Position.Wait(delay, offset, () => {
                if (this.Move) {
                    this.Move.Resend(this)
                }
            })
        }
        FinishMove() {
            if (this.Move != null) {
                let move = this.Move
                this.Move = null
                move.OnFinish(this.Move, this)
                this.MovePosition.StartNewTerm()
            }
        }
        CancelMove() {
            if (this.Move != null) {
                let move = this.Move
                this.Move = null
                move.OnCancel(this.Move, this)
                this.MovePosition.StartNewTerm()
            }
        }
        Snap() {
            if (this.Move != null) {
                let snap = new Snap()
                snap.Move = this.Move
                this.Move = null
                snap.Term = this.MovePosition.Snap()
                return snap
            }
            return null
        }
        Rollback(snap) {
            this.Move = snap.Move
            this.MovePosition.Rollback(snap.Term)
        }
        StartMove(move) {
            this.Move = move
            this.MovePosition.StartNewTerm()
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
    let DefaultMoveOnStepFinish = function (move, map, step) {
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
    let DefaultMapperOptionCreator = function (move, map) {
        return null
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
        OnStepFinsih = DefaultMoveOnStepFinish
        MapperOptionCreator = DefaultMapperOptionCreator
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
        GetPath(map, from, to, skipinit) {
            if (!skipinit) {
                map.InitTags()
            }
            return map.GetMapperPath(from, this.Option.Fly, to, this.GetMapperOptions(map))
        }
        WalkAll(map, rooms, distance, skipinit) {
            if (!skipinit) {
                map.InitTags()
            }
            return map.GetMapperWalkAll(rooms, this.Option.Fly, distance, this.GetMapperOptions(map))
        }
        GetWalkOrdered(map, from, rooms, skipinit) {
            if (!skipinit) {
                map.InitTags()
            }
            return map.GetMapperWalkOrdered(from, rooms, this.Option.Fly, this.GetMapperOptions(map))
        }
        GetMapperOptions(map) {
            let opt = this.MapperOptionCreator(this, map)
            if (opt == null) {
                opt = {}
            }
            map.UpdateMapperOption(opt)
            return opt
        }
        StepTimeout(map) {
            this.OnStepTimeout(this, map)
        }
        OnWalking(map) {
            if (this.#walking.length == 0) {
                this.OnArrive(this, map)
                return
            }
            let step = this.#walking.shift()
            if (step.Target) {
                map.Room.ID = step.Target
            }
            if (this.Maze) {
                this.OnStepFinsih(this.Maze, map, step)
            } else {
                this.OnStepFinsih(this, map, step)
            }
            this.OnRoom(this, map, step)
            if (this.#walking.length == 0) {
                this.OnArrive(this, map)
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
        GetLastStep() {
            if (this.#walking && this.#walking.length) {
                return this.#walking[0]
            }
            return null
        }
        InitTags(map) {
            if (this.Option != null) {
                for (var key in this.Option.Tags) {
                    let value = Option.Tags[key]
                    if (value != null) {
                        map.SetTag(key, value)
                    }
                }
                this.Vehicle.OnInitTags(this, map)
                this.OnInitTags(this, map)
            }
        }
    }
    let DefaultVehicleSend = function (step, map) {
        App.Send(step.Command, true)
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
        OnStepFinsih = DefaultMoveOnStepFinish
        NextRoom = ""
        WithCheckEnter(fn) {
            this.CheckEnter = fn
            return this
        }
        WithCheckEscaped(fn) {
            this.CheckEscaped = fn
            return this
        }
        WithOnStepFinsih(fn) {
            this.OnStepFinsih = fn
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