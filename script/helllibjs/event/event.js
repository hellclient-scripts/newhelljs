(function (app) {
    var module = {}
    class Context {
        constructor() { }
        Data = {}
        #proposalsEarlier = []
        #proposalsEarly = []
        #proposals = []
        #proposalsLate = []
        #proposalsLater = []
        Set(name, data) {
            this.Data[name] = data
        }
        Get(name, defaultvalue) {
            let result = this.Data[name]
            if (result === null || result == undefined) {
                return defaultvalue
            }
            return result
        }
        Propose(callback) {
            return this.#propose(this.#proposals, callback)
        }
        ProposeEarly(callback) {
            return this.#propose(this.#proposalsEarly, callback)
        }
        ProposeEarlier(callback) {
            return this.#propose(this.#proposalsEarlier, callback)
        }
        ProposeLate(callback) {
            return this.#propose(this.#proposalsLate, callback)
        }
        ProposeLater(callback) {
            return this.#propose(this.#proposalsLater, callback)
        }
        Execute() {
            [this.#proposalsEarlier, this.#proposalsEarly, this.#proposals, this.#proposalsLate, this.#proposalsLater].forEach(proposals => {
                proposals.forEach(hook => {
                    hook()
                })
            });
        }
        #propose(proposals, callback) {
            proposals.push(callback)
            return true
        }
    }
    class Event {
        constructor(n, d) {
            this.Name = n
            this.Data = d
            this.Context = new Context()
        }
        WithType(t) {
            this.Type = t
            return this
        }
        WithName(n) {
            this.Name = n
            return this
        }
        //Clone with new context
        Clone() {
            let newevent = new Event(this.Name, this.Data)
            newevent.Type = this.Type
            return newevent
        }
        Type = ""
        Name = ""
        Data = null
        Context = null
    }
    class Bus {
        constructor() { }
        #handlers = {}
        BindEvent(eventname, handler) {
            if (!this.#handlers[eventname]) {
                this.#handlers[eventname] = []
            }
            this.#handlers[eventname].push(handler)
        }
        UnbindEvent(eventname, handler) {
            if (!this.#handlers[eventname]) {
                return
            }
            let result = {}
            this.#handlers[eventname].array.forEach(element => {
                if (element != handler) {
                    result.push(element)
                }
            });
            if (result.length) {
                this.#handlers[eventname] = result
            } else {
                delete this.#handlers[eventname]
            }
        }
        UnbindAll(eventname) {
            delete this.#handlers[eventname]
        }
        Reset() {
            this.#handlers = {}
        }
        RaiseEvent(event) {
            if (this.#handlers[event.Name]) {
                this.#handlers[event.Name].forEach(function (callback) {
                    callback(event)
                })
            }
        }
    }
    module.Event = Event
    module.Bus = Bus
    return module
})