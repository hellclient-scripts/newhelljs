(function (App) {
    let movementModule = App.RequireModule("helllibjs/map/movement.js")
    let hmm = App.Include("helllibjs/lib/hmm/hmm.js")
    let module = {}
    module.DefaultStepTimeout = 3000
    module.DefaultResendDelay = 500
    module.HMM = hmm
    module.Database = new hmm.MapDatabase()
    module.DefaultOnModeChange = (map, oldmode, newmode) => {
    }
    class Room {
        ID = ""
        Name = ""
        #nameRaw = null
        Zone = ""
        Exits = []
        Data = {}
        Keep = false//设为true，不更新room,一般用于look更新当前房间信息
        Keeping = false
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
            return hmm.APITrackExit(fr, cmd, this.Context, hmm.MapperOptions.New())
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
        Context = new hmm.Context()
        CheckEnterMaze = DefaultCheckEnterMaze
        Position = null
        Room = new Room()
        #initiator = []
        Move = null
        #tags = {}
        #blocked = []
        #temporaryPaths = []
        #temporaryRooms = []
        Data = {}
        Movement = null
        StepPlan = null
        StepTimeout = 0
        ResendDelay = 0
        Mode = ""
        ChangeMode(mode) {
            if (mode != this.Mode) {
                let om = this.Mode
                this.Mode = mode
                this.OnModeChange(this, om, mode)
            }
        }
        OnModeChange = module.DefaultOnModeChange
        Mazes = {}
        Trace = DefaultTrace
        AppendInitiator(fn) {
            this.#initiator.push(fn)
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
                    PrintSystem("路径解析错误:" + current + "," + cmd)
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
                    PrintSystem("路径解析错误:" + current + "," + cmd)
                    return null
                }
                result.push(to)
                current = to
            }
            return result
        }
        NewRoom() {
            return new Room()
        }
        EnterNewRoom(room) {
            if (!room) {
                room = new Room()
            }
            let oroom = this.Room
            this.Room = room
            if (oroom.Keep) {
                if (oroom.ID) {
                    this.Room.ID = oroom.ID
                }
                this.Room.Keeping = true
            }
            this.Room.Keep = false
            return this.Room
        }
        FlashTags() {
            this.#tags = {}
            this.Context = hmm.Context.New();
            //Mapper.flashtags()
            //Mapper.ResetTemporary()
            this.#blocked = []
            this.#temporaryPaths = []
            this.#temporaryRooms = []
        }
        AddTemporaryRooms(rooms) {
            this.#temporaryRooms = this.#temporaryRooms.concat(rooms)
        }
        AddTemporaryPath(path) {
            this.#temporaryPaths.push(path)
        }
        BlockPath(from, to) {
            this.#blocked.push([from, to])
        }
        SetTag(name, value, force) {
            let old = this.#tags[name]
            if (value === true || value === null || value === undefined) {
                value = 1
            } else if (value === false) {
                value = 0
            }
            if (old == null || force) {
                this.#tags[name] = value
            }
        }
        InitTags() {
            this.FlashTags()
            if (this.Move != null) {
                this.Move.InitTags(this)
            }
            this.#initiator.forEach(fn => {
                fn(this)
            })
            for (var key in this.#tags) {
                if (this.#tags[key]) {
                    this.Context.WithTags([hmm.ValueTag.New(key, this.#tags[key])])
                }
            }
            this.#blocked.forEach(val => {
                this.Context.WithBlockedLinks([hmm.Link.New(val[0], val[1])])
            })
            this.Context.WithRooms(this.#temporaryRooms)
            this.Context.WithPaths(this.#temporaryPaths)

        }
        UpdateMapperOption(option) {
            if (option.blockedpath == null) {
                option.blockedpath = []
            }
            this.#blocked.forEach(val => {
                option.blockedpath.push(val)
            })
        }
        filterpath(path) {
            let result = []
            path.forEach(step => {
                if (step.Command != "#skip") {
                    result.push(step)
                }
            })
            return result

        }
        GetMapperPath(from, fly, to) {
            if (typeof (to) != "object") {
                to = [to]
            }
            if (to.length == 0) {
                return []
            }
            let result = module.Database.APIQueryPathAny([from], to, this.Context, this.GetMapperOptions(!fly))

            if (result == null) {
                return null
            }
            let path = []
            result.Steps.forEach(step => {
                path.push(new Step(step.Command, step.Target))
            })
            return this.filterpath(path)
        }
        GetMapperWalkAll(rooms, fly, distance) {
            let result = module.Database.APIQueryPathAll(rooms[0], rooms, this.Context, this.GetMapperOptions(!fly).WithMaxTotalCost(distance))
            if (result == null) {
                return null
            }
            let path = []
            result.Steps.forEach(step => {
                path.push(new Step(step.Command, step.Target))
            })
            return this.filterpath(path)

        }
        GetMapperWalkOrdered(from, rooms, fly) {
            let path = []
            let result = module.Database.APIQueryPathOrdered(from, rooms, this.Context, this.GetMapperOptions(!fly))
            if (result == null) {
                return null
            }
            result.Steps.forEach(step => {
                path.push(new Step(step.Command, step.Target))
            })
            return this.filterpath(path)
        }
        OnWalking() {
            if (!this.Room.Keeping) {
                this.Position.StartNewTerm()
            }
            if (this.Move != null) {
                this.Move.OnWalking(this)
            }
        }
        Retry() {
            if (this.Move != null) {
                this.Move.Retry(this.Move, this)
            }
        }
        TrySteps(steps) {
            if (this.Move != null) {
                this.Move.TrySteps(this, steps)
            }
        }
        OnStepTimeout() {
            if (this.Move != null) {
                return this.Move.StepTimeout(this)
            }
            return true
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
        DiscardMove() {
            if (this.Move) {
                this.Move = null
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
            this.ChangeMode("")
            move.Walk(this)
        }
        NewRoute(...initiators) {
            return new Route(this, ...initiators)
        }
        NewStep(command, target) {
            return new Step(command, target)
        }
        NewTag(key, value) {
            return new Tag(key, value)
        }
        NewMaze() {
            return new Maze()
        }
        RegisterMaze(name, maze) {
            this.Mazes[name] = maze
        }
        GetRoomExits(rid, withouttemp = false, withoutfly = false) {
            return module.Database.APIGetRoomExits(rid, !withouttemp ? this.Context : hmm.Context.New(), this.GetMapperOptions(withoutfly))
        }
        GetMapperOptions(withoutfly) {
            return hmm.MapperOptions.New().WithDisableShortcuts(withoutfly)
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
        move.Walk(map)
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
        return true
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
            if (typeof steps == "function") {
                steps(this, map)
                return
            }
            if (steps == null || steps.length == 0) {
                map.FinishMove()
                return
            }
            if (steps.length == 1 && this.#maze == null && map.Room.ID) {
                let maze = map.CheckEnterMaze(map, this, steps[0])
                if (maze != null) {
                    map.ChangeMode("maze")
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
            return this.OnStepTimeout(this, map)
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
                    let value = this.Option.Tags[key]
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
    module.MultipleStep = true
    module.Fly = true
    module.MultipleStepSplit = function (paths) {
        return paths
    }
    class Option {
        constructor() {
            this.MultipleStep = module.MultipleStep
            this.Fly = module.Fly
        }
        MultipleStep = false
        Fly = false
        Tags = {}
        ApplyTo(move, map) {
            move.Option = this
        }

    }
    class Tag {
        constructor(key = "", value = 1) {
            this.Key = key;
            this.Value = value;
        }
        Key = ""
        Value = 1
        ApplyTo(move, map) {
            move.Option.Tags[this.Key] = this.Value
        }

    }
    class Route {
        constructor(map, ...initiators) {
            this.Map = map
            this.Initers = initiators
        }
        Map = null
        Initers = []
        Execute() {
            let move = new Move()
            this.Initers.forEach(initiator => {
                if (typeof (initiator) == "function") {
                    initiator(move, this.Map)
                } else {
                    initiator.ApplyTo(move, this.Map)
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
    module.Tag = Tag
    module.Step = Step
    module.Option = Option
    return module
})