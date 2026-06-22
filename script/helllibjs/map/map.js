(function (App) {
    let movementModule = App.RequireModule("helllibjs/map/movement.js")
    let hmm = App.Include("helllibjs/lib/hmm/hmm.js")
    let lru = App.Include("helllibjs/lib/lru/lru.js")
    let module = {}
    module.DefaultStepTimeout = 3000
    module.DefaultResendDelay = 500
    module.HMM = hmm
    module.Database = new hmm.MapDatabase()
    module.DefaultOnModeChange = (map, oldmode, newmode) => {
    }
    module.DefaultOnMoveDiscard = (move, map) => {

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
        LastHistory = []
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
        #Cache = null
        NewCache = (settings) => {
            settings = settings || {}
            const options = {
                max: settings.Max || 1000,
                updateAgeOnGet: true,
                sizeCalculation: (value, key) => {
                    return JSON.stringify(value).length + key.length
                },
                maxSize: settings.MaxSize || 5000,
            }
            return new lru(options)
        }
        WithCache(cache) {
            this.#Cache = cache
        }
        LoadCache(mapperdata) {
            if (this.#Cache) {
                let cachekey = JSON.stringify(mapperdata)
                return this.#Cache.get(cachekey)
            }
            return null
        }
        SetCache(mapperdata, result) {
            if (this.#Cache) {
                let cachekey = JSON.stringify(mapperdata)
                this.#Cache.set(cachekey, result)
            }
        }
        ChangeMode(mode) {
            if (mode != this.Mode) {
                let om = this.Mode
                this.Mode = mode
                this.OnModeChange(this, om, mode)
            }
        }
        OnModeChange = module.DefaultOnModeChange
        OnMoveDiscard = module.DefaultOnMoveDiscard
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
        AddRoomTags(...tags) {
            this.Context.WithRoomTags(...tags)
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
        filterpath(path) {
            let result = []
            path.forEach(step => {
                if (step.Command != "#skip") {
                    result.push(step)
                }
            })
            return result

        }
        GetMapperPath(from, fly, to, options) {
            if (typeof (to) != "object") {
                to = [to]
            }
            if (to.length == 0) {
                return []
            }
            let mapperdata = {
                "From": [from],
                "To": to,
                "Key": "QueryAny",
                "Context": this.Context,
                "Options": this.#GetMapperOptions(!fly, options)
            }
            let result
            let cached = this.LoadCache(mapperdata)
            if (cached) {
                result = cached.Data
            } else {
                result = module.Database.APIQueryPathAny([from], to, this.Context, this.#GetMapperOptions(!fly, options))
                this.SetCache(mapperdata, { Data: result })
            }
            if (result == null) {
                return null
            }
            let path = []
            result.Steps.forEach(step => {
                path.push(new Step(step.Command, step.Target))
            })
            return this.filterpath(path)
        }
        GetNearestRoom(from, fly, to, options) {
            let result = this.GetMapperPath(from, fly, to, options)
            if (result && result.length > 0) {
                return result[result.length - 1].Target
            }
            return null
        }
        Dilate(rooms, expand, context, options) {
            let mapperdata = {
                "Key": "Dilate",
                "Roms": rooms,
                "Expand": expand,
                "Context": context,
                "Options": options
            }
            let result
            let cached = this.LoadCache(mapperdata)
            if (cached) {
                result = cached.Data
            } else {
                result = module.Database.APIDilate(rooms, expand, context, options)
                this.SetCache(mapperdata, { Data: result })
            }
            return result
        }
        GetMapperWalkAll(rooms, fly, distance, options) {
            let mapperdata = {
                "Key": "QueryAll",
                "Rooms": rooms,
                "Context": this.Context,
                "Options": this.#GetMapperOptions(!fly, options).WithMaxTotalCost(distance)
            }
            let result
            let cached = this.LoadCache(mapperdata)
            if (cached) {
                result = cached.Data
            } else {
                result = module.Database.APIQueryPathAll(rooms[0], rooms, this.Context, this.#GetMapperOptions(!fly, options).WithMaxTotalCost(distance))
                this.SetCache(mapperdata, { Data: result })
            }
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
            let mapperdata = {
                "Key": "QueryOrdered",
                "From":from,
                "Rooms":rooms,
                "Context": this.Context,
                "Options": this.#GetMapperOptions(!fly)
            }
            let result
            let cached = this.LoadCache(mapperdata)
            if (cached) {
                result = cached.Data
            } else {
                result = module.Database.APIQueryPathOrdered(from, rooms, this.Context, this.#GetMapperOptions(!fly))
                this.SetCache(mapperdata, { Data: result })
            }
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
        ResetMaze() {
            if (this.Move != null) {
                this.Move.ResetMaze(this.Move, this)
            }
        }
        InMaze() {
            if (this.Move != null) {
                return this.Move.InMaze()
            }
            return false
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
                this.LastHistory = move.History
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
                this.OnMoveDiscard(this.Move, this)
            }
        }
        Snap() {
            if (this.Move != null) {
                let snap = new Snap()
                snap.Move = this.Move
                this.Move = null
                snap.Term = this.MovePosition.Snap()
                this.OnMoveDiscard(this.Move, this)
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
        NewRoomTag(room, key, value) {
            return new RoomTag(room, key, value)
        }
        NewMoveData(name, value) {
            return new MoveData(name, value)
        }
        NewMaze() {
            return new Maze()
        }
        NewMove() {
            return new Move()
        }
        SingleStep() {
            return movementModule.SingleStep
        }
        NoFly() {
            return NoFly
        }
        RegisterMaze(name, maze) {
            this.Mazes[name] = maze
        }
        GetRoomExits(rid, withouttemp = false, withoutfly = false) {
            return module.Database.APIGetRoomExits(rid, !withouttemp ? this.Context : hmm.Context.New(), this.#GetMapperOptions(withoutfly))
        }
        #GetMapperOptions(withoutfly, base) {
            if (base == null) {
                base = hmm.MapperOptions.New()
            }
            return base.WithDisableShortcuts(withoutfly)
        }
    }
    class Step {
        constructor(command, target) {
            this.Command = command
            this.Target = target
        }
        Clone() {
            return new Step(this.Command, this.Target)
        }
        CloneWithCommand(command) {
            return new Step(command, this.Target)
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
    let DefaultMapperOptionsCreator = function (move, map) {
        return null
    }
    class Move {
        StartCommand = ""
        Data = {}
        History = []
        #initiator = []
        AppendInitiator(fn) {
            this.#initiator.push(fn)
        }
        Retry = DefaultMoveRetry
        Next = DefaultMoveNext
        OnRoom = DefaultMoveOnRoom
        OnArrive = DefaultMoveOnArrive
        Vehicle = module.DefaultVehicle
        OnFinish = module.DefaultOnFinish
        OnCancel = module.DefaultOnCancel
        OnInitTags = DefaultOnInitTags
        OnStepTimeout = DefaultOnStepTimeout
        OnStepFinsih = DefaultMoveOnStepFinish
        MapperOptionsCreator = DefaultMapperOptionsCreator
        Option = new Option()
        #walking = []
        Pending = null
        #maze = null
        InMaze() {
            return this.#maze != null
        }
        ResetMaze(map) {
            this.#maze = null
        }
        Walk(map) {
            let steps
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
            let opt = this.MapperOptionsCreator(this, map)
            if (opt == null) {
                opt = hmm.MapperOptions.New()
            }
            this.Option.UpdateMapperOption(this, map, opt)
            return opt
        }
        StepTimeout(map) {
            return this.OnStepTimeout(this, map)
        }
        //移动成功，核销移动，一般在进入新房间后调用
        OnWalking(map) {
            if (this.#maze && this.#maze.CheckEscaped(this.#maze, this, map)) {
                this.#maze = null
            }
            if (this.#walking.length == 0) {
                this.OnArrive(this, map)
                return
            }
            let step = this.#walking.shift()
            if (step.Target && this.#maze == null) {
                //这个必须判断下是否在迷宫，因为迷宫的话可能移动结果还没出去，会造成一步错位
                map.Room.ID = step.Target
            }
            if (this.#maze) {
                map.Room.ID = this.#maze.GetRoomID(this.#maze, this, map) || map.Room.ID
                this.#maze.OnStepFinsih(this, map, step)
            } else {
                this.OnStepFinsih(this, map, step)
            }
            this.OnRoom(this, map, step)
            this.History.push(step)
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
                map.Context.WithRoomTags(this.Option.RoomTags)
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
    //抽象的移动选项
    //在从hellclient的mapper到hmm的mapper迁移时做了封装，所以有有些地方有点别扭
    class Option {
        constructor() {
            this.MultipleStep = module.MultipleStep
            this.Fly = module.Fly
        }
        MultipleStep = false
        Fly = false
        Tags = {}
        RoomTags = []
        CommandWhitelist = []
        CommandNotContains = []
        ApplyTo(move, map) {
            move.Option = this
        }
        UpdateMapperOption(move, map, options) {
            options.CommandWhitelist = this.CommandWhitelist
            options.CommandNotContains = this.CommandNotContains
        }
    }
    var NoFly = (move, map) => {
        move.Option.Fly = false
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
    class RoomTag {
        constructor(room = "", key = "", value = 1) {
            this.Room = room;
            this.Key = key;
            this.Value = value;
        }
        Room = ""
        Key = ""
        Value = 1
        ApplyTo(move, map) {
            move.Option.RoomTags.push(hmm.RoomTag.New(this.Room, this.Key, this.Value))
        }
    }
    class MoveData {
        constructor(name = "", value = null) {
            this.Name = name
            this.Value = value
        }
        Name = ""
        Value = null
        ApplyTo(move, map) {
            move.Data[this.Name] = this.Value
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
    let DefaultMazeGetRoomID = function (maze, move, map) {
        return ""
    }
    let DefaultMazeMoveOnStepFinish = function (move, map, step) {
        move.OnStepFinsih(move, map, step)
        return
    }
    class Maze {
        Data = null
        CheckEnter = DefaultMazeCheckEnter
        CheckEscaped = DefaultMazeEscaped
        GetRoomID = DefaultMazeGetRoomID
        Walk = DefaultMazeWalk
        OnStepFinsih = DefaultMazeMoveOnStepFinish
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
        WithGetRoomID(fn) {
            this.GetRoomID = fn
            return this
        }
    }
    module.Map = Map
    module.Room = Room
    module.Vehicle = Vehicle
    module.Move = Move
    module.Tag = Tag
    module.Step = Step
    module.RoomTag = RoomTag
    moduleMoveData = MoveData
    module.Option = Option
    module.DefaultVehicle = DefaultVehicle
    module.DefaultVehicleSend = DefaultVehicleSend
    return module
})