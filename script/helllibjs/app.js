(function () {
    class Consts {
        EventNameLine = "line"
    }
    class Engine {
        #modules = {}
        #eval(name) {
            return eval(world.ReadFile(name), name)
        }
        constructor(app) {
            this.#eventmodule = this.RequireModule(app, "helllibjs/event/event.js")
            this.EventBus = new this.#eventmodule.Bus()
        }
        #eventmodule = null
        #eventHandlers = []
        #filters = {}
        #timeHandlers = []
        EventBus = null
        #pendingEvents = []
        Include(name) {
            if (this.#modules[name]) {
                return this.#modules[name]
            }
            this.#modules[name] = this.#eval(name)
            return this.#modules[name]
        }
        RequireModule(app, name) {
            if (this.#modules[name]) {
                return this.#modules[name]
            }
            this.#modules[name] = this.#eval(name)(app)
            return this.#modules[name]
        }
        OnEvent(event) {
            this.#pendingEvents.push(event)
            if (this.#pendingEvents.length > 1) {
                return
            }
            while (this.#pendingEvents.length > 0) {
                this.TryRun(() => {
                    let current = this.#pendingEvents[0]
                    this.EventBus.RaiseEvent(current)
                    this.#eventHandlers.forEach(handler => {
                        handler.Handler(current)
                    })
                    current.Context.Execute()
                })
                this.#pendingEvents.shift()
            }
        }
        BindEventHandler(handler) {
            this.#eventHandlers.push({
                Handler: handler,
                Stack: (new Error()).Stack
            })
        }
        TryRun(fn) {
            try {
                fn()
            }
            catch (e) {
                PrintSystem(e.message + "\n" + e.stack)
            }
        }
        OnTime() {
            this.#timeHandlers.forEach(handler => {
                this.TryRun(() => {
                    handler.Handler()
                })
            })
        }
        BindTimeHandler(handler) {
            this.#timeHandlers.push({
                Handler: handler,
                Stack: (new Error()).Stack
            })
        }
        LineEvent(eventname) {
            let self = this;
            return function (name, output, wildcards) {
                let event = new self.#eventmodule.Event(eventname, {
                    Name: name,
                    Output: output,
                    Wildcards: wildcards,
                }).WithType("line")
                self.OnEvent(event)
            }
        }
        FilterLineEvent(filtername, eventname) {
            let filter = this.#filters[filtername]
            if (filter) {
                let self = this;
                return function (name, output, wildcards) {
                    let event = new self.#eventmodule.Event(eventname, {
                        Name: name,
                        Output: output,
                        Wildcards: wildcards,
                    }).WithType("line")
                    filter(event)
                }
            }
        }
        SetFilter(filtername, fn) {
            this.#filters[filtername] = fn
        }
        static CreateAppliction() {
            let App = {}
            App.Engine = new Engine(App)
            App.Consts = new Consts()
            App.Include = function (name) {
                return App.Engine.Include(name)
            }
            App.RequireModule = function (name) {
                return App.Engine.RequireModule(App, name)
            }
            App.LineEvent = function (name) {
                return App.Engine.LineEvent(name)
            }
            App.FilterLineEvent = function (filtername, eventname) {
                return App.Engine.FilterLineEvent(filtername, eventname)
            }
            App.RaiseEvent = function (event) {
                App.Engine.OnEvent(event)
            }
            App.BindEvent = function (eventname, callback) {
                App.Engine.EventBus.BindEvent(eventname, callback)
            }
            App.Send = function (cmd, group) {
                Send(cmd)
            }
            App.Userspace = {}
            App.Event = App.Engine.#eventmodule.Event
            return App
        }
    }
    return Engine
})()