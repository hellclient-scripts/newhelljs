(function (App) {
    let mapModule = App.RequireModule("helllibjs/map/map.js")
    App.Tools.HMM = {}
    App.Tools.HMM.TagOutside = () => {
        App.Map.OutsideRooms.forEach(room => {
            mapModule.Database.APITagRoom(room, "室外", 1)
        })
    }
    App.Tools.HMM.Rides = () => {
        App.Map.Rides.forEach(ride => {
            let shortcut = mapModule.HMM.Shortcut.New();
            shortcut.Key = ride.Command.replaceAll(" ", "_");
            shortcut.To = ride.To;
            shortcut.Command = ride.Command;
            shortcut.Cost = ride.Delay;
            shortcut.RoomConditions = [new mapModule.HMM.ValueCondition("室外", 1, false)];
            shortcut.Conditions = [new mapModule.HMM.ValueCondition("ride", 1)];
            shortcut.Group = "ride";
            mapModule.Database.APIInsertShortcuts([shortcut]);
            Dump(ride)
        })
    }
    App.Tools.HMM.NPC = () => {
        Object.values(App.Core.NPC.Kungfu).forEach(npc => {
            let marker = mapModule.HMM.Marker.New();
            marker.Key = npc.Key;
            marker.Value = npc.Loc;
            marker.Message = [npc.Name, npc.Loc, npc.ID].join("|");
            marker.Group = "npc";
            App.Mapper.Database.APIInsertShortcuts([marker]);
            Dump(npc)
        })
    }
    App.Tools.HMM.Maps = () => {
        Object.keys(App.Zone.Maps).forEach(key => {
            let route = App.Mapper.HMM.Route.New();
            route.Key = key;
            route.Rooms = App.Zone.Maps[key]
            route.Group = "quest";
            App.Mapper.Database.APIInsertRoutes([route]);
        })
    }
    App.Tools.HMM.Export = () => {
        MakeHomeFolder("")
        WriteHomeFile("export.hmm", App.Mapper.Database.Export())
    }
    App.Tools.HMM.GetPath = (from, to) => {
        let before = Date.now()
        // let result = App.Map.GetMapperPath(from, true, to);
        for (var i = 0; i < 10; i++) {
            let result=App.Mapper.Database.APIQueryPathAny(["0"], ["1948"], App.Mapper.HMM.Context.New(), App.Mapper.HMM.MapperOptions.New())
        }
        print("耗时" + (Date.now() - before)/10 + "ms")
    }
})(App)