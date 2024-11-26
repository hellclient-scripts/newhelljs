(function (App) {
    let module = {}
    module.Adjust = -50//timer有最小间隔，避免触发到下一秒
    let eventModule = App.RequireModule("helllibjs/event/event.js")
    class Plan {
        constructor(position, initfn, callback) {
            this.Position = position
            this.InitFunc = initfn
            this.Callback = callback
        }
        Position = null
        InitFunc = null
        Callback = null
        Execute(data) {
            let task = this.Position.AddTask(this.Callback)
            if (this.InitFunc) {
                this.InitFunc(task, this, data)
            }
            return task
        }
    }
    class TaskResult {
        constructor(task, type, name, data) {
            this.Type = type
            this.Task = task
            this.Name = name || ""
            this.Data = data
        }
        Type = ""
        Data = null
        Name = ""
        Task = null
    }
    class Task {
        constructor(callback) {
            this.StartedAt = (new Date()).getTime()
            this.Stack = (new Error()).stack
            this.Callback = callback
        }
        Finished = false
        Stack = ""
        StartedAt = 0
        Data = null
        Callback = null
        #timers = []
        #triggers = []
        #catchers = []
        AddTimer(duration, callback, disabled, norepeat) {
            let timer = new Timer(duration, callback, !disabled, norepeat)
            this.#timers.push(timer)
            return timer
        }
        AddTrigger(matcher, callback, disabled) {
            let trigger = new Trigger(matcher, callback, !disabled)
            this.#triggers.push(trigger)
            return trigger
        }
        AddCatcher(eventname, callback) {
            let catcher = new Catcher(eventname, callback)
            this.#catchers.push(catcher)
            return catcher
        }
        #endWithResult(result) {
            this.Finished = true
            if (this.Callback) {
                this.Callback(result)
            }
        }
        OnTime() {
            if (this.Finished) { return true }
            for (let timer of this.#timers) {
                if (!timer.OnTime()) {
                    this.#endWithResult(new TaskResult(this, "timer", timer.Name, timer.Data))
                    return true
                }
            }
        }
        OnEvent(event) {
            if (this.Finished) { return true }
            if (event.Name == App.Consts.EventNameLine) {
                for (let trigger of this.#triggers) {
                    if (!trigger.OnEvent(event)) {
                        this.#endWithResult(new TaskResult(this, "trigger", trigger.Name, trigger.Data))
                        return true
                    }
                }
            }
            for (let catcher of this.#catchers) {
                if (!catcher.OnEvent(event)) {
                    this.#endWithResult(new TaskResult(this, "catcher", catcher.Name, catcher.Data))
                    return true
                }
            }

        }
        Cancel(type) {
            if (this.Finished) { return }
            this.#endWithResult(new TaskResult(this, type ? type : "cancel", null, "", null))
        }
    }
    class Group {
        constructor(...items) {
            this.Items = items
        }
        Items = []
        Enable(e) {
            this.Items.forEach(function (item) {
                item.Enable(e)
            })
        }
        Reset(offset) {
            this.Items.forEach(function (item) {
                if (item.Reset) {
                    item.Reset(offset)
                }
            })
        }
    }
    class Catcher {
        constructor(eventname, callback) {
            this.EventName = eventname
            this.Callback = callback
        }
        Enable(e) {
            this.Enabled = e
        }
        Data = null
        WithData(data) {
            this.Data = data
            return this
        }
        Name = ""
        WithName(name) {
            this.Name = name
            return this
        }
        OnEvent(event) {
            if (this.Enabled) {
                if (event.Name == this.EventName) {
                    if (this.Callback == null) {
                        return false
                    }
                    return this.Callback(this, event)
                }
            }
            return true
        }

        Enabled = true
        EventName = ""
    }
    class Trigger {
        constructor(matcher, callback, enabled) {
            if (typeof (matcher) == "string") {
                this.Matcher = function (line) {
                    return line == matcher
                }
            } else if (matcher instanceof RegExp) {
                this.Matcher = function (line) {
                    return line.match(matcher)
                }
            } else {
                this.Matcher = matcher
            }
            this.Callback = callback
            this.Enabled = enabled
            this.Stack = (new Error()).stack
        }
        Enable(e) {
            this.Enabled = e
        }
        OnEvent(event) {
            if (this.Enabled) {
                let result = this.Matcher(event.Data.Output)
                if (result) {
                    if (this.Callback == null) {
                        return false
                    }
                    return this.Callback(this, result, event)
                }
            }
            return true
        }
        Data = null
        WithData(data) {
            this.Data = data
            return this
        }
        Name = ""
        WithName(name) {
            this.Name = name
            return this
        }
        Stack = ""
        Matcher = null
        Enabled = true
        Callback = null
    }
    class Timer {
        constructor(duration, callback, enabled, norepeat) {
            this.Duration = duration || 0
            this.Callback = callback
            this.NoRepeat = (norepeat == true)
            this.Enabled = (enabled == true)
            this.Last = (new Date).getTime() + 0
            this.Stack = (new Error()).stack
        }
        Reset(offset) {
            if (isNaN(offset)) {
                offset = 0
            }
            this.Last = (new Date).getTime() + offset
            return this
        }
        Enable(e) {
            this.Enabled = (e == true)
            return this
        }
        OnTime() {
            if (this.Enabled) {
                let now = (new Date).getTime()
                if (now >= (this.Last + this.Duration + module.Adjust)) {
                    this.Last = (new Date()).getTime()
                    if (this.NoRepeat) {
                        this.Enabled = false
                        this.Finished = true
                    }
                    if (this.Callback == null) {
                        return false
                    }
                    return this.Callback(this)
                }
            }
            return true
        }
        Data = null
        WithData(data) {
            this.Data = data
            return this
        }
        Name = ""
        WithName(name) {
            this.Name = name
            return this
        }
        WithNoRepeat(norepeat) {
            this.NoRepeat = norepeat
            return this
        }
        Stack = ""
        Last = 0
        Duration = 0
        Callback = null
        NoRepeat = false
        Enabled = true
        Finished = false
    }

    class Term {
        constructor() {
            this.StartedAt = (new Date).getTime()
            this.EventBus = new eventModule.Bus()
            this.#timers = []
            this.#triggers = []
            this.#tasks = []
        }
        OnTime() {
            let finished = []
            this.#tasks.forEach(task => {
                if (task.OnTime()) {
                    finished.push(task)
                }
            })
            this.RemoveTasks(...finished)
            let finishedTimers = []
            this.#timers.forEach(function (timer) {
                if (!timer.OnTime() && timer.Finished) {
                    finishedTimers.push(timer)
                }
            })
            this.RemoveTimers(...finishedTimers)
        }
        OnEvent(event) {
            let finished = []
            this.#tasks.forEach(task => {
                if (task.OnEvent(event)) {

                    finished.push(task)
                }
            })
            this.RemoveTasks(...finished)
            if (event.Name == App.Consts.EventNameLine) {
                this.#triggers.forEach(function (trigger) {
                    trigger.OnEvent(event)
                })
            }
        }
        RemoveTasks(...tasks) {
            if (tasks.length == 0) {
                return
            }
            let result = []
            this.#tasks.forEach(function (t) {
                if (!t.Finished) {
                    result.push(t)
                }
            })
            this.#tasks = result
        }
        RemoveTimers(...timers) {
            if (timers.length == 0) {
                return
            }
            let result = []
            this.#timers.forEach(function (t) {
                if (!t.Finished) {
                    result.push(t)
                }
            })
            this.#timers = result
        }
        BindTimer(timer) {
            this.#timers.push(timer)
        }
        BindTask(task) {
            this.#tasks.push(task)
        }
        BindTrigger(trigger) {
            this.#triggers.push(trigger)
        }
        Set(name, value) {
            this.#data[name] = value
        }
        Get(name, defaultvalue) {
            let result = this.#data[name]
            if (result === null || result == undefined) {
                return defaultvalue
            }
            return result
        }
        End() {
            this.#tasks.forEach(function (task) {
                task.Cancel()
            })
        }
        EventBus = null
        #triggers = []
        #timers = []
        #tasks = []
        #data = {}
        StartedAt = 0
    }
    class Position {
        constructor(name) {
            this.Name = name
            this.Term = new Term()
            this.OnTermStart(this)
        }
        Snap() {
            let term = this.Term
            this.Term = new Term()
            return term
        }
        Rollback(snap) {
            if (snap == null) {
                return
            }
            let term = this.Term
            this.Term = snap
            return term
        }
        StartNewTerm() {
            let term = this.Term//避免在cancel的处理中绑定到老的Term
            this.Term = new Term()
            term.End()
        }
        Discard() {
            this.Term = new Term()
        }
        AddTimer(duration, callback, disabled, norepeat) {
            let timer = new Timer(duration, callback, !disabled, norepeat)
            this.Term.BindTimer(timer)
            return timer
        }
        AddTrigger(matcher, callback, disabled) {
            let trigger = new Trigger(matcher, callback, !disabled)
            this.Term.BindTrigger(trigger)
            return trigger
        }
        AddTask(callback) {
            let task = new Task(callback)
            this.Term.BindTask(task)
            return task
        }
        Wait(delay, offset, callback) {
            let task = this.AddTask(result => {
                if (result.Type == "timer") {
                    callback()
                }
            })
            task.AddTimer(delay).Reset(offset)
        }
        BindEvent(eventname, handler) {
            this.Term.EventBus.BindEvent(eventname, handler)
        }
        OnTermStart = DefaultOnTermStart
        Term = null
        Name = ""
    }
    let DefaultOnTermStart = function (position) {
    }
    class Committee {
        constructor() {
            this.EventBus = new eventModule.Bus()
        }
        OnTermStart = DefaultOnTermStart
        RegisterPosition(name) {
            var s = this.Positions.find(function (value) {
                return value.Name == name
            })
            if (s) {
                return s
            }
            s = new Position(name)
            Position.OnTermStart = this.OnTermStart
            this.Positions.push(s)
            return s
        }
        GetPosition(name) {
            return this.Positions.find(function (value) {
                return value.Name == name
            })
        }
        OnTime() {
            this.Positions.forEach(function (position) {
                position.Term.OnTime()
            })
        }
        OnEvent(event) {
            this.Positions.forEach(function (position) {
                position.Term.OnEvent(event)
            })
            this.EventBus.RaiseEvent(event)
        }
        Positions = []
        EventBus = null
    }
    module.Committee = Committee
    module.Group = Group
    module.Plan = Plan
    return module
})