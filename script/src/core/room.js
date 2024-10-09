(function (app) {
    let objectModule = app.RequireModule("helllibjs/object/object.js")
    let mapModule = app.RequireModule("helllibjs/map/map.js")

    App.Core.Room = {}
    App.Data.Room = {}
    App.Data.Room.Name = ""
    App.Data.Room.Objects = new objectModule.List()
    App.Data.Room.Exits = []
    App.Map = new mapModule.Map(app.Positions["Room"])
    let initRoom = function () {
        App.Map.Room.WithData("Objects", new objectModule.List())
    }
    initRoom()
    App.Engine.SetFilter("core.normalroomname", function (event) {
        let words = App.History.CurrentOutput.Words
        if (words.length == 1 && words[0].Color == "Cyan" && words[0].Bold == true) {
            App.RaiseEvent(event)
        }
    })
    App.Core.Room.OnName = function (event) {
        App.Map.EnterNewRoom().
            WithName(App.History.Current).
            WithNameRaw(App.History.CurrentOutput)
            initRoom()
    }
    App.BindEvent("core.roomname", App.Core.Room.OnName)
    reExit = /[a-z]+/g
    App.Core.Room.OnExit = function (event) {
        event.Context.Propose("", function () {
            let result = [...event.Data.Wildcards[1].matchAll(reExit)].map(data => data[0]).sort()
            // App.Data.Room.Exits = result
            App.Map.Room.WithExits(result)
            App.RaiseEvent(new app.Event("room.onexit"))
            PlanOnExit.Execute()
        })
    }
    App.BindEvent("core.onexit", App.Core.Room.OnExit)
    let matcherOnHeal = /^    (\S{2,8})正坐在地下(修炼内力)。$/
    let matcherOnObj = /^    ((\S+) )?(\S*「.+」)?(\S+)\(([^\(\)]+)\)( \[.+\])?(( <.+>)*)$/
    var PlanOnExit = new app.Plan(App.Positions.Connect,
        function (task) {
            task.NewTrigger(matcherOnObj, function (trigger, result, event) {
                let item = new objectModule.Object(result[4], result[5], app.History.CurrentOutput).
                    WithParam("身份", result[2]).
                    WithParam("外号", result[3]).
                    WithParam("描述", result[6] || "").
                    WithParam("状态", result[7] || "").
                    WithParam("动作", "")
                App.Map.Room.Data.Objects.Append(item)
                event.Context.Set("core.room.onobject", true)
                return true
            })
            task.NewTrigger(matcherOnHeal, function (trigger, result, event) {
                let item = new objectModule.Object(result[1], "", app.History.CurrentOutput).
                    WithParam("动作", "result[2]")
                App.Map.Room.Data.Objects.Append(item)
                event.Context.Set("core.room.onobject", true)
                return true
            })

            task.NewCatcher("line", function (catcher, event) {
                return event.Context.Get("core.room.onobject")
            })
        }, function (result) {
            if (result.Type != "cancel") {
                if (App.Map.Room.Name && !App.Map.Room.ID){
                    let idlist=App.Map.Data.RoomsByName[App.Map.Room.Name]
                    if (idlist&&idlist.length==1){
                        App.Map.Room.ID=idlist[0]
                    }
                }
                App.RaiseEvent(new app.Event("core.roomentry"))
            }
        })

})(App)