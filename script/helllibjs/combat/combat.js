(function (App) {
    let module = {}
    module.DefaultInterval = 1000
    module.DefaultTicker = function (combat) {
    }
    module.DefaultOnStop = function (combat) {
    }
    class Combat {
        constructor(position, plan) {
            this.Position = position
            this.Plan = plan
        }
        Interval = module.DefaultInterval
        Position = null
        Combating = false
        Target = ""
        StartAt = 0
        Tags = {}
        Plan = null
        Ticker = module.DefaultTicker
        OnStop = module.DefaultOnStop
        Start(id) {
            this.Position.StartNewTerm()
            this.Tags = {}
            this.Target = id ? id : ""
            this.StartAt = (new Date()).getTime()
            this.Position.AddTimer(this.Interval, () => {
                this.Ticker(this)
            })
            this.Plan.Execute()
            this.Combating = true
            return this
        }
        WithTags(tags) {
            tags = tags || []
            tags.forEach(tag => {
                this.Tags[tag] = true
            })
        }
        Stop() {
            if (!this.Combating) {
                return
            }
            let onstop=this.OnStop
            this.Position.StartNewTerm()
            this.Target = ""
            this.Combating = false
            onstop(this)
        }
        Duration() {
            return (new Date()).getTime() - this.StartAt
        }
    }
    module.Combat = Combat
    return module
})