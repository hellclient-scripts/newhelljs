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
            if (this.#pendingEvents.length > 1){
                return
            }
            while (this.#pendingEvents.length > 0) {
                let current=this.#pendingEvents[0]
                this.EventBus.RaiseEvent(current)
                this.#eventHandlers.forEach(handler => {
                    handler.Handler(current)
                })
                current.Context.Execute()
                this.#pendingEvents.shift()
            }
        }
        BindEventHandler(handler) {
            this.#eventHandlers.push({
                Handler: handler,
                Stack: (new Error()).Stack
            })
        }
        OnTime() {
            this.#timeHandlers.forEach(handler => {
                handler.Handler()
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
            let app = {}
            app.Engine = new Engine(app)
            app.Consts = new Consts()
            app.Include = function (name) {
                return app.Engine.Include(name)
            }
            app.RequireModule = function (name) {
                return app.Engine.RequireModule(app, name)
            }
            app.LineEvent = function (name) {
                return app.Engine.LineEvent(name)
            }
            app.FilterLineEvent = function (filtername, eventname) {
                return app.Engine.FilterLineEvent(filtername, eventname)
            }
            app.RaiseEvent = function (event) {
                app.Engine.OnEvent(event)
            }
            app.BindEvent = function (eventname, callback) {
                app.Engine.EventBus.BindEvent(eventname, callback)
            }
            app.Send=function(cmd,group){
                Send(cmd)
            }
            app.Event=app.Engine.#eventmodule.Event
            return app
        }
    }
    return Engine
})()