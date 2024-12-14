(function (App) {
    let module = {}
    module.DefaultInterval = 1000
    module.DefaultTicker = function (combat) {
    }
    module.DefaultOnStop = function (combat, reason) {
    }
    class Combat {
        constructor(position, plan) {
            this.Position = position
            this.Plan = plan
        }
        Data = null
        Interval = module.DefaultInterval
        Position = null
        Combating = false
        Target = ""
        StartAt = 0
        Plan = null
        Ticker = module.DefaultTicker
        OnStop = module.DefaultOnStop
        Start(id, data) {
            this.Position.StartNewTerm()
            this.Data = data
            this.Target = id ? id : ""
            this.StartAt = (new Date()).getTime()
            this.Position.AddTimer(this.Interval, () => {
                this.Ticker(this)
            })
            this.Ticker(this)
            this.Plan.Execute()
            this.Combating = true
            return this
        }
        Stop(reason) {
            if (!this.Combating) {
                return
            }
            let onstop = this.OnStop
            this.Position.StartNewTerm()
            onstop(this, reason)
            this.Target = ""
            this.Combating = false
            this.Data = null
        }
        Duration() {
            return (new Date()).getTime() - this.StartAt
        }
        Discard() {
            this.Combating = false
            this.Position.Discard()
        }
    }
    module.Combat = Combat
    return module
})