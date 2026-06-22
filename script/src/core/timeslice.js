(function (App) {
    App.Core.Timeslice = {}
    App.Core.Timeslice.Data = {
        Last: (new Date()).getTime(),
        Current: "",
        All: {},
    }
    App.Core.Timeslice.Reset = function () {
        App.Core.Timeslice.Data = {
            Last: $.Now(),
            Current: "",
            All: {},
        }
    }
    App.Core.Timeslice.Save = function () {
        let now = $.Now()
        let cost = now - App.Core.Timeslice.Data.Last
        App.Core.Timeslice.Data.Last = now
        if (App.Core.Timeslice.Data.Current) {
            if (!App.Core.Timeslice.Data.All[App.Core.Timeslice.Data.Current]) {
                App.Core.Timeslice.Data.All[App.Core.Timeslice.Data.Current] = 0
            }
            App.Core.Timeslice.Data.All[App.Core.Timeslice.Data.Current] += cost
        }
    }
    App.Core.Timeslice.Change = function (name) {
        App.Core.Timeslice.Save()
        App.Core.Timeslice.Data.Current = name || ""
    }
    App.Core.Timeslice.ChangeIf = function (name, old) {
        if (App.Core.Timeslice.Data.Current == old) {
            App.Core.Timeslice.Save()
            App.Core.Timeslice.Data.Current = name || ""
        }
    }
    App.Core.Timeslice.List = function () {
        App.Core.Timeslice.Save()
        let data = []
        for (let key in App.Core.Timeslice.Data.All) {
            if (App.Core.Timeslice.Data.All[key] > 0) {
                data.push({ Name: key, Time: App.Core.Timeslice.Data.All[key] })
            }
        }
        data.sort((a, b) => b.Time - a.Time)
        return data
    }
    App.Core.Timeslice.Get = function (name) {
        if (App.Core.Timeslice.Data.All[name]) {
            return App.Core.Timeslice.Data.All[name]
        }
        return 0
    }
    App.Core.Timeslice.Current = function () {
        return App.Core.Timeslice.Data.Current || ""
    }
    App.Commands.RegisterExecutor("timeslice", function (commands, running) {
        running.OnStart = function (arg) {
            App.Core.Timeslice.Change(running.Command.Data)
            App.Next()
        }
    })
    App.Commands.RegisterExecutor("timesliceif", function (commands, running) {
        running.OnStart = function (arg) {
            App.Core.Timeslice.ChangeIf(running.Command.Data.New)
            App.Next()
        }
    })

    App.NewTimesliceCommand = function (name) {
        return App.Commands.NewCommand("timeslice", name)
    }
    App.NewTimesliceIfCommand = function (name, old) {
        return App.Commands.NewCommand("timesliceif", { New: name, Old: old })
    }

})(App)