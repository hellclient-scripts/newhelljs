//房间处理模块
(function (App) {
    let objectModule = App.RequireModule("helllibjs/object/object.js")
    let mapModule = App.RequireModule("helllibjs/map/map.js")

    App.Core.Room = {}
    App.Core.Room.Current = null
    //创建实例，绑定position
    App.Map = new mapModule.Map(App.Positions["Room"], App.Positions["Move"])
    let initRoom = function () {
        App.Map.Room.WithData("Objects", new objectModule.List())
    }
    initRoom()
    //处理房间名
    App.Engine.SetFilter("core.normalroomname", function (event) {
        let words = App.History.CurrentOutput.Words
        if (words.length == 1 && words[0].Color != "" && words[0].Bold == true) {
            App.RaiseEvent(event)
        }
    })
    App.Core.Room.OnName = function (event) {
        App.Core.Room.Current = App.Map.NewRoom().
            WithName(App.History.Current).
            WithNameRaw(App.History.CurrentOutput)
    }
    App.BindEvent("core.roomname", App.Core.Room.OnName)
    reExit = /[a-z]+/g
    //响应房间出口
    App.Core.Room.OnExit = function (event) {
        App.Map.EnterNewRoom(App.Core.Room.Current)
        initRoom()
        event.Context.Propose(function () {
            let result = [...event.Data.Wildcards[1].matchAll(reExit)].map(data => data[0]).sort()
            App.Map.Room.WithExits(result)
            App.RaiseEvent(new App.Event("room.onexit"))
            PlanOnExit.Execute()
        })
    }
    App.BindEvent("core.onexit", App.Core.Room.OnExit)
    let matcherOnHeal = /^    (\S{2,8})正坐在地下(.+)。$/
    let matcherOnYanlian = /^    (\S{2,8})正在演练招式。$/
    let matcherOnObj = /^    ((\S+) )?(\S*[「\(].+[\)」])?(\S+)\(([^\(\)]+)\)( \[.+\])?(( <.+>)*)$/
    //处理得到出口之后的信息(npc和道具列表)的计划
    var PlanOnExit = new App.Plan(App.Positions.Connect,
        function (task) {
            task.AddTrigger(matcherOnObj, function (trigger, result, event) {
                let item = new objectModule.Object(result[4], result[5], App.History.CurrentOutput).
                    WithParam("身份", result[2]).
                    WithParam("外号", result[3]).
                    WithParam("描述", result[6] || "").
                    WithParam("状态", result[7] || "").
                    WithParam("动作", "")
                App.Map.Room.Data.Objects.Append(item)
                event.Context.Set("core.room.onobject", true)
                return true
            })
            task.AddTrigger(matcherOnHeal, function (trigger, result, event) {
                let item = new objectModule.Object(result[1], "", App.History.CurrentOutput).
                    WithParam("动作", result[2])
                App.Map.Room.Data.Objects.Append(item)
                event.Context.Set("core.room.onobject", true)
                return true
            })
            task.AddTrigger(matcherOnYanlian, function (trigger, result, event) {
                let item = new objectModule.Object(result[1], "", App.History.CurrentOutput).
                    WithParam("动作", "演练招式")
                App.Map.Room.Data.Objects.Append(item)
                event.Context.Set("core.room.onobject", true)
                return true
            })

            task.AddCatcher("line", function (catcher, event) {
                let output = event.Data.Output
                if (output.length > 4 && output.startsWith("    ") && output[4] != " ") {
                    return true
                }
                //未匹配过的行代表npc和道具结束
                return event.Context.Get("core.room.onobject")
            })
        }, function (result) {
            if (result.Type != "cancel") {
                if (App.Map.Room.Name && !App.Map.Room.ID) {
                    let idlist = App.Map.Data.RoomsByName[App.Map.Room.Name]
                    if (idlist && idlist.length == 1) {
                        App.Map.Room.ID = idlist[0]
                    }
                }
                App.RaiseEvent(new App.Event("core.roomentry"))
            }
        })
    //处理id here指令
    let matcherIDHere = /^(\S+)\s*=\s*([^、]+)/
    //根据id here的计划记录信息的计划
    var PlanOnIDHere = new App.Plan(App.Positions.Connect,
        function (task) {
            task.AddTrigger(matcherIDHere, function (trigger, result, event) {
                App.Map.Room.Data.IDHere[result[1]] = result[2]
                event.Context.Set("core.room.onidhere", true)
                return true
            })
            task.AddCatcher("line", function (catcher, event) {
                return event.Context.Get("core.room.onidhere")
            })
            task.AddTimer(5000)
        },
        function (result) {
        })
    App.Core.Room.OnIDHere = function (event) {
        event.Context.Propose(function () {
            App.Map.Room.Data.IDHere = {}
            PlanOnIDHere.Execute()
        })
    }
    App.BindEvent("core.idhere", App.Core.Room.OnIDHere)
    //非战斗房间的记录，可以通过这个防止在非战斗房间发呆
    App.BindEvent("core.nofight", function () {
        App.Map.Room.Data["NoFight"] = true
    })
})(App)