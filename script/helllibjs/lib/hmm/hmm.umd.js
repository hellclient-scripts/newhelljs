(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./include/timestamp.ts":
/*!******************************!*\
  !*** ./include/timestamp.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Timestamp = void 0;
class Timestamp {
    static Now() {
        return Math.floor(Date.now() / 1000);
    }
}
exports.Timestamp = Timestamp;


/***/ }),

/***/ "./src/cores/mapdatabase.ts":
/*!**********************************!*\
  !*** ./src/cores/mapdatabase.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MapDatabase = exports.APIListOption = void 0;
const landmark_1 = __webpack_require__(/*! ../models/landmark */ "./src/models/landmark.ts");
const mapfile_1 = __webpack_require__(/*! ../models/mapfile */ "./src/models/mapfile.ts");
const marker_1 = __webpack_require__(/*! ../models/marker */ "./src/models/marker.ts");
const route_1 = __webpack_require__(/*! ../models/route */ "./src/models/route.ts");
const trace_1 = __webpack_require__(/*! ../models/trace */ "./src/models/trace.ts");
const region_1 = __webpack_require__(/*! ../models/region */ "./src/models/region.ts");
const base_1 = __webpack_require__(/*! ../models/base */ "./src/models/base.ts");
const room_1 = __webpack_require__(/*! ../models/room */ "./src/models/room.ts");
const shortcut_1 = __webpack_require__(/*! ../models/shortcut */ "./src/models/shortcut.ts");
const snapshot_1 = __webpack_require__(/*! ../models/snapshot */ "./src/models/snapshot.ts");
const variable_1 = __webpack_require__(/*! ../models/variable */ "./src/models/variable.ts");
const context_1 = __webpack_require__(/*! ../models/context */ "./src/models/context.ts");
const mapper_1 = __webpack_require__(/*! ../helpers/mapper */ "./src/helpers/mapper.ts");
const mapperoption_1 = __webpack_require__(/*! ../models/mapperoption */ "./src/models/mapperoption.ts");
const snapshothelper_1 = __webpack_require__(/*! ../helpers/snapshothelper */ "./src/helpers/snapshothelper.ts");
const hmmencoder_1 = __webpack_require__(/*! ../helpers/hmmencoder */ "./src/helpers/hmmencoder.ts");
class APIListOption {
    constructor() {
        this.AllKeys = {};
        this.AllGroups = {};
    }
    static New() {
        return new APIListOption();
    }
    Clear() {
        this.AllKeys = {};
        this.AllGroups = {};
        return this;
    }
    WithKeys(keys) {
        for (let key of keys) {
            this.AllKeys[key] = true;
        }
        return this;
    }
    WithGroups(groups) {
        for (let group of groups) {
            this.AllGroups[group] = true;
        }
        return this;
    }
    Keys() {
        let result = [];
        for (let key in this.AllKeys) {
            result.push(key);
        }
        return result;
    }
    Groups() {
        let result = [];
        for (let group in this.AllGroups) {
            result.push(group);
        }
        return result;
    }
    Validate(key, group) {
        if (Object.keys(this.AllKeys).length > 0 && this.AllKeys[key] !== true) {
            return false;
        }
        if (Object.keys(this.AllGroups).length > 0 && this.AllGroups[group] !== true) {
            return false;
        }
        return true;
    }
    IsEmpty() {
        return Object.keys(this.AllKeys).length == 0 && Object.keys(this.AllGroups).length == 0;
    }
}
exports.APIListOption = APIListOption;
class MapDatabase {
    constructor() {
        this.Current = null;
    }
    static New() {
        return new MapDatabase();
    }
    Import(body, path) {
        let mf = hmmencoder_1.HMMEncoder.Decode(body);
        if (mf != null) {
            mf.Path = path;
            this.SetCurrent(mf);
            mf.Modified = false;
            mf.MarkAsModified();
        }
    }
    Export(path) {
        if (this.Current != null) {
            this.Current.Records.Arrange();
            this.Current.Modified = false;
            this.Current.Path = path;
            return hmmencoder_1.HMMEncoder.Encode(this.Current);
        }
        return "";
    }
    NewMap() {
        let mapfile = mapfile_1.MapFile.Create("", "");
        this.SetCurrent(mapfile);
    }
    SetCurrent(mapfile) {
        this.Current = mapfile;
    }
    CloseCurrent() {
        this.Current = null;
    }
    UpdateMapSettings(s) {
        if (this.Current != null) {
            this.Current.Map.Encoding = s.Encoding;
            this.Current.Map.Info.Name = s.Name;
            this.Current.Map.Info.Desc = s.Desc;
            this.Current.MarkAsModified();
        }
    }
    APIVersion() {
        return MapDatabase.Version;
    }
    APIInfo() {
        if (this.Current != null) {
            return this.Current.Map.Info;
        }
        return null;
    }
    APIListLandmarks(option) {
        if (this.Current != null) {
            let list = [];
            let landmarks = this.Current.Records.Landmarks;
            Object.keys(landmarks).forEach((key) => {
                let model = landmarks[key];
                if (option.Validate(model.Key, model.Group)) {
                    list.push(model);
                }
            });
            landmark_1.Landmark.Sort(list);
            return list;
        }
        return [];
    }
    APIInsertLandmarks(models) {
        if (this.Current != null && models.length > 0) {
            for (let model of models) {
                if (model.Validated()) {
                    this.Current.InsertLandmark(model);
                }
            }
            this.Current.MarkAsModified();
        }
    }
    APIRemoveLandmarks(keys) {
        if (this.Current != null && keys.length > 0) {
            for (let key of keys) {
                this.Current.RemoveLandmark(key);
            }
            this.Current.MarkAsModified();
        }
    }
    APIListMarkers(option) {
        if (this.Current != null) {
            let list = [];
            let markers = this.Current.Records.Markers;
            Object.keys(markers).forEach((key) => {
                let model = markers[key];
                if (option.Validate(model.Key, model.Group)) {
                    list.push(model);
                }
            });
            marker_1.Marker.Sort(list);
            return list;
        }
        return [];
    }
    APIInsertMarkers(models) {
        if (this.Current != null && models.length > 0) {
            for (let model of models) {
                if (model.Validated()) {
                    this.Current.InsertMarker(model);
                }
            }
            this.Current.MarkAsModified();
        }
    }
    APIRemoveMarkers(keys) {
        if (this.Current != null && keys.length > 0) {
            for (let key of keys) {
                this.Current.RemoveMarker(key);
            }
            this.Current.MarkAsModified();
        }
    }
    APIListRegions(option) {
        if (this.Current != null) {
            let list = [];
            let regions = this.Current.Records.Regions;
            Object.keys(regions).forEach((key) => {
                let model = regions[key];
                if (option.Validate(model.Key, model.Group)) {
                    list.push(model);
                }
            });
            region_1.Region.Sort(list);
            return list;
        }
        return [];
    }
    APIInsertRegions(models) {
        if (this.Current != null && models.length > 0) {
            for (let model of models) {
                if (model.Validated()) {
                    this.Current.InsertRegion(model);
                }
            }
            this.Current.MarkAsModified();
        }
    }
    APIRemoveRegions(keys) {
        if (this.Current != null && keys.length > 0) {
            for (let key of keys) {
                this.Current.RemoveRegion(key);
            }
            this.Current.MarkAsModified();
        }
    }
    APIListRooms(option) {
        if (this.Current != null) {
            let list = [];
            let rooms = this.Current.Records.Rooms;
            Object.keys(rooms).forEach((key) => {
                let model = rooms[key];
                if (option.Validate(model.Key, model.Group)) {
                    list.push(model);
                }
            });
            room_1.Room.Sort(list);
            return list;
        }
        return [];
    }
    APIInsertRooms(models) {
        if (this.Current != null && models.length > 0) {
            for (let model of models) {
                if (model.Validated()) {
                    this.Current.InsertRoom(model);
                }
            }
            this.Current.MarkAsModified();
        }
    }
    APIRemoveRooms(keys) {
        if (this.Current != null && keys.length > 0) {
            for (let key of keys) {
                this.Current.RemoveRoom(key);
            }
            this.Current.MarkAsModified();
        }
    }
    APIInsertRoutes(models) {
        if (this.Current != null && models.length > 0) {
            for (let model of models) {
                if (model.Validated()) {
                    this.Current.InsertRoute(model);
                }
            }
            this.Current.MarkAsModified();
        }
    }
    APIListRoutes(option) {
        if (this.Current != null) {
            let list = [];
            let routes = this.Current.Records.Routes;
            Object.keys(routes).forEach((key) => {
                let model = routes[key];
                if (option.Validate(model.Key, model.Group)) {
                    list.push(model);
                }
            });
            route_1.Route.Sort(list);
            return list;
        }
        return [];
    }
    APIRemoveRoutes(keys) {
        if (this.Current != null && keys.length > 0) {
            for (let key of keys) {
                this.Current.RemoveRoute(key);
            }
            this.Current.MarkAsModified();
        }
    }
    APIInsertShortcuts(models) {
        if (this.Current != null && models.length > 0) {
            for (let model of models) {
                if (model.Validated()) {
                    this.Current.InsertShortcut(model);
                }
            }
            this.Current.MarkAsModified();
        }
    }
    APIListShortcuts(option) {
        if (this.Current != null) {
            let list = [];
            let shortcuts = this.Current.Records.Shortcuts;
            Object.keys(shortcuts).forEach((key) => {
                let model = shortcuts[key];
                if (option.Validate(model.Key, model.Group)) {
                    list.push(model);
                }
            });
            shortcut_1.Shortcut.Sort(list);
            return list;
        }
        return [];
    }
    APIRemoveShortcuts(keys) {
        if (this.Current != null && keys.length > 0) {
            for (let key of keys) {
                this.Current.RemoveShortcut(key);
            }
            this.Current.MarkAsModified();
        }
    }
    APIInsertSnapshots(models) {
        if (this.Current != null && models.length > 0) {
            for (let model of models) {
                if (model.Validated()) {
                    this.Current.InsertSnapshot(model);
                }
            }
            this.Current.MarkAsModified();
        }
    }
    APIListSnapshots(option) {
        if (this.Current != null) {
            let list = [];
            this.Current.Records.Snapshots.forEach((model) => {
                if (option.Validate(model.Key, model.Group)) {
                    list.push(model);
                }
            });
            snapshot_1.Snapshot.Sort(list);
            return list;
        }
        return [];
    }
    APIRemoveSnapshots(keys) {
        if (this.Current != null && keys.length > 0) {
            for (let k of keys) {
                this.Current.RemoveSnapshot(k);
            }
            this.Current.MarkAsModified();
        }
    }
    APIInsertTraces(models) {
        if (this.Current != null && models.length > 0) {
            for (let model of models) {
                if (model.Validated()) {
                    this.Current.InsertTrace(model);
                }
            }
            this.Current.MarkAsModified();
        }
    }
    APIRemoveTraces(keys) {
        if (this.Current != null && keys.length > 0) {
            for (let key of keys) {
                this.Current.RemoveTrace(key);
            }
            this.Current.MarkAsModified();
        }
    }
    APIListTraces(option) {
        if (this.Current != null) {
            let list = [];
            let traces = this.Current.Records.Traces;
            Object.keys(traces).forEach((key) => {
                let model = traces[key];
                if (option.Validate(model.Key, model.Group)) {
                    list.push(model);
                }
            });
            trace_1.Trace.Sort(list);
            return list;
        }
        return [];
    }
    APIInsertVariables(models) {
        if (this.Current != null && models.length > 0) {
            for (let model of models) {
                if (model.Validated()) {
                    this.Current.InsertVariable(model);
                }
            }
            this.Current.MarkAsModified();
        }
    }
    APIListVariables(option) {
        if (this.Current != null) {
            let list = [];
            let variables = this.Current.Records.Variables;
            Object.keys(variables).forEach((key) => {
                let model = variables[key];
                if (option.Validate(model.Key, model.Group)) {
                    list.push(model);
                }
            });
            variable_1.Variable.Sort(list);
            return list;
        }
        return [];
    }
    APIRemoveVariables(keys) {
        if (this.Current != null && keys.length > 0) {
            for (let key of keys) {
                this.Current.RemoveVariable(key);
            }
            this.Current.MarkAsModified();
        }
    }
    APIQueryPathAny(from, target, context, options) {
        if (this.Current != null) {
            context !== null && context !== void 0 ? context : (context = new context_1.Context());
            options !== null && options !== void 0 ? options : (options = new mapperoption_1.MapperOptions());
            return new mapper_1.Walking(new mapper_1.Mapper(this.Current, context, options)).QueryPathAny(from, target, 0).SuccessOrNull();
        }
        return null;
    }
    APIQueryPathAll(start, target, context, options) {
        if (this.Current != null) {
            context !== null && context !== void 0 ? context : (context = new context_1.Context());
            options !== null && options !== void 0 ? options : (options = new mapperoption_1.MapperOptions());
            return new mapper_1.Walking(new mapper_1.Mapper(this.Current, context, options)).QueryPathAll(start, target).SuccessOrNull();
        }
        return null;
    }
    APIQueryPathOrdered(start, target, context, options) {
        if (this.Current != null) {
            context !== null && context !== void 0 ? context : (context = new context_1.Context());
            options !== null && options !== void 0 ? options : (options = new mapperoption_1.MapperOptions());
            return new mapper_1.Walking(new mapper_1.Mapper(this.Current, context, options)).QueryPathOrdered(start, target).SuccessOrNull();
        }
        return null;
    }
    //不考虑context
    APIQueryRegionRooms(key) {
        if (this.Current != null) {
            let region = this.Current.Records.Regions[key];
            if (region != null) {
                let result = {};
                for (let item of region.Items) {
                    if (item.Type == base_1.RegionItemType.Room) {
                        if (item.Not) {
                            delete result[item.Value];
                        }
                        else {
                            if (this.Current.Records.Rooms[item.Value] != null) {
                                result[item.Value] = true;
                            }
                        }
                    }
                    else {
                        for (let key of Object.keys(this.Current.Records.Rooms)) {
                            let room = this.Current.Records.Rooms[key];
                            if (room.Group == item.Value) {
                                if (item.Not) {
                                    delete result[room.Key];
                                }
                                else {
                                    result[room.Key] = true;
                                }
                            }
                        }
                    }
                }
                let list = Object.keys(result);
                list.sort();
                return list;
            }
        }
        return [];
    }
    APIDilate(src, iterations, context, options) {
        if (this.Current != null) {
            context !== null && context !== void 0 ? context : (context = new context_1.Context());
            options !== null && options !== void 0 ? options : (options = new mapperoption_1.MapperOptions());
            return new mapper_1.Walking(new mapper_1.Mapper(this.Current, context, options)).Dilate(src, iterations);
        }
        return [];
    }
    APITrackExit(start, command, context, options) {
        if (this.Current != null) {
            context !== null && context !== void 0 ? context : (context = new context_1.Context());
            options !== null && options !== void 0 ? options : (options = new mapperoption_1.MapperOptions());
            let mapper = new mapper_1.Mapper(this.Current, context, options);
            let room = mapper.GetRoom(start);
            if (room != null) {
                let exits = mapper.GetRoomExits(room);
                for (let exit of exits) {
                    if (exit.Command == command && mapper.ValidateExit(start, exit, mapper.GetExitCost(exit))) {
                        return exit.To;
                    }
                }
            }
        }
        return "";
    }
    APIGetVariable(key) {
        if (this.Current != null) {
            let variable = this.Current.Records.Variables[key];
            if (variable != null) {
                return variable.Value;
            }
        }
        return "";
    }
    APIGetRoom(key, context, options) {
        if (this.Current != null) {
            context !== null && context !== void 0 ? context : (context = new context_1.Context());
            options !== null && options !== void 0 ? options : (options = new mapperoption_1.MapperOptions());
            return new mapper_1.Mapper(this.Current, context, options).GetRoom(key);
        }
        return null;
    }
    APIClearSnapshots(filter) {
        if (this.Current != null) {
            this.Current.Records.Snapshots = this.Current.Records.Snapshots.filter(s => !filter.Validate(s));
            this.Current.MarkAsModified();
        }
    }
    APISearchRooms(filter) {
        if (this.Current != null) {
            let result = [];
            let rooms = this.Current.Records.Rooms;
            Object.keys(rooms).forEach((key) => {
                let model = rooms[key];
                if (filter.Validate(model)) {
                    result.push(model);
                }
            });
            return result;
        }
        return [];
    }
    APIFilterRooms(src, filter) {
        if (this.Current != null) {
            let result = [];
            let keys = {};
            src.forEach((key) => {
                keys[key] = true;
            });
            src = Object.keys(keys);
            let rooms = this.Current.Records.Rooms;
            src.forEach((key) => {
                let model = rooms[key];
                if (model != null) {
                    if (filter.Validate(model)) {
                        result.push(model);
                    }
                }
            });
            room_1.Room.Sort(result);
            return result;
        }
        return [];
    }
    APITakeSnapshot(key, type, value, group) {
        if (this.Current != null) {
            this.Current.TakeSnapshot(key, type, value, group);
            this.Current.MarkAsModified();
        }
    }
    APISearchSnapshots(search) {
        if (this.Current != null) {
            return snapshothelper_1.SnapshotHelper.Search(search, this.Current.Records.Snapshots);
        }
        return [];
    }
    APITraceLocation(key, location) {
        if (this.Current != null) {
            let trace = this.Current.Records.Traces[key];
            if (trace != null) {
                let prev = trace.Clone();
                if (trace.Locations.includes(location)) {
                    return;
                }
                trace.AddLocations([location]);
                trace.Arrange();
                if (!trace.Equal(prev)) {
                    this.Current.MarkAsModified();
                }
            }
        }
    }
    APITagRoom(key, tag, value) {
        if (this.Current != null) {
            if (tag != "") {
                let room = this.Current.Records.Rooms[key];
                if (room != null) {
                    let prev = room.Clone();
                    room.Tags = room.Tags.filter((t) => t.Key !== tag);
                    if (value != 0) {
                        room.Tags.push(new base_1.ValueTag(tag, value));
                    }
                    room.Arrange();
                    if (!room.Equal(prev)) {
                        this.Current.MarkAsModified();
                    }
                    return;
                }
            }
        }
    }
    APISetRoomData(roomkey, datakey, datavalue) {
        if (this.Current != null) {
            let room = this.Current.Records.Rooms[roomkey];
            if (room != null) {
                let prev = room.Clone();
                room.Data = room.Data.filter((d) => d.Key !== datakey);
                room.Data.push(new base_1.Data(datakey, datavalue));
                room.Arrange();
                if (!room.Equal(prev)) {
                    this.Current.MarkAsModified();
                }
                return;
            }
        }
    }
    APIGroupRoom(key, group) {
        if (this.Current != null) {
            let room = this.Current.Records.Rooms[key];
            if (room != null) {
                if (room.Group == group) {
                    return;
                }
                room.Group = group;
                this.Current.MarkAsModified();
            }
        }
    }
    APIGetRoomExits(key, context, options) {
        if (this.Current != null) {
            context !== null && context !== void 0 ? context : (context = new context_1.Context());
            options !== null && options !== void 0 ? options : (options = new mapperoption_1.MapperOptions());
            let mapper = new mapper_1.Mapper(this.Current, context, options);
            let room = mapper.GetRoom(key);
            if (room != null) {
                return mapper.GetRoomExits(room);
            }
        }
        return [];
    }
}
exports.MapDatabase = MapDatabase;
MapDatabase.Version = 1004;


/***/ }),

/***/ "./src/helpers/hmmencoder.ts":
/*!***********************************!*\
  !*** ./src/helpers/hmmencoder.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HMMEncoder = exports.MapHeadData = exports.DefaultHmmEncoderHooks = void 0;
const room_1 = __webpack_require__(/*! ../models/room */ "./src/models/room.ts");
const shortcut_1 = __webpack_require__(/*! ../models/shortcut */ "./src/models/shortcut.ts");
const map_1 = __webpack_require__(/*! ../models/map */ "./src/models/map.ts");
const formatter_1 = __webpack_require__(/*! ../models/formatter */ "./src/models/formatter.ts");
const mapfile_1 = __webpack_require__(/*! ../models/mapfile */ "./src/models/mapfile.ts");
const map_2 = __webpack_require__(/*! ../models/map */ "./src/models/map.ts");
const marker_1 = __webpack_require__(/*! ../models/marker */ "./src/models/marker.ts");
const landmark_1 = __webpack_require__(/*! ../models/landmark */ "./src/models/landmark.ts");
const variable_1 = __webpack_require__(/*! ../models/variable */ "./src/models/variable.ts");
const route_1 = __webpack_require__(/*! ../models/route */ "./src/models/route.ts");
const region_1 = __webpack_require__(/*! ../models/region */ "./src/models/region.ts");
const trace_1 = __webpack_require__(/*! ../models/trace */ "./src/models/trace.ts");
const snapshot_1 = __webpack_require__(/*! ../models/snapshot */ "./src/models/snapshot.ts");
class DefaultHmmEncoderHooks {
    static RoomHook(model) {
        return model;
    }
    static ShortcutHook(model) {
        return model;
    }
}
exports.DefaultHmmEncoderHooks = DefaultHmmEncoderHooks;
class MapHeadData {
    constructor() {
        this.FileFormat = "";
        this.Encoding = map_1.MapEncoding.Default;
    }
    Validated() {
        return this.FileFormat == MapHeadData.CurrentFormat;
    }
    static EncodeEncoding(e) {
        return e == map_1.MapEncoding.GB18030 ? "GB18030" : "UTF8";
    }
    static DecodeEncoding(val) {
        return val == "GB18030" ? map_1.MapEncoding.GB18030 : map_1.MapEncoding.Default;
    }
    Encode() {
        return formatter_1.HMMFormatter.EncodeKeyAndValue(formatter_1.HMMFormatter.Level1, MapHeadData.CurrentFormat, formatter_1.HMMFormatter.Escape(MapHeadData.EncodeEncoding(this.Encoding)));
    }
    static Decode(val) {
        let kv = formatter_1.HMMFormatter.DecodeKeyValue(formatter_1.HMMFormatter.Level1, val);
        let result = new MapHeadData;
        result.FileFormat = kv.Key;
        result.Encoding = this.DecodeEncoding(kv.UnescapeValue());
        return result;
    }
}
exports.MapHeadData = MapHeadData;
MapHeadData.CurrentFormat = "HMM1.0";
class HMMEncoder {
    static ResetHooks() {
        this.DecodeRoomHook = DefaultHmmEncoderHooks.RoomHook;
        this.EncodeRoomHook = DefaultHmmEncoderHooks.RoomHook;
        this.DecodeShortcutHook = DefaultHmmEncoderHooks.ShortcutHook;
        this.EncodeShortcutHook = DefaultHmmEncoderHooks.ShortcutHook;
    }
    static Encode(mf) {
        let head = new MapHeadData;
        head.Encoding = mf.Map.Encoding;
        let results = [
            head.Encode(),
            mf.Map.Info.Encode(),
        ];
        let rooms = Object.values(mf.Records.Rooms);
        room_1.Room.Sort(rooms);
        for (let model of rooms) {
            let room = this.EncodeRoomHook(model);
            if (room != null)
                results.push(room.Encode());
        }
        let markers = Object.values(mf.Records.Markers);
        marker_1.Marker.Sort(markers);
        for (let model of markers) {
            results.push(model.Encode());
        }
        let landmarks = Object.values(mf.Records.Landmarks);
        landmark_1.Landmark.Sort(landmarks);
        for (let model of landmarks) {
            results.push(model.Encode());
        }
        let variables = Object.values(mf.Records.Variables);
        variable_1.Variable.Sort(variables);
        for (let model of variables) {
            results.push(model.Encode());
        }
        let routes = Object.values(mf.Records.Routes);
        route_1.Route.Sort(routes);
        for (let model of routes) {
            results.push(model.Encode());
        }
        let regions = Object.values(mf.Records.Regions);
        region_1.Region.Sort(regions);
        for (let model of regions) {
            results.push(model.Encode());
        }
        let traces = Object.values(mf.Records.Traces);
        trace_1.Trace.Sort(traces);
        for (let model of traces) {
            results.push(model.Encode());
        }
        let shortcuts = Object.values(mf.Records.Shortcuts);
        shortcut_1.Shortcut.Sort(shortcuts);
        for (let model of shortcuts) {
            let shotcut = this.EncodeShortcutHook(model);
            if (shotcut != null)
                results.push(shotcut.Encode());
        }
        let snapshots = mf.Records.Snapshots;
        snapshot_1.Snapshot.Sort(snapshots);
        for (let model of snapshots) {
            results.push(model.Encode());
        }
        return formatter_1.HMMFormatter.Escaper.Pack(results.join("\n"));
    }
    static Decode(body) {
        let mf = mapfile_1.MapFile.Create("", "");
        let alldata = body.split("\n");
        let line = alldata.shift();
        if (line == null) {
            return null;
        }
        line = formatter_1.HMMFormatter.Escaper.Unpack(line);
        let head = MapHeadData.Decode(line);
        if (!head.Validated()) {
            return null;
        }
        for (let data of alldata) {
            data = formatter_1.HMMFormatter.Escaper.Unpack(data);
            let key = formatter_1.HMMFormatter.DecodeKeyValue(formatter_1.HMMFormatter.Level1, data);
            switch (key.Key) {
                case map_2.MapInfo.EncodeKey:
                    {
                        let model = map_2.MapInfo.Decode(data);
                        if (model.Validated()) {
                            mf.Map.Info = model;
                        }
                    }
                    break;
                case room_1.Room.EncodeKey:
                    {
                        let model = room_1.Room.Decode(data);
                        if (model.Validated()) {
                            let room = this.DecodeRoomHook(model);
                            if (room != null) {
                                mf.InsertRoom(room);
                            }
                        }
                    }
                    break;
                case marker_1.Marker.EncodeKey:
                    {
                        let model = marker_1.Marker.Decode(data);
                        if (model.Validated()) {
                            mf.InsertMarker(model);
                        }
                    }
                    break;
                case landmark_1.Landmark.EncodeKey:
                    {
                        let model = landmark_1.Landmark.Decode(data);
                        if (model.Validated()) {
                            mf.InsertLandmark(model);
                        }
                    }
                    break;
                case variable_1.Variable.EncodeKey:
                    {
                        let model = variable_1.Variable.Decode(data);
                        if (model.Validated()) {
                            mf.InsertVariable(model);
                        }
                    }
                    break;
                case route_1.Route.EncodeKey:
                    {
                        let model = route_1.Route.Decode(data);
                        if (model.Validated()) {
                            mf.InsertRoute(model);
                        }
                    }
                    break;
                case region_1.Region.EncodeKey:
                    {
                        let model = region_1.Region.Decode(data);
                        if (model.Validated()) {
                            mf.InsertRegion(model);
                        }
                    }
                    break;
                case trace_1.Trace.EncodeKey:
                    {
                        let model = trace_1.Trace.Decode(data);
                        if (model.Validated()) {
                            mf.InsertTrace(model);
                        }
                    }
                    break;
                case shortcut_1.Shortcut.EncodeKey:
                    {
                        let model = shortcut_1.Shortcut.Decode(data);
                        if (model.Validated()) {
                            let shortcut = this.DecodeShortcutHook(model);
                            if (shortcut != null) {
                                mf.InsertShortcut(shortcut);
                            }
                        }
                    }
                    break;
                case snapshot_1.Snapshot.EncodeKey:
                    {
                        let model = snapshot_1.Snapshot.Decode(data);
                        if (model.Validated()) {
                            mf.InsertSnapshot(model);
                        }
                    }
                    break;
            }
        }
        return mf;
    }
}
exports.HMMEncoder = HMMEncoder;
HMMEncoder.DecodeRoomHook = DefaultHmmEncoderHooks.RoomHook;
HMMEncoder.EncodeRoomHook = DefaultHmmEncoderHooks.RoomHook;
HMMEncoder.DecodeShortcutHook = DefaultHmmEncoderHooks.ShortcutHook;
HMMEncoder.EncodeShortcutHook = DefaultHmmEncoderHooks.ShortcutHook;


/***/ }),

/***/ "./src/helpers/mapper.ts":
/*!*******************************!*\
  !*** ./src/helpers/mapper.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Mapper = exports.Walking = exports.WalkingStep = void 0;
const step_1 = __webpack_require__(/*! ../models/step */ "./src/models/step.ts");
const base_1 = __webpack_require__(/*! ../models/base */ "./src/models/base.ts");
class WalkingStep {
    constructor() {
        this.Prev = null;
        this.From = "";
        this.To = "";
        this.Command = "";
        this.Cost = 0;
        this.TotalCost = 0;
        this.Remain = 0;
    }
    static FromExit(prev, from, exit, cost, TotalCost) {
        let result = new WalkingStep();
        result.Prev = prev;
        result.From = from;
        result.To = exit.To;
        result.Command = exit.Command;
        result.Cost = cost;
        result.TotalCost = TotalCost + cost;
        result.Remain = cost - 1;
        return result;
    }
    ToStep() {
        return new step_1.Step(this.Command, this.To, this.Cost);
    }
}
exports.WalkingStep = WalkingStep;
class Walking {
    constructor(mapper) {
        this.Walked = {};
        this.Mapper = mapper;
    }
    static BuildResult(last, targets) {
        let result = new step_1.QueryResult();
        let current = last;
        while (current.Prev != null) {
            result.Steps.push(current.ToStep());
            current = current.Prev;
        }
        result.Steps.push(current.ToStep());
        result.Steps.reverse();
        result.From = current.From;
        result.To = last.To;
        for (let target of targets) {
            if (target != result.To) {
                result.Unvisited.push(target);
            }
        }
        result.Cost = last.TotalCost;
        return result;
    }
    QueryPathAny(from, target, initTotalCost) {
        from = from.filter(x => x !== "");
        target = target.filter(x => x !== "");
        if (from.length == 0 || target.length == 0) {
            return step_1.QueryResult.Fail;
        }
        this.Walked = {};
        let targets = {};
        let current;
        let pending = [];
        for (let t of target) {
            targets[t] = true;
        }
        for (let f of from) {
            if (targets[f] != null) {
                let result = new step_1.QueryResult();
                result.From = f;
                result.To = f;
                result.Cost = initTotalCost;
                for (let to of target) {
                    if (to != f) {
                        result.Unvisited.push(to);
                    }
                }
                return result;
            }
            let step = new WalkingStep();
            step.From = "";
            step.Command = "";
            this.Walked[f] = step;
            this.Mapper.AddRoomWalkingSteps(null, pending, f, initTotalCost);
        }
        while (pending.length > 0) {
            current = pending;
            pending = [];
            for (let step of current) {
                if (this.Walked[step.To] == null) {
                    if (step.Remain <= 1) {
                        if (targets[step.To] != null) {
                            return Walking.BuildResult(step, target);
                        }
                        this.Walked[step.To] = step;
                        this.Mapper.AddRoomWalkingSteps(step, pending, step.To, step.TotalCost);
                    }
                    else {
                        step.Remain--;
                        pending.push(step);
                    }
                }
            }
        }
        return step_1.QueryResult.Fail;
    }
    Dilate(src, iterations) {
        this.Walked = {};
        let current;
        let pending = [];
        for (let f of src) {
            if (this.Mapper.GetRoom(f) != null) {
                let step = new WalkingStep();
                step.From = "";
                step.Command = "";
                this.Walked[f] = step;
                this.Mapper.AddRoomWalkingSteps(null, pending, f, 0);
            }
        }
        let i = 0;
        while (pending.length > 0 && i < iterations) {
            current = pending;
            pending = [];
            for (let step of current) {
                if (this.Walked[step.To] == null) {
                    this.Walked[step.To] = step;
                    this.Mapper.AddRoomWalkingSteps(step, pending, step.To, step.TotalCost);
                }
            }
            i++;
        }
        return Object.keys(this.Walked);
    }
    QueryPathAll(start, target) {
        target = target.filter(x => x !== "");
        if (target.length == 0 || start == "") {
            return step_1.QueryResult.Fail;
        }
        let result = new step_1.QueryResult();
        result.From = start;
        result.To = start;
        let pending = target;
        while (pending.length > 0) {
            let next = this.QueryPathAny([result.To], pending, result.Cost);
            if (next.IsSuccess()) {
                result.Steps = result.Steps.concat(next.Steps);
                result.Cost = next.Cost;
                result.Unvisited = next.Unvisited;
                pending = result.Unvisited;
                result.To = next.To;
            }
            else {
                pending = [];
            }
        }
        if (result.Steps.length == 0) {
            return step_1.QueryResult.Fail;
        }
        return result;
    }
    QueryPathOrdered(start, target) {
        target = target.filter(x => x !== "");
        if (target.length == 0 || start == "") {
            return step_1.QueryResult.Fail;
        }
        let result = new step_1.QueryResult();
        result.From = start;
        result.To = start;
        for (let i = 0; i < target.length; i++) {
            let next = this.QueryPathAny([result.To], [target[i]], result.Cost);
            if (next.IsSuccess()) {
                result.Steps = result.Steps.concat(next.Steps);
                result.Cost = next.Cost;
                result.To = next.To;
            }
            else {
                result.Unvisited.push(target[i]);
            }
        }
        if (result.Steps.length == 0) {
            return step_1.QueryResult.Fail;
        }
        return result;
    }
}
exports.Walking = Walking;
class Mapper {
    constructor(mapFile, context, options) {
        this.MapFile = mapFile;
        this.Context = context;
        this.Options = options;
    }
    static New(mapFile, context, options) {
        return new Mapper(mapFile, context, options);
    }
    GetRoom(key) {
        let room = this.Context.Rooms[key];
        if (room == null) {
            return this.MapFile.Records.Rooms[key] || null;
        }
        return room;
    }
    GetExitCost(exit) {
        let costs = this.Context.CommandCosts[exit.Command];
        if (costs != null) {
            let cost = costs[exit.To];
            if (cost != null) {
                return cost;
            }
            let cost2 = costs[""];
            if (cost2 != null) {
                return cost2;
            }
        }
        return exit.Cost;
    }
    GetRoomExits(room) {
        let result = [...room.Exits];
        let list = this.Context.Paths[room.Key];
        if (list != null) {
            result = result.concat(list);
        }
        if (!this.Options.DisableShortcuts) {
            for (let key of Object.keys(this.MapFile.Records.Shortcuts)) {
                if (base_1.ValueTag.ValidateConditions(room.Tags, this.MapFile.Records.Shortcuts[key].RoomConditions)) {
                    result.push(this.MapFile.Records.Shortcuts[key]);
                }
            }
            for (let shortcut of this.Context.Shortcuts) {
                if (base_1.ValueTag.ValidateConditions(room.Tags, shortcut.RoomConditions)) {
                    result.push(shortcut);
                }
            }
        }
        return result;
    }
    ValidateExit(start, exit, cost) {
        let room = this.GetRoom(exit.To);
        if (room == null) {
            return false;
        }
        if (!this.ValidateRoom(room)) {
            return false;
        }
        if (this.Context.IsBlocked(start, exit.To)) {
            return false;
        }
        if (this.Options.MaxExitCost > 0 && cost > this.Options.MaxExitCost) {
            return false;
        }
        if (this.Options.MaxTotalCost > 0 && cost > this.Options.MaxTotalCost) {
            return false;
        }
        if (!this.Context.ValidateConditions(exit.Conditions)) {
            return false;
        }
        if (!this.Options.ValidateCommand(exit.Command)) {
            return false;
        }
        return true;
    }
    ValidateRoom(room) {
        if (this.Context.Blacklist[room.Key] == true) {
            return false;
        }
        if (Object.keys(this.Context.Whitelist).length > 0 && this.Context.Whitelist[room.Key] == null) {
            return false;
        }
        if (!base_1.ValueTag.ValidateConditions(room.Tags, this.Context.RoomConditions)) {
            return false;
        }
        return true;
    }
    ValidatePath(start, exit) {
        if (this.Context.IsBlocked(start, exit.To)) {
            return false;
        }
        return this.ValidateExit(start, exit, this.GetExitCost(exit));
    }
    ValidateToWalkingStep(prev, from, exit, TotalCost) {
        if (exit.To == "" || exit.To == from) {
            return null;
        }
        let cost = this.GetExitCost(exit);
        if (!this.ValidateExit(from, exit, cost)) {
            return null;
        }
        if (this.Options.MaxTotalCost > 0 && this.Options.MaxTotalCost < (cost + TotalCost)) {
            return null;
        }
        return WalkingStep.FromExit(prev, from, exit, cost, TotalCost);
    }
    AddRoomWalkingSteps(prev, list, from, TotalCost) {
        let room = this.GetRoom(from);
        if (room != null) {
            for (let exit of this.GetRoomExits(room)) {
                let step = this.ValidateToWalkingStep(prev, from, exit, TotalCost);
                if (step != null) {
                    list.push(step);
                }
            }
        }
    }
}
exports.Mapper = Mapper;


/***/ }),

/***/ "./src/helpers/snapshothelper.ts":
/*!***************************************!*\
  !*** ./src/helpers/snapshothelper.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SnapshotHelper = void 0;
const snapshotsearchresult_1 = __webpack_require__(/*! ../models/snapshotsearchresult */ "./src/models/snapshotsearchresult.ts");
class SnapshotHelper {
    static Search(search, snapshots) {
        let all = {};
        for (let snapshot of snapshots) {
            if (all[snapshot.Key] == null) {
                let result = new snapshotsearchresult_1.SnapshotSearchResult();
                result.Key = snapshot.Key;
                result.Sum = 0;
                result.Count = 0;
                result.Items = [];
                all[snapshot.Key] = result;
            }
            all[snapshot.Key].Add(snapshot, search.Validate(snapshot));
        }
        let values = Object.values(all);
        let results = [];
        for (let item of values) {
            if (item.Items.length > 0) {
                results.push(item);
            }
        }
        results.sort((x, y) => x.Key < y.Key ? -1 : 1);
        return results;
    }
}
exports.SnapshotHelper = SnapshotHelper;


/***/ }),

/***/ "./src/models/base.ts":
/*!****************************!*\
  !*** ./src/models/base.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ItemKey = exports.RegionItem = exports.RegionItemType = exports.Data = exports.TypedConditions = exports.ValueCondition = exports.ValueTag = exports.Condition = void 0;
class Condition {
    constructor(key, not) {
        this.Key = key;
        this.Not = not;
    }
    static New(key, not) {
        return new Condition(key, not);
    }
    Validated() {
        return this.Key !== "";
    }
    Equal(model) {
        return this.Key === model.Key && this.Not === model.Not;
    }
    Clone() {
        return new Condition(this.Key, this.Not);
    }
}
exports.Condition = Condition;
class ValueTag {
    constructor(key, value) {
        this.Key = key;
        this.Value = value;
    }
    static New(key, value) { return new ValueTag(key, value); }
    Validated() {
        return this.Key !== "";
    }
    Equal(model) {
        return this.Key == model.Key && this.Value == model.Value;
    }
    Clone() {
        return new ValueTag(this.Key, this.Value);
    }
    ToString() {
        return this.Value === 1 ? this.Key : `${this.Key}:${this.Value}`;
    }
    Match(key, value) {
        return this.Key === key && this.Value >= value;
    }
    static HasTag(tags, key, value) {
        for (let tag of tags) {
            if (tag.Match(key, value)) {
                return true;
            }
        }
        return value < 1;
    }
    static ValidateConditions(tags, conditions) {
        for (let rcondition of conditions) {
            if (ValueTag.HasTag(tags, rcondition.Key, rcondition.Value) == rcondition.Not) {
                return false;
            }
        }
        return true;
    }
}
exports.ValueTag = ValueTag;
class ValueCondition {
    constructor(key, value, not) {
        this.Key = key;
        this.Value = value;
        this.Not = not;
    }
    static New(key, value, not) {
        return new ValueCondition(key, value, not);
    }
    Validated() {
        return this.Key !== "";
    }
    Equal(model) {
        return this.Key == model.Key && this.Not == model.Not && this.Value == model.Value;
    }
    Clone() {
        return new ValueCondition(this.Key, this.Value, this.Not);
    }
    ToString() {
        let label = this.Not ? `!${this.Key}` : this.Key;
        return this.Value == 1 ? label : `${label}:${this.Value}`;
    }
}
exports.ValueCondition = ValueCondition;
class TypedConditions {
    constructor(key, conditions, not) {
        this.Key = key;
        this.Conditions = conditions;
        this.Not = not;
    }
    static New(key, conditions, not) {
        return new TypedConditions(key, conditions, not);
    }
    Validated() {
        return this.Key !== "";
    }
    Equal(model) {
        if (this.Key !== model.Key || this.Not !== model.Not) {
            return false;
        }
        if (this.Conditions.length !== model.Conditions.length) {
            return false;
        }
        for (let i = 0; i < this.Conditions.length; i++) {
            if (this.Conditions[i] != model.Conditions[i]) {
                return false;
            }
        }
        return true;
    }
    Clone() {
        return new TypedConditions(this.Key, [...this.Conditions], this.Not);
    }
}
exports.TypedConditions = TypedConditions;
class Data {
    constructor(key, value) {
        this.Key = key;
        this.Value = value;
    }
    static New(key, value) {
        return new Data(key, value);
    }
    Validated() {
        return this.Key !== "" && this.Value !== "";
    }
    Clone() {
        return new Data(this.Key, this.Value);
    }
    Equal(model) {
        return this.Key === model.Key && this.Value === model.Value;
    }
}
exports.Data = Data;
var RegionItemType;
(function (RegionItemType) {
    RegionItemType[RegionItemType["Room"] = 0] = "Room";
    RegionItemType[RegionItemType["Zone"] = 1] = "Zone";
})(RegionItemType || (exports.RegionItemType = RegionItemType = {}));
class RegionItem {
    constructor(type, value, not) {
        this.Type = type;
        this.Value = value;
        this.Not = not;
    }
    static New(type, value, not) {
        return new RegionItem(type, value, not);
    }
    Validated() {
        return this.Value !== "";
    }
    Clone() {
        return new RegionItem(this.Type, this.Value, this.Not);
    }
    Equal(model) {
        if (this.Type !== model.Type)
            return false;
        if (this.Value !== model.Value)
            return false;
        if (this.Not !== model.Not)
            return false;
        return true;
    }
}
exports.RegionItem = RegionItem;
class ItemKey {
    static Validate(key) {
        return key !== "" && !key.includes('\n');
    }
}
exports.ItemKey = ItemKey;


/***/ }),

/***/ "./src/models/context.ts":
/*!*******************************!*\
  !*** ./src/models/context.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Context = exports.Environment = exports.CommandCost = exports.Link = exports.Path = void 0;
const exit_1 = __webpack_require__(/*! ./exit */ "./src/models/exit.ts");
const base_1 = __webpack_require__(/*! ./base */ "./src/models/base.ts");
class Path extends exit_1.Exit {
    constructor() {
        super(...arguments);
        this.From = "";
    }
    static New() {
        return new Path();
    }
}
exports.Path = Path;
class Link {
    constructor(from, to) {
        this.From = "";
        this.To = "";
        this.From = from;
        this.To = to;
    }
    static New(from, to) {
        return new Link(from, to);
    }
}
exports.Link = Link;
class CommandCost {
    constructor(command, to, cost) {
        this.Command = command;
        this.To = to;
        this.Cost = cost;
    }
    static New(command, to, cost) {
        return new CommandCost(command, to, cost);
    }
}
exports.CommandCost = CommandCost;
class Environment {
    constructor() {
        this.Tags = [];
        this.RoomConditions = [];
        this.Rooms = [];
        this.Paths = [];
        this.Shortcuts = [];
        this.Whitelist = [];
        this.Blacklist = [];
        this.BlockedLinks = [];
        this.CommandCosts = [];
    }
    static New() {
        return new Environment();
    }
}
exports.Environment = Environment;
class Context {
    constructor() {
        this.Tags = {};
        this.RoomConditions = [];
        this.Rooms = {};
        this.Whitelist = {};
        this.Blacklist = {};
        this.Shortcuts = [];
        this.Paths = {};
        this.BlockedLinks = {};
        this.CommandCosts = {};
    }
    static New() {
        return new Context();
    }
    ClearTags() {
        this.Tags = {};
        return this;
    }
    WithTags(tags) {
        for (let tag of tags) {
            this.Tags[tag.Key] = tag.Value;
        }
        return this;
    }
    ClearRoomConditions() {
        this.RoomConditions = [];
        return this;
    }
    WithRoomConditions(conditions) {
        this.RoomConditions = this.RoomConditions.concat(conditions);
        return this;
    }
    ClearRooms() {
        this.Rooms = {};
        return this;
    }
    WithRooms(rooms) {
        for (let room of rooms) {
            this.Rooms[room.Key] = room;
        }
        return this;
    }
    ClearWhitelist() {
        this.Whitelist = {};
        return this;
    }
    WithWhitelist(list) {
        for (let item of list) {
            this.Whitelist[item] = true;
        }
        return this;
    }
    ClearBlacklist() {
        this.Blacklist = {};
        return this;
    }
    WithBlacklist(list) {
        for (let item of list) {
            this.Blacklist[item] = true;
        }
        return this;
    }
    ClearShortcuts() {
        this.Shortcuts = [];
        return this;
    }
    WithShortcuts(list) {
        this.Shortcuts = this.Shortcuts.concat(list);
        return this;
    }
    ClearPaths() {
        this.Paths = {};
        return this;
    }
    WithPaths(list) {
        for (let item of list) {
            if (this.Paths[item.From]) {
                this.Paths[item.From].push(item);
            }
            else {
                this.Paths[item.From] = [item];
            }
        }
        return this;
    }
    ClearBlockedLinks() {
        this.BlockedLinks = {};
        return this;
    }
    WithBlockedLinks(list) {
        for (let link of list) {
            if (this.BlockedLinks[link.From] == null) {
                this.BlockedLinks[link.From] = {};
            }
            this.BlockedLinks[link.From][link.To] = true;
        }
        return this;
    }
    ClearCommandCosts() {
        this.CommandCosts = {};
        return this;
    }
    WithCommandCosts(list) {
        for (let item of list) {
            if (this.CommandCosts[item.Command] == null) {
                this.CommandCosts[item.Command] = {};
            }
            this.CommandCosts[item.Command][item.To] = item.Cost;
        }
        return this;
    }
    IsBlocked(from, to) {
        return this.BlockedLinks[from] != null && this.BlockedLinks[from][to] != null;
    }
    static FromEnvironment(env) {
        let context = new Context();
        context.WithTags(env.Tags);
        context.WithRoomConditions(env.RoomConditions);
        context.WithRooms(env.Rooms);
        context.WithWhitelist(env.Whitelist);
        context.WithBlacklist(env.Blacklist);
        context.WithShortcuts(env.Shortcuts);
        context.WithPaths(env.Paths);
        context.WithBlockedLinks(env.BlockedLinks);
        context.WithCommandCosts(env.CommandCosts);
        return context;
    }
    ToEnvironment() {
        let env = new Environment();
        env.Tags = [...Object.keys(this.Tags).map(key => new base_1.ValueTag(key, this.Tags[key]))];
        env.RoomConditions = this.RoomConditions;
        env.Rooms = Object.values(this.Rooms);
        env.Whitelist = Object.keys(this.Whitelist);
        env.Blacklist = Object.keys(this.Blacklist);
        env.Shortcuts = this.Shortcuts;
        for (let pathitem in this.Paths) {
            for (let item of this.Paths[pathitem]) {
                env.Paths.push(item);
            }
        }
        for (let f in this.BlockedLinks) {
            for (let t in this.BlockedLinks[f]) {
                if (this.BlockedLinks[f][t]) {
                    env.BlockedLinks.push(new Link(f, t));
                }
            }
        }
        for (let c in this.CommandCosts) {
            for (let t in this.CommandCosts[c]) {
                env.CommandCosts.push(new CommandCost(c, t, this.CommandCosts[c][t]));
            }
        }
        return env;
    }
    HasTag(key, value) {
        if (this.Tags[key]) {
            return value <= this.Tags[key];
        }
        return value <= 0;
    }
    ValidateConditions(conditions) {
        for (let rcondition of conditions) {
            if (this.HasTag(rcondition.Key, rcondition.Value) == rcondition.Not) {
                return false;
            }
        }
        return true;
    }
}
exports.Context = Context;


/***/ }),

/***/ "./src/models/exit.ts":
/*!****************************!*\
  !*** ./src/models/exit.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Exit = void 0;
class Exit {
    constructor() {
        //路径指令
        this.Command = "";
        //目标房间
        this.To = "";
        this.Conditions = [];
        this.Cost = 1;
    }
    Exit() { }
    static New() {
        return new Exit();
    }
    Validated() {
        return this.Command != "";
    }
    Clone() {
        let model = new Exit();
        model.Command = this.Command;
        model.To = this.To;
        model.Conditions = this.Conditions.map(m => m.Clone());
        model.Cost = this.Cost;
        return model;
    }
    Equal(model) {
        if (this.Command !== model.Command || this.To !== model.To || this.Cost !== model.Cost) {
            return false;
        }
        if (this.Conditions.length != model.Conditions.length) {
            return false;
        }
        for (let i = 0; i < this.Conditions.length; i++) {
            if (!this.Conditions[i].Equal(model.Conditions[i])) {
                return false;
            }
        }
        return true;
    }
    Arrange() {
        this.Conditions.sort(((x, y) => {
            if (x.Not == y.Not) {
                return x.Key < y.Key ? -1 : 1;
            }
            else {
                return x.Not < y.Not ? -1 : 1;
            }
        }));
    }
}
exports.Exit = Exit;


/***/ }),

/***/ "./src/models/formatter.ts":
/*!*********************************!*\
  !*** ./src/models/formatter.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HMMFormatter = exports.HMMLevel = exports.ToggleKeyValues = exports.ToggleKeyValue = exports.ToggleValue = exports.KeyValue = void 0;
const base_1 = __webpack_require__(/*! ./base */ "./src/models/base.ts");
const controlcode_1 = __webpack_require__(/*! ../utils/controlcode/controlcode */ "./src/utils/controlcode/controlcode.ts");
class KeyValue {
    constructor(key, value) {
        this.Key = key;
        this.Value = value;
    }
    static New(key, value) {
        return new KeyValue(key, value);
    }
    ;
    UnescapeKey() {
        return HMMFormatter.Unescape(this.Key);
    }
    UnescapeValue() {
        return HMMFormatter.Unescape(this.Value);
    }
    ToData() {
        return new base_1.Data(HMMFormatter.Unescape(this.Key), HMMFormatter.Unescape(this.Value));
    }
    static FromData(k) {
        return new KeyValue(HMMFormatter.Escape(k.Key), HMMFormatter.Escape(k.Value));
    }
    ToValueTag() {
        return new base_1.ValueTag(HMMFormatter.Unescape(this.Key), HMMFormatter.UnescapeInt(this.Value, 1));
    }
    static FromValueTag(k) {
        return new KeyValue(HMMFormatter.Escape(k.Key), k.Value == 1 ? "" : k.Value.toString());
    }
}
exports.KeyValue = KeyValue;
class ToggleValue {
    constructor(value, not) {
        this.Value = value;
        this.Not = not;
    }
    static New(value, not) {
        return new ToggleValue(value, not);
    }
    UnescapeValue() {
        return HMMFormatter.Unescape(this.Value);
    }
    ToCondition() {
        return new base_1.Condition(HMMFormatter.Unescape(this.Value), this.Not);
    }
    static FromCondition(c) {
        return new ToggleValue(HMMFormatter.Escape(c.Key), c.Not);
    }
}
exports.ToggleValue = ToggleValue;
class ToggleKeyValue {
    constructor(key, value, not) {
        this.Not = not;
        this.Value = value;
        this.Key = key;
    }
    static New(key, value, not) {
        return new ToggleKeyValue(key, value, not);
    }
    UnescapeKey() {
        return HMMFormatter.Unescape(this.Key);
    }
    UnescapeValue() {
        return HMMFormatter.Unescape(this.Value);
    }
    ToRegionItem() {
        return new base_1.RegionItem(HMMFormatter.Unescape(this.Key) == "Room" ? base_1.RegionItemType.Room : base_1.RegionItemType.Zone, HMMFormatter.Unescape(this.Value), this.Not);
    }
    static FromRegionItem(i) {
        return new ToggleKeyValue(HMMFormatter.Escape(i.Type == base_1.RegionItemType.Room ? "Room" : "Zone"), HMMFormatter.Escape(i.Value), i.Not);
    }
    ToValueCondition() {
        return new base_1.ValueCondition(HMMFormatter.Unescape(this.Key), HMMFormatter.UnescapeInt(this.Value, 1), this.Not);
    }
    static FromValueCondition(c) {
        return new ToggleKeyValue(HMMFormatter.Escape(c.Key), c.Value == 1 ? "" : c.Value.toString(), c.Not);
    }
}
exports.ToggleKeyValue = ToggleKeyValue;
class ToggleKeyValues {
    constructor(key, values, not) {
        this.Key = key;
        this.Values = values;
        this.Not = not;
    }
    static New(key, values, not) {
        return new ToggleKeyValues(key, values, not);
    }
    ToTypedConditions() {
        return new base_1.TypedConditions(HMMFormatter.Unescape(this.Key), this.Values.map(HMMFormatter.Unescape), this.Not);
    }
    static FromTypedConditions(c) {
        return new ToggleKeyValues(HMMFormatter.Escape(c.Key), c.Conditions.map(HMMFormatter.Escape), c.Not);
    }
}
exports.ToggleKeyValues = ToggleKeyValues;
class HMMLevel {
    constructor(keyToken, sepToken) {
        this.KeyToken = keyToken;
        this.SepToken = sepToken;
    }
    static New(keyToken, sepToken) {
        return new HMMLevel(keyToken, sepToken);
    }
}
exports.HMMLevel = HMMLevel;
//五层简单结构格式化工具
//只支持列表和键值对列表，最多支持5层
class HMMFormatter {
    static Escape(val) {
        return HMMFormatter.Escaper.Encode(val);
    }
    static Unescape(val) {
        return HMMFormatter.Escaper.Decode(val);
    }
    static EncodeKeyAndValue(level, key, val) {
        return HMMFormatter.EncodeKeyValue(level, new KeyValue(key, val));
    }
    static EncodeKeyValue(level, kv) {
        return `${kv.Key}${level.KeyToken.Raw}${kv.Value}`;
    }
    static DecodeKeyValue(level, val) {
        let decoded = val.split(level.KeyToken.Raw, 2);
        return new KeyValue(decoded[0], decoded.length > 1 ? decoded[1] : "");
    }
    static EncodeToggleKeyValue(level, kv) {
        return HMMFormatter.EncodeToggleValue(new ToggleValue(HMMFormatter.EncodeKeyAndValue(level, kv.Key, kv.Value), kv.Not));
    }
    static DecodeToggleKeyValue(level, val) {
        let v = HMMFormatter.DecodeToggleValue(val);
        let kv = HMMFormatter.DecodeKeyValue(level, v.Value);
        return new ToggleKeyValue(kv.Key, kv.Value, v.Not);
    }
    static EncodeToggleKeyValues(level, kv) {
        return HMMFormatter.EncodeToggleValue(new ToggleValue(HMMFormatter.EncodeKeyAndValue(level, kv.Key, HMMFormatter.EncodeList(level, kv.Values)), kv.Not));
    }
    static DecodeToggleKeyValues(level, val) {
        let v = HMMFormatter.DecodeToggleValue(val);
        let kv = HMMFormatter.DecodeKeyValue(level, v.Value);
        return new ToggleKeyValues(kv.Key, HMMFormatter.DecodeList(level, kv.Value), v.Not);
    }
    static EncodeList(level, items) {
        return items.join(level.SepToken.Raw);
    }
    static DecodeList(level, val) {
        if (val == "") {
            return [];
        }
        return [...val.split(level.SepToken.Raw)];
    }
    static At(list, index) {
        return index >= 0 && index < list.length ? list[index] : "";
    }
    static UnescapeAt(list, index) {
        return HMMFormatter.Unescape(HMMFormatter.At(list, index));
    }
    static UnescapeInt(val, defaultValue) {
        let result = Number.parseInt(HMMFormatter.Unescape(val));
        return isNaN(result) || (val.indexOf(".") != -1) ? defaultValue : result;
    }
    static UnescapeIntAt(list, index, defaultValue) {
        return HMMFormatter.UnescapeInt(HMMFormatter.At(list, index), defaultValue);
    }
    static EncodeToggleValue(v) {
        return (v.Not ? HMMFormatter.TokenNot.Raw : "") + v.Value;
    }
    static DecodeToggleValue(val) {
        let not = val.length > 0 && val.startsWith(HMMFormatter.TokenNot.Raw);
        let key = "";
        if (not) {
            key = val.substring(1);
        }
        else {
            key = val;
        }
        return new ToggleValue(key, not);
    }
    static EscapeList(list) {
        return list.map(HMMFormatter.Escape);
    }
    static UnescapeList(list) {
        return list.map(HMMFormatter.Unescape);
    }
}
exports.HMMFormatter = HMMFormatter;
HMMFormatter.Level1 = new HMMLevel(new controlcode_1.Command(">", "1", "\\>"), new controlcode_1.Command("|", "6", "\\|"));
HMMFormatter.Level2 = new HMMLevel(new controlcode_1.Command(":", "2", "\\:"), new controlcode_1.Command(";", "7", "\\;"));
HMMFormatter.Level3 = new HMMLevel(new controlcode_1.Command("=", "3", "\\="), new controlcode_1.Command(",", "8", "\\,"));
HMMFormatter.Level4 = new HMMLevel(new controlcode_1.Command("@", "4", "\\@"), new controlcode_1.Command("&", "9", "\\&"));
HMMFormatter.Level5 = new HMMLevel(new controlcode_1.Command("^", "5", "\\^"), new controlcode_1.Command("`", "10", "\\`"));
HMMFormatter.TokenNot = new controlcode_1.Command("!", "11", "\\!");
HMMFormatter.TokenNewline = new controlcode_1.Command("\n", "12", "\\n");
HMMFormatter.Escaper = ((new controlcode_1.ControlCode())
    .WithCommand(new controlcode_1.Command("\\", "0", "\\\\"))
    .WithCommand(HMMFormatter.Level1.KeyToken)
    .WithCommand(HMMFormatter.Level1.SepToken)
    .WithCommand(HMMFormatter.Level2.KeyToken)
    .WithCommand(HMMFormatter.Level2.SepToken)
    .WithCommand(HMMFormatter.Level3.KeyToken)
    .WithCommand(HMMFormatter.Level3.SepToken)
    .WithCommand(HMMFormatter.Level4.KeyToken)
    .WithCommand(HMMFormatter.Level4.SepToken)
    .WithCommand(HMMFormatter.Level5.KeyToken)
    .WithCommand(HMMFormatter.Level5.SepToken)
    .WithCommand(HMMFormatter.TokenNot)
    .WithCommand(HMMFormatter.TokenNewline)
    .WithCommand(new controlcode_1.Command("", "99", "\\")));


/***/ }),

/***/ "./src/models/landmark.ts":
/*!********************************!*\
  !*** ./src/models/landmark.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Landmark = exports.LandmarkKey = void 0;
const base_1 = __webpack_require__(/*! ./base */ "./src/models/base.ts");
const formatter_1 = __webpack_require__(/*! ./formatter */ "./src/models/formatter.ts");
const uniquekeyutil_1 = __webpack_require__(/*! ../utils/uniquekeyutil */ "./src/utils/uniquekeyutil.ts");
class LandmarkKey {
    constructor(key, type) {
        this.Key = "";
        this.Type = "";
        this.Key = key;
        this.Type = type;
    }
    static New(key, type) {
        return new LandmarkKey(key, type);
    }
    ToString() {
        return uniquekeyutil_1.UniqueKeyUtil.Join([this.Key, this.Type]);
    }
    Equal(obj) {
        return this.Key === obj.Key && this.Type === obj.Type;
    }
}
exports.LandmarkKey = LandmarkKey;
class Landmark {
    constructor() {
        this.Key = "";
        this.Type = "";
        this.Value = "";
        this.Group = "";
        this.Desc = "";
    }
    static New() { return new Landmark(); }
    Validated() {
        return base_1.ItemKey.Validate(this.Key);
    }
    Encode() {
        return formatter_1.HMMFormatter.EncodeKeyAndValue(formatter_1.HMMFormatter.Level1, Landmark.EncodeKey, formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level1, [
            formatter_1.HMMFormatter.Escape(this.Key), //0
            formatter_1.HMMFormatter.Escape(this.Type), //1
            formatter_1.HMMFormatter.Escape(this.Value), //2
            formatter_1.HMMFormatter.Escape(this.Group), //3
            formatter_1.HMMFormatter.Escape(this.Desc), //4
        ]));
    }
    static Decode(val) {
        let result = new Landmark();
        let kv = formatter_1.HMMFormatter.DecodeKeyValue(formatter_1.HMMFormatter.Level1, val);
        let list = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level1, kv.Value);
        result.Key = formatter_1.HMMFormatter.UnescapeAt(list, 0);
        result.Type = formatter_1.HMMFormatter.UnescapeAt(list, 1);
        result.Value = formatter_1.HMMFormatter.UnescapeAt(list, 2);
        result.Group = formatter_1.HMMFormatter.UnescapeAt(list, 3);
        result.Desc = formatter_1.HMMFormatter.UnescapeAt(list, 4);
        return result;
    }
    Arrange() {
    }
    Clone() {
        let result = new Landmark();
        result.Key = this.Key;
        result.Type = this.Type;
        result.Value = this.Value;
        result.Group = this.Group;
        result.Desc = this.Desc;
        return result;
    }
    static Sort(list) {
        list.sort((x, y) => x.Group != y.Group ? (x.Group < y.Group ? -1 : 1) : (x.Key != y.Key ? (x.Key < y.Key ? -1 : 1) : (x.Type < y.Type ? -1 : 1)));
    }
    Equal(model) {
        if (this.Key === model.Key && this.Type === model.Type && this.Value === model.Value && this.Group === model.Group && this.Desc === model.Desc) {
            return true;
        }
        return false;
    }
    UniqueKey() {
        return new LandmarkKey(this.Key, this.Type);
    }
}
exports.Landmark = Landmark;
Landmark.EncodeKey = "Landmark";


/***/ }),

/***/ "./src/models/map.ts":
/*!***************************!*\
  !*** ./src/models/map.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Map = exports.MapInfo = exports.MapEncoding = exports.MapSettings = void 0;
const formatter_1 = __webpack_require__(/*! ./formatter */ "./src/models/formatter.ts");
const timestamp_1 = __webpack_require__(/*! @include/timestamp */ "./include/timestamp.ts");
class MapSettings {
    constructor() {
        this.Name = "";
        this.Desc = "";
        this.Encoding = MapEncoding.Default;
    }
    static New() {
        return new MapSettings();
    }
}
exports.MapSettings = MapSettings;
var MapEncoding;
(function (MapEncoding) {
    MapEncoding[MapEncoding["Default"] = 0] = "Default";
    MapEncoding[MapEncoding["GB18030"] = 1] = "GB18030";
})(MapEncoding || (exports.MapEncoding = MapEncoding = {}));
class MapInfo {
    constructor() {
        this.Name = "";
        this.Desc = "";
        this.UpdatedTime = 0;
    }
    static Create(name, desc) {
        let result = new MapInfo();
        result.UpdatedTime = timestamp_1.Timestamp.Now();
        result.Name = name;
        result.Desc = desc;
        return result;
    }
    Validated() {
        return this.UpdatedTime > -1;
    }
    Encode() {
        return formatter_1.HMMFormatter.EncodeKeyAndValue(formatter_1.HMMFormatter.Level1, MapInfo.EncodeKey, formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level1, [
            formatter_1.HMMFormatter.Escape(this.Name), //0
            formatter_1.HMMFormatter.Escape(this.UpdatedTime.toString()), //1
            formatter_1.HMMFormatter.Escape(this.Desc), //2
        ]));
    }
    static Decode(val) {
        let result = new MapInfo();
        let kv = formatter_1.HMMFormatter.DecodeKeyValue(formatter_1.HMMFormatter.Level1, val);
        let list = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level1, kv.Value);
        result.Name = formatter_1.HMMFormatter.UnescapeAt(list, 0);
        result.UpdatedTime = formatter_1.HMMFormatter.UnescapeIntAt(list, 1, -1);
        result.Desc = formatter_1.HMMFormatter.UnescapeAt(list, 2);
        return result;
    }
    Clone() {
        let result = new MapInfo();
        result.Name = this.Name;
        result.Desc = this.Desc;
        result.UpdatedTime = this.UpdatedTime;
        return result;
    }
    Equal(model) {
        if (this.Name !== model.Name) {
            return false;
        }
        if (this.Desc !== model.Desc) {
            return false;
        }
        if (this.UpdatedTime !== model.UpdatedTime) {
            return false;
        }
        return true;
    }
}
exports.MapInfo = MapInfo;
MapInfo.EncodeKey = "Info";
class Map {
    constructor() {
        this.Encoding = MapEncoding.Default;
        this.Info = new MapInfo();
    }
    static Create(name, desc) {
        let result = new Map();
        result.Info = MapInfo.Create(name, desc);
        return result;
    }
}
exports.Map = Map;
Map.CurrentVersion = "1.0";


/***/ }),

/***/ "./src/models/mapfile.ts":
/*!*******************************!*\
  !*** ./src/models/mapfile.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MapFile = void 0;
const map_1 = __webpack_require__(/*! ./map */ "./src/models/map.ts");
const records_1 = __webpack_require__(/*! ./records */ "./src/models/records.ts");
const snapshot_1 = __webpack_require__(/*! ./snapshot */ "./src/models/snapshot.ts");
const timestamp_1 = __webpack_require__(/*! @include/timestamp */ "./include/timestamp.ts");
class MapFile {
    constructor() {
        this.Path = "";
        this.Modified = true;
        this.Records = new records_1.Records();
        this.Map = new map_1.Map();
    }
    static New() {
        return new MapFile();
    }
    static Create(name, desc) {
        let result = new MapFile();
        result.Map = map_1.Map.Create(name, desc);
        return result;
    }
    MarkAsModified() {
        this.Map.Info.UpdatedTime = timestamp_1.Timestamp.Now();
        this.Modified = true;
    }
    InsertRoom(room) {
        room.Arrange();
        this.Records.Rooms[room.Key] = room;
    }
    RemoveRoom(key) {
        delete this.Records.Rooms[key];
    }
    InsertMarker(marker) {
        marker.Arrange();
        this.Records.Markers[marker.Key] = marker;
    }
    RemoveMarker(key) {
        delete this.Records.Markers[key];
    }
    InsertRoute(route) {
        route.Arrange();
        this.Records.Routes[route.Key] = route;
    }
    RemoveRoute(key) {
        delete this.Records.Routes[key];
    }
    InsertTrace(trace) {
        trace.Arrange();
        this.Records.Traces[trace.Key] = trace;
    }
    RemoveTrace(key) {
        delete this.Records.Traces[key];
    }
    InsertRegion(region) {
        region.Arrange();
        this.Records.Regions[region.Key] = region;
    }
    RemoveRegion(key) {
        delete this.Records.Regions[key];
    }
    InsertLandmark(landmark) {
        landmark.Arrange();
        this.Records.Landmarks[landmark.UniqueKey().ToString()] = landmark;
    }
    RemoveLandmark(key) {
        delete this.Records.Landmarks[key.ToString()];
    }
    InsertShortcut(model) {
        model.Arrange();
        this.Records.Shortcuts[model.Key] = model;
    }
    RemoveShortcut(key) {
        delete this.Records.Shortcuts[key];
    }
    InsertVariable(model) {
        model.Arrange();
        this.Records.Variables[model.Key] = model;
    }
    RemoveVariable(key) {
        delete this.Records.Variables[key];
    }
    InsertSnapshot(model) {
        model.Arrange();
        this.RemoveSnapshot(model.UniqueKey());
        this.Records.Snapshots.push(model);
        this.Records.Arrange();
    }
    RemoveSnapshot(key) {
        this.Records.Snapshots = this.Records.Snapshots.filter(r => !r.UniqueKey().Equal(key));
    }
    TakeSnapshot(key, type, value, group) {
        let snapshotKey = new snapshot_1.SnapshotKey(key, type, value);
        let item = this.Records.Snapshots.find(r => r.UniqueKey().Equal(snapshotKey));
        if (item != null) {
            item.Repeat();
        }
        else {
            let model = snapshot_1.Snapshot.Create(key, type, value, group);
            model.Arrange();
            this.Records.Snapshots.push(model);
            snapshot_1.Snapshot.Sort(this.Records.Snapshots);
        }
    }
    ToSettings() {
        let result = new map_1.MapSettings();
        result.Name = this.Map.Info.Name;
        result.Desc = this.Map.Info.Desc;
        result.Encoding = this.Map.Encoding;
        return result;
    }
}
exports.MapFile = MapFile;


/***/ }),

/***/ "./src/models/mapperoption.ts":
/*!************************************!*\
  !*** ./src/models/mapperoption.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MapperOptions = void 0;
class MapperOptions {
    constructor() {
        this.MaxExitCost = 0;
        this.MaxTotalCost = 0;
        this.DisableShortcuts = false;
        this.CommandWhitelist = {};
    }
    static New() {
        return new MapperOptions();
    }
    WithMaxExitCost(cost) {
        this.MaxExitCost = cost;
        return this;
    }
    WithMaxTotalCost(cost) {
        this.MaxTotalCost = cost;
        return this;
    }
    WithDisableShortcuts(disable) {
        this.DisableShortcuts = disable;
        return this;
    }
    WithCommandWhitelist(list) {
        list.forEach(cmd => {
            this.CommandWhitelist[cmd] = true;
        });
        return this;
    }
    ClearCommandWhitelist() {
        this.CommandWhitelist = {};
        return this;
    }
    ValidateCommand(cmd) {
        if (Object.keys(this.CommandWhitelist).length === 0) {
            return true;
        }
        return this.CommandWhitelist[cmd] === true;
    }
}
exports.MapperOptions = MapperOptions;


/***/ }),

/***/ "./src/models/marker.ts":
/*!******************************!*\
  !*** ./src/models/marker.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Marker = void 0;
const base_1 = __webpack_require__(/*! ./base */ "./src/models/base.ts");
const formatter_1 = __webpack_require__(/*! ./formatter */ "./src/models/formatter.ts");
class Marker {
    constructor() {
        this.Key = "";
        this.Value = "";
        this.Desc = "";
        this.Group = "";
        this.Message = "";
    }
    static New() {
        return new Marker();
    }
    Validated() {
        return base_1.ItemKey.Validate(this.Key) && this.Value != "";
    }
    Clone() {
        let result = new Marker();
        result.Key = this.Key;
        result.Value = this.Value;
        result.Desc = this.Desc;
        result.Group = this.Group;
        result.Message = this.Message;
        return result;
    }
    Encode() {
        return formatter_1.HMMFormatter.EncodeKeyAndValue(formatter_1.HMMFormatter.Level1, Marker.EncodeKey, formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level1, [
            formatter_1.HMMFormatter.Escape(this.Key), //0
            formatter_1.HMMFormatter.Escape(this.Value), //1
            formatter_1.HMMFormatter.Escape(this.Group), //2
            formatter_1.HMMFormatter.Escape(this.Desc), //3
            formatter_1.HMMFormatter.Escape(this.Message), //4
        ]));
    }
    static Decode(val) {
        let result = new Marker();
        let kv = formatter_1.HMMFormatter.DecodeKeyValue(formatter_1.HMMFormatter.Level1, val);
        let list = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level1, kv.Value);
        result.Key = formatter_1.HMMFormatter.UnescapeAt(list, 0);
        result.Value = formatter_1.HMMFormatter.UnescapeAt(list, 1);
        result.Group = formatter_1.HMMFormatter.UnescapeAt(list, 2);
        result.Desc = formatter_1.HMMFormatter.UnescapeAt(list, 3);
        result.Message = formatter_1.HMMFormatter.UnescapeAt(list, 4);
        return result;
    }
    static Sort(list) {
        list.sort((x, y) => x.Group != y.Group ? (x.Group < y.Group ? -1 : 1) : (x.Key < y.Key ? -1 : 1));
    }
    Filter(val) {
        if (this.Key.includes(val) ||
            this.Value.includes(val) ||
            this.Desc.includes(val) ||
            this.Group.includes(val) ||
            this.Message.includes(val)) {
            return true;
        }
        return false;
    }
    Arrange() { }
    Equal(model) {
        return this.Key === model.Key && this.Value === model.Value && this.Desc === model.Desc && this.Group === model.Group && this.Message === model.Message;
    }
}
exports.Marker = Marker;
Marker.EncodeKey = "Marker";


/***/ }),

/***/ "./src/models/records.ts":
/*!*******************************!*\
  !*** ./src/models/records.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Records = void 0;
const snapshot_1 = __webpack_require__(/*! ./snapshot */ "./src/models/snapshot.ts");
class Records {
    constructor() {
        this.Rooms = {};
        this.Markers = {};
        this.Routes = {};
        this.Traces = {};
        this.Regions = {};
        this.Landmarks = {};
        this.Shortcuts = {};
        this.Variables = {};
        this.Snapshots = [];
    }
    Arrange() {
        snapshot_1.Snapshot.Sort(this.Snapshots);
    }
}
exports.Records = Records;


/***/ }),

/***/ "./src/models/region.ts":
/*!******************************!*\
  !*** ./src/models/region.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Region = void 0;
const base_1 = __webpack_require__(/*! ./base */ "./src/models/base.ts");
const formatter_1 = __webpack_require__(/*! ./formatter */ "./src/models/formatter.ts");
class Region {
    constructor() {
        this.Key = "";
        this.Group = "";
        this.Desc = "";
        this.Message = "";
        this.Items = [];
    }
    static New() { return new Region(); }
    Validated() {
        return base_1.ItemKey.Validate(this.Key);
    }
    Clone() {
        let result = new Region();
        result.Key = this.Key;
        result.Group = this.Group;
        result.Desc = this.Desc;
        result.Items = this.Items.map(d => d.Clone());
        result.Message = this.Message;
        return result;
    }
    Encode() {
        return formatter_1.HMMFormatter.EncodeKeyAndValue(formatter_1.HMMFormatter.Level1, Region.EncodeKey, formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level1, [
            formatter_1.HMMFormatter.Escape(this.Key), //0
            formatter_1.HMMFormatter.Escape(this.Group), //1
            formatter_1.HMMFormatter.Escape(this.Desc), //2
            formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level2, this.Items.map(d => formatter_1.HMMFormatter.EncodeToggleKeyValue(formatter_1.HMMFormatter.Level2, formatter_1.ToggleKeyValue.FromRegionItem(d)))), //3
            formatter_1.HMMFormatter.Escape(this.Message), //4
        ]));
    }
    static Decode(val) {
        let result = new Region();
        let kv = formatter_1.HMMFormatter.DecodeKeyValue(formatter_1.HMMFormatter.Level1, val);
        let list = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level1, kv.Value);
        result.Key = formatter_1.HMMFormatter.UnescapeAt(list, 0);
        result.Group = formatter_1.HMMFormatter.UnescapeAt(list, 1);
        result.Desc = formatter_1.HMMFormatter.UnescapeAt(list, 2);
        result.Items = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level2, formatter_1.HMMFormatter.At(list, 3)).map(d => formatter_1.HMMFormatter.DecodeToggleKeyValue(formatter_1.HMMFormatter.Level2, d).ToRegionItem());
        result.Message = formatter_1.HMMFormatter.UnescapeAt(list, 4);
        return result;
    }
    Arrange() {
    }
    static Sort(list) {
        list.sort((x, y) => x.Group != y.Group ? (x.Group < y.Group ? -1 : 1) : (x.Key < y.Key ? -1 : 1));
    }
    Equal(model) {
        if (this.Key != model.Key)
            return false;
        if (this.Group != model.Group)
            return false;
        if (this.Desc != model.Desc)
            return false;
        if (this.Message != model.Message)
            return false;
        if (this.Items.length != model.Items.length)
            return false;
        for (let i = 0; i < this.Items.length; i++) {
            if (!this.Items[i].Equal(model.Items[i]))
                return false;
        }
        return true;
    }
}
exports.Region = Region;
Region.EncodeKey = "Region";


/***/ }),

/***/ "./src/models/room.ts":
/*!****************************!*\
  !*** ./src/models/room.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Room = exports.RoomFilter = void 0;
const base_1 = __webpack_require__(/*! ./base */ "./src/models/base.ts");
const exit_1 = __webpack_require__(/*! ./exit */ "./src/models/exit.ts");
const formatter_1 = __webpack_require__(/*! ./formatter */ "./src/models/formatter.ts");
class RoomFilter {
    constructor() {
        this.RoomConditions = [];
        this.HasAnyExitTo = [];
        this.HasAnyData = [];
        this.HasAnyName = [];
        this.HasAnyGroup = [];
        this.ContainsAnyData = [];
        this.ContainsAnyName = [];
        this.ContainsAnyKey = [];
    }
    static New() {
        return new RoomFilter();
    }
    ValidateHasAnyData(room) {
        if (this.HasAnyData.length > 0) {
            for (let data of this.HasAnyData) {
                if (room.GetData(data.Key) === data.Value) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }
    ValidateHasAnyName(room) {
        if (this.HasAnyName.length > 0) {
            for (let data of this.HasAnyName) {
                if (room.Name === data) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }
    ValidateHasAnyGroup(room) {
        if (this.HasAnyGroup.length > 0) {
            for (let data of this.HasAnyGroup) {
                if (room.Group === data) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }
    ValidateContainsAnyData(room) {
        if (this.ContainsAnyData.length > 0) {
            for (let data of this.ContainsAnyData) {
                if (room.GetData(data.Key).includes(data.Value)) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }
    ValidateContainsAnyName(room) {
        if (this.ContainsAnyName.length > 0) {
            for (let name of this.ContainsAnyName) {
                if (room.Name.includes(name)) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }
    ValidateContainsAnyKey(room) {
        if (this.ContainsAnyKey.length > 0) {
            for (let key of this.ContainsAnyKey) {
                if (room.Key.includes(key)) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }
    ValidateHasAnyExitTo(room) {
        if (this.HasAnyExitTo.length > 0) {
            for (let to of this.HasAnyExitTo) {
                if (room.HasExitTo(to)) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }
    Validate(room) {
        if (this.RoomConditions.length > 0) {
            if (!base_1.ValueTag.ValidateConditions(room.Tags, this.RoomConditions)) {
                return false;
            }
        }
        if (!this.ValidateHasAnyExitTo(room)) {
            return false;
        }
        if (!this.ValidateHasAnyName(room)) {
            return false;
        }
        if (!this.ValidateHasAnyGroup(room)) {
            return false;
        }
        if (!this.ValidateContainsAnyData(room)) {
            return false;
        }
        if (!this.ValidateHasAnyData(room)) {
            return false;
        }
        if (!this.ValidateContainsAnyName(room)) {
            return false;
        }
        if (!this.ValidateContainsAnyKey(room)) {
            return false;
        }
        return true;
    }
}
exports.RoomFilter = RoomFilter;
//房间的数据结构
class Room {
    constructor() {
        this.Key = "";
        //房间的名称，显示用
        this.Name = "";
        //房间的描述，显示用
        this.Desc = "";
        //房间的区域，筛选用
        this.Group = "";
        //标签列表，筛选用
        this.Tags = [];
        //房间出口列表
        this.Exits = [];
        this.Data = [];
    }
    Validated() {
        return base_1.ItemKey.Validate(this.Key);
    }
    static New() { return new Room(); }
    ;
    Clone() {
        let result = new Room();
        result.Key = this.Key;
        result.Name = this.Name;
        result.Group = this.Group;
        result.Desc = this.Desc;
        result.Tags = [...this.Tags];
        result.Exits = this.Exits.map(e => e.Clone());
        result.Data = this.Data.map(d => d.Clone());
        return result;
    }
    Encode() {
        return formatter_1.HMMFormatter.EncodeKeyAndValue(formatter_1.HMMFormatter.Level1, Room.EncodeKey, formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level1, [
            formatter_1.HMMFormatter.Escape(this.Key), //0
            formatter_1.HMMFormatter.Escape(this.Name), //1
            formatter_1.HMMFormatter.Escape(this.Group), //2
            formatter_1.HMMFormatter.Escape(this.Desc), //3
            formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level2, this.Tags.map(e => formatter_1.HMMFormatter.EncodeKeyValue(formatter_1.HMMFormatter.Level3, formatter_1.KeyValue.FromValueTag(e)))), //4
            formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level2, this.Exits.map(//5
            //5
            e => formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level3, [
                formatter_1.HMMFormatter.Escape(e.Command), //5-0
                formatter_1.HMMFormatter.Escape(e.To), //5-1
                formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level4, e.Conditions.map(c => formatter_1.HMMFormatter.EncodeToggleKeyValue(formatter_1.HMMFormatter.Level5, formatter_1.ToggleKeyValue.FromValueCondition(c)))), //5-2
                formatter_1.HMMFormatter.Escape(formatter_1.HMMFormatter.Escape(e.Cost.toString())), //5-4
            ]))),
            formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level2, //6
            this.Data.map(d => formatter_1.HMMFormatter.EncodeKeyValue(formatter_1.HMMFormatter.Level3, formatter_1.KeyValue.FromData(d)))),
        ]));
    }
    static Sort(list) {
        list.sort((x, y) => x.Group != y.Group ? (x.Group < y.Group ? -1 : 1) : (x.Key < y.Key ? -1 : 1));
    }
    static Decode(val) {
        let result = new Room();
        let kv = formatter_1.HMMFormatter.DecodeKeyValue(formatter_1.HMMFormatter.Level1, val);
        let list = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level1, kv.Value);
        result.Key = formatter_1.HMMFormatter.UnescapeAt(list, 0);
        result.Name = formatter_1.HMMFormatter.UnescapeAt(list, 1);
        result.Group = formatter_1.HMMFormatter.UnescapeAt(list, 2);
        result.Desc = formatter_1.HMMFormatter.UnescapeAt(list, 3);
        result.Tags = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level2, formatter_1.HMMFormatter.At(list, 4)).map(e => formatter_1.HMMFormatter.DecodeKeyValue(formatter_1.HMMFormatter.Level3, e).ToValueTag());
        result.Exits = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level2, formatter_1.HMMFormatter.At(list, 5)).map(d => {
            let list = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level3, d);
            let exit = new exit_1.Exit();
            exit.Command = formatter_1.HMMFormatter.UnescapeAt(list, 0);
            exit.To = formatter_1.HMMFormatter.UnescapeAt(list, 1);
            exit.Conditions = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level4, formatter_1.HMMFormatter.At(list, 2)).map(e => formatter_1.HMMFormatter.DecodeToggleKeyValue(formatter_1.HMMFormatter.Level5, e).ToValueCondition());
            exit.Cost = formatter_1.HMMFormatter.UnescapeInt(formatter_1.HMMFormatter.At(list, 3), 0);
            return exit;
        });
        result.Data = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level2, formatter_1.HMMFormatter.At(list, 6)).map(d => formatter_1.HMMFormatter.DecodeKeyValue(formatter_1.HMMFormatter.Level3, d).ToData());
        return result;
    }
    HasTag(key, value) {
        return base_1.ValueTag.HasTag(this.Tags, key, value);
    }
    GetData(key) {
        for (let data of this.Data) {
            if (data.Key == key) {
                return data.Value;
            }
        }
        return "";
    }
    HasExitTo(key) {
        for (let exit of this.Exits) {
            if (exit.To == key) {
                return true;
            }
        }
        return false;
    }
    DoAddData(rd) {
        this.Data = this.Data.filter((d) => d.Key !== rd.Key);
        if (rd.Value != "") {
            this.Data.push(rd);
        }
    }
    SetData(rd) {
        this.DoAddData(rd);
        this.Arrange();
    }
    SetDatas(list) {
        for (let rd of list) {
            this.DoAddData(rd);
        }
        this.Arrange();
    }
    Arrange() {
        this.Data.sort((x, y) => (x.Key < y.Key ? -1 : 1));
        this.Tags.sort((x, y) => (x.Key < y.Key ? -1 : 1));
        this.Exits.forEach(e => e.Arrange());
    }
    Equal(model) {
        if (this.Key !== model.Key ||
            this.Name !== model.Name ||
            this.Group !== model.Group ||
            this.Desc !== model.Desc) {
            return false;
        }
        if (this.Exits.length !== model.Exits.length) {
            return false;
        }
        for (let i = 0; i < this.Exits.length; i++) {
            if (!this.Exits[i].Equal(model.Exits[i])) {
                return false;
            }
        }
        if (this.Tags.length !== model.Tags.length) {
            return false;
        }
        for (let i = 0; i < this.Tags.length; i++) {
            if (!this.Tags[i].Equal(model.Tags[i])) {
                return false;
            }
        }
        if (this.Data.length !== model.Data.length) {
            return false;
        }
        for (let i = 0; i < this.Data.length; i++) {
            if (!this.Data[i].Equal(model.Data[i])) {
                return false;
            }
        }
        return true;
    }
}
exports.Room = Room;
Room.EncodeKey = "Room";


/***/ }),

/***/ "./src/models/route.ts":
/*!*****************************!*\
  !*** ./src/models/route.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Route = void 0;
const base_1 = __webpack_require__(/*! ./base */ "./src/models/base.ts");
const formatter_1 = __webpack_require__(/*! ./formatter */ "./src/models/formatter.ts");
class Route {
    constructor() {
        this.Key = "";
        this.Desc = "";
        this.Group = "";
        this.Message = "";
        this.Rooms = [];
    }
    static New() {
        return new Route();
    }
    Validated() {
        return base_1.ItemKey.Validate(this.Key);
    }
    Encode() {
        return formatter_1.HMMFormatter.EncodeKeyAndValue(formatter_1.HMMFormatter.Level1, Route.EncodeKey, formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level1, [
            formatter_1.HMMFormatter.Escape(this.Key), //0
            formatter_1.HMMFormatter.Escape(this.Group), //1
            formatter_1.HMMFormatter.Escape(this.Desc), //2
            formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level2, this.Rooms.map(d => formatter_1.HMMFormatter.Escape(d))), //3
            formatter_1.HMMFormatter.Escape(this.Message), //4
        ]));
    }
    static Decode(val) {
        let result = new Route();
        let kv = formatter_1.HMMFormatter.DecodeKeyValue(formatter_1.HMMFormatter.Level1, val);
        let list = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level1, kv.Value);
        result.Key = formatter_1.HMMFormatter.UnescapeAt(list, 0);
        result.Group = formatter_1.HMMFormatter.UnescapeAt(list, 1);
        result.Desc = formatter_1.HMMFormatter.UnescapeAt(list, 2);
        result.Rooms = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level2, formatter_1.HMMFormatter.At(list, 3)).map(d => formatter_1.HMMFormatter.Unescape(d));
        result.Message = formatter_1.HMMFormatter.UnescapeAt(list, 4);
        return result;
    }
    Clone() {
        let result = new Route();
        result.Key = this.Key;
        result.Rooms = [...this.Rooms];
        result.Group = this.Group;
        result.Desc = this.Desc;
        result.Message = this.Message;
        return result;
    }
    Arrange() {
    }
    static Sort(list) {
        list.sort((x, y) => x.Group != y.Group ? (x.Group < y.Group ? -1 : 1) : (x.Key < y.Key ? -1 : 1));
    }
    Equal(model) {
        if (this.Key !== model.Key || this.Desc !== model.Desc || this.Group !== model.Group || this.Message !== model.Message) {
            return false;
        }
        if (this.Rooms.length != model.Rooms.length) {
            return false;
        }
        for (let i = 0; i < this.Rooms.length; i++) {
            if (this.Rooms[i] !== model.Rooms[i]) {
                return false;
            }
        }
        return true;
    }
}
exports.Route = Route;
Route.EncodeKey = "Route";


/***/ }),

/***/ "./src/models/shortcut.ts":
/*!********************************!*\
  !*** ./src/models/shortcut.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Shortcut = exports.RoomConditionExit = void 0;
const exit_1 = __webpack_require__(/*! ./exit */ "./src/models/exit.ts");
const base_1 = __webpack_require__(/*! ./base */ "./src/models/base.ts");
const formatter_1 = __webpack_require__(/*! ./formatter */ "./src/models/formatter.ts");
class RoomConditionExit extends exit_1.Exit {
    constructor() {
        super(...arguments);
        this.RoomConditions = [];
    }
    static New() {
        return new RoomConditionExit();
    }
}
exports.RoomConditionExit = RoomConditionExit;
class Shortcut extends RoomConditionExit {
    constructor() {
        super(...arguments);
        this.Key = "";
        this.Group = "";
        this.Desc = "";
    }
    static New() {
        return new Shortcut();
    }
    Validated() {
        return base_1.ItemKey.Validate(this.Key) && super.Validated();
    }
    Clone() {
        let result = new Shortcut();
        result.Key = this.Key;
        result.Command = this.Command;
        result.To = this.To;
        result.RoomConditions = this.RoomConditions.map(d => d.Clone());
        result.Conditions = this.Conditions.map(d => d.Clone());
        result.Cost = this.Cost;
        result.Group = this.Group;
        result.Desc = this.Desc;
        return result;
    }
    Encode() {
        return formatter_1.HMMFormatter.EncodeKeyAndValue(formatter_1.HMMFormatter.Level1, Shortcut.EncodeKey, formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level1, [
            formatter_1.HMMFormatter.Escape(this.Key), //0
            formatter_1.HMMFormatter.Escape(this.Group), //1
            formatter_1.HMMFormatter.Escape(this.Desc), //2
            formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level2, this.RoomConditions.map(d => formatter_1.HMMFormatter.EncodeToggleKeyValue(formatter_1.HMMFormatter.Level3, formatter_1.ToggleKeyValue.FromValueCondition(d)))), //3
            formatter_1.HMMFormatter.Escape(this.Command), //4
            formatter_1.HMMFormatter.Escape(this.To), //5
            formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level2, this.Conditions.map(d => formatter_1.HMMFormatter.EncodeToggleKeyValue(formatter_1.HMMFormatter.Level3, formatter_1.ToggleKeyValue.FromValueCondition(d)))), //6
            formatter_1.HMMFormatter.Escape(formatter_1.HMMFormatter.Escape(this.Cost.toString())), //7
        ]));
    }
    static Decode(val) {
        let result = new Shortcut();
        let kv = formatter_1.HMMFormatter.DecodeKeyValue(formatter_1.HMMFormatter.Level1, val);
        let list = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level1, kv.Value);
        result.Key = formatter_1.HMMFormatter.UnescapeAt(list, 0);
        result.Group = formatter_1.HMMFormatter.UnescapeAt(list, 1);
        result.Desc = formatter_1.HMMFormatter.UnescapeAt(list, 2);
        result.RoomConditions = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level2, formatter_1.HMMFormatter.At(list, 3)).map(d => formatter_1.HMMFormatter.DecodeToggleKeyValue(formatter_1.HMMFormatter.Level3, d).ToValueCondition());
        result.Command = formatter_1.HMMFormatter.UnescapeAt(list, 4);
        result.To = formatter_1.HMMFormatter.UnescapeAt(list, 5);
        result.Conditions = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level2, formatter_1.HMMFormatter.At(list, 6)).map(d => formatter_1.HMMFormatter.DecodeToggleKeyValue(formatter_1.HMMFormatter.Level3, d).ToValueCondition());
        result.Cost = formatter_1.HMMFormatter.UnescapeIntAt(list, 7, 0);
        return result;
    }
    Equal(model) {
        if (this.Key !== model.Key || this.Command !== model.Command || this.To !== model.To || this.Group !== model.Group || this.Desc !== model.Desc || this.Cost !== model.Cost) {
            return false;
        }
        if (this.RoomConditions.length != model.RoomConditions.length) {
            return false;
        }
        for (let i = 0; i < this.RoomConditions.length; i++) {
            if (!this.RoomConditions[i].Equal(model.RoomConditions[i])) {
                return false;
            }
        }
        if (this.Conditions.length != model.Conditions.length) {
            return false;
        }
        for (let i = 0; i < this.Conditions.length; i++) {
            if (!this.Conditions[i].Equal(model.Conditions[i])) {
                return false;
            }
        }
        return true;
    }
    Arrange() {
        super.Arrange();
        this.RoomConditions.sort(((x, y) => {
            if (x.Not == y.Not) {
                return x.Key < y.Key ? -1 : 1;
            }
            else {
                return x.Not < y.Not ? -1 : 1;
            }
        }));
    }
    static Sort(list) {
        list.sort((x, y) => x.Group != y.Group ? (x.Group < y.Group ? -1 : 1) : x.Key < y.Key ? -1 : 1);
    }
}
exports.Shortcut = Shortcut;
Shortcut.EncodeKey = "Shortcut";


/***/ }),

/***/ "./src/models/snapshot.ts":
/*!********************************!*\
  !*** ./src/models/snapshot.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Snapshot = exports.SnapshotKey = void 0;
const uniquekeyutil_1 = __webpack_require__(/*! ../utils/uniquekeyutil */ "./src/utils/uniquekeyutil.ts");
const base_1 = __webpack_require__(/*! ./base */ "./src/models/base.ts");
const formatter_1 = __webpack_require__(/*! ./formatter */ "./src/models/formatter.ts");
const timestamp_1 = __webpack_require__(/*! @include/timestamp */ "./include/timestamp.ts");
class SnapshotKey {
    constructor(key, type, value) {
        this.Key = "";
        this.Type = "";
        this.Value = "";
        this.Key = key;
        this.Type = type;
        this.Value = value;
    }
    static New(key, type, value) {
        return new SnapshotKey(key, type, value);
    }
    ToString() {
        return uniquekeyutil_1.UniqueKeyUtil.Join([this.Key, this.Type, this.Value]);
    }
    Equal(model) {
        if (this.Key === model.Key && this.Type === model.Type && this.Value === model.Value) {
            return true;
        }
        return false;
    }
}
exports.SnapshotKey = SnapshotKey;
class Snapshot {
    constructor() {
        this.Key = "";
        this.Timestamp = 0;
        this.Group = "";
        this.Type = "";
        this.Count = 1;
        this.Value = "";
    }
    static New() {
        return new Snapshot();
    }
    static Create(key, type, value, group) {
        let result = new Snapshot();
        result.Key = key;
        result.Type = type;
        result.Value = value;
        result.Timestamp = timestamp_1.Timestamp.Now();
        result.Group = group;
        return result;
    }
    Validated() {
        return base_1.ItemKey.Validate(this.Key);
    }
    Encode() {
        return formatter_1.HMMFormatter.EncodeKeyAndValue(formatter_1.HMMFormatter.Level1, Snapshot.EncodeKey, formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level1, [
            formatter_1.HMMFormatter.Escape(this.Key), //0
            formatter_1.HMMFormatter.Escape(this.Type), //1
            formatter_1.HMMFormatter.Escape(this.Value), //2
            formatter_1.HMMFormatter.Escape(this.Group), //3
            formatter_1.HMMFormatter.Escape(this.Timestamp.toString()), //4
            formatter_1.HMMFormatter.Escape(this.Count.toString()), //5
        ]));
    }
    static Decode(val) {
        let result = new Snapshot();
        let kv = formatter_1.HMMFormatter.DecodeKeyValue(formatter_1.HMMFormatter.Level1, val);
        let list = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level1, kv.Value);
        result.Key = formatter_1.HMMFormatter.UnescapeAt(list, 0);
        result.Type = formatter_1.HMMFormatter.UnescapeAt(list, 1);
        result.Value = formatter_1.HMMFormatter.UnescapeAt(list, 2);
        result.Group = formatter_1.HMMFormatter.UnescapeAt(list, 3);
        result.Timestamp = formatter_1.HMMFormatter.UnescapeIntAt(list, 4, 0);
        result.Count = formatter_1.HMMFormatter.UnescapeIntAt(list, 5, 1);
        return result;
    }
    Clone() {
        let result = new Snapshot();
        result.Key = this.Key;
        result.Timestamp = this.Timestamp;
        result.Group = this.Group;
        result.Type = this.Type;
        result.Value = this.Value;
        result.Count = this.Count;
        return result;
    }
    Equal(model) {
        if (this.Key === model.Key && this.Type === model.Type && this.Value === model.Value && this.Group === model.Group && this.Timestamp === model.Timestamp && this.Count === model.Count) {
            return true;
        }
        return false;
    }
    Arrange() {
    }
    static Sort(list) {
        list.sort((x, y) => x.Group != y.Group ? (x.Group < y.Group ? -1 : 1) : (x.Key != y.Key ? (x.Key < y.Key ? -1 : 1) : (x.Timestamp != y.Timestamp ? (x.Timestamp < y.Timestamp ? -1 : 1) : (x.Type != y.Type ? (x.Type < y.Type ? -1 : 1) : (x.Value < y.Value ? -1 : 1)))));
    }
    UniqueKey() {
        return new SnapshotKey(this.Key, this.Type, this.Value);
    }
    Repeat() {
        this.Count++;
    }
}
exports.Snapshot = Snapshot;
Snapshot.EncodeKey = "Snapshot";


/***/ }),

/***/ "./src/models/snapshotsearchresult.ts":
/*!********************************************!*\
  !*** ./src/models/snapshotsearchresult.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SnapshotSearchResult = exports.SnapshotSearch = exports.SnapshotFilter = void 0;
class SnapshotFilter {
    constructor(key, type, group) {
        this.MaxCount = 0;
        this.Key = key;
        this.Type = type;
        this.Group = group;
    }
    static New(key, type, group) {
        return new SnapshotFilter(key, type, group);
    }
    WithMaxCount(count) {
        this.MaxCount = count;
        return this;
    }
    Validate(model) {
        if (this.Key !== null && model.Key !== this.Key) {
            return false;
        }
        if (this.Type !== null && model.Type !== this.Type) {
            return false;
        }
        if (this.Group !== null && model.Group !== this.Group) {
            return false;
        }
        if (this.MaxCount > 0 && model.Count > this.MaxCount) {
            return false;
        }
        return true;
    }
}
exports.SnapshotFilter = SnapshotFilter;
class SnapshotSearch {
    constructor() {
        this.Type = null;
        this.Group = null;
        this.Keywords = [];
        this.PartialMatch = true;
        this.Any = false;
        this.MaxNoise = 0;
    }
    static New() {
        return new SnapshotSearch();
    }
    match(keyword, model) {
        if (this.PartialMatch) {
            return model.Value.includes(keyword);
        }
        else {
            return model.Value === keyword;
        }
    }
    Validate(model) {
        if (this.Type !== null && model.Type !== this.Type) {
            return false;
        }
        if (this.Group !== null && model.Group !== this.Group) {
            return false;
        }
        if (this.Keywords.length === 0) {
            return true;
        }
        let noise = 0;
        for (let keyword of this.Keywords) {
            if (keyword !== "") {
                if (this.match(keyword, model) == this.Any) {
                    if (!this.Any) {
                        //在完全匹配时，只有噪音超过允许的最大值才验证失败。
                        noise++;
                        if (noise > this.MaxNoise) {
                            return false;
                        }
                    }
                    else {
                        return true;
                    }
                }
            }
        }
        return !this.Any;
    }
}
exports.SnapshotSearch = SnapshotSearch;
class SnapshotSearchResult {
    constructor() {
        this.Key = "";
        this.Sum = 0;
        this.Count = 0;
        this.Items = [];
    }
    static New() {
        return new SnapshotSearchResult();
    }
    Add(model, match) {
        this.Sum += model.Count;
        if (match) {
            this.Items.push(model);
            this.Count += model.Count;
        }
    }
}
exports.SnapshotSearchResult = SnapshotSearchResult;


/***/ }),

/***/ "./src/models/step.ts":
/*!****************************!*\
  !*** ./src/models/step.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QueryResult = exports.Step = void 0;
class Step {
    constructor(command, target, cost) {
        this.Command = command;
        this.Target = target;
        this.Cost = cost;
    }
    static New(command, target, cost) {
        return new Step(command, target, cost);
    }
    static JoinCommands(sep, steps) {
        return steps.map(x => x.Command).join(sep);
    }
}
exports.Step = Step;
class QueryResult {
    constructor() {
        this.From = "";
        this.To = "";
        this.Cost = 0;
        this.Steps = [];
        this.Unvisited = [];
    }
    static New() {
        return new QueryResult();
    }
    IsSuccess() {
        return this.From !== "" && this.To !== "";
    }
    SuccessOrNull() {
        if (this.IsSuccess()) {
            return this;
        }
        return null;
    }
}
exports.QueryResult = QueryResult;
QueryResult.Fail = new QueryResult();


/***/ }),

/***/ "./src/models/trace.ts":
/*!*****************************!*\
  !*** ./src/models/trace.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Trace = void 0;
const base_1 = __webpack_require__(/*! ./base */ "./src/models/base.ts");
const formatter_1 = __webpack_require__(/*! ./formatter */ "./src/models/formatter.ts");
class Trace {
    constructor() {
        this.Key = "";
        this.Group = "";
        this.Desc = "";
        this.Message = "";
        this.Locations = [];
    }
    static New() { return new Trace(); }
    Clone() {
        let result = new Trace();
        result.Key = this.Key;
        result.Locations = [...this.Locations];
        result.Desc = this.Desc;
        result.Group = this.Group;
        result.Message = this.Message;
        return result;
    }
    Validated() {
        return base_1.ItemKey.Validate(this.Key);
    }
    Encode() {
        return formatter_1.HMMFormatter.EncodeKeyAndValue(formatter_1.HMMFormatter.Level1, Trace.EncodeKey, formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level1, [
            formatter_1.HMMFormatter.Escape(this.Key), //0
            formatter_1.HMMFormatter.Escape(this.Group), //1
            formatter_1.HMMFormatter.Escape(this.Desc), //2
            formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level2, this.Locations.map(formatter_1.HMMFormatter.Escape)), //3
            formatter_1.HMMFormatter.Escape(this.Message), //4
        ]));
    }
    static Decode(val) {
        let result = new Trace();
        let kv = formatter_1.HMMFormatter.DecodeKeyValue(formatter_1.HMMFormatter.Level1, val);
        let list = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level1, kv.Value);
        result.Key = formatter_1.HMMFormatter.UnescapeAt(list, 0);
        result.Group = formatter_1.HMMFormatter.UnescapeAt(list, 1);
        result.Desc = formatter_1.HMMFormatter.UnescapeAt(list, 2);
        result.Locations = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level2, formatter_1.HMMFormatter.At(list, 3)).map(formatter_1.HMMFormatter.Unescape);
        result.Message = formatter_1.HMMFormatter.UnescapeAt(list, 4);
        return result;
    }
    static Sort(list) {
        list.sort((x, y) => x.Group != y.Group ? (x.Group < y.Group ? -1 : 1) : (x.Key < y.Key ? -1 : 1));
    }
    Arrange() {
        this.Locations.sort((x, y) => x < y ? -1 : 1);
    }
    RemoveLocations(loctions) {
        for (let l of loctions) {
            this.Locations = this.Locations.filter(d => d !== l);
        }
    }
    AddLocations(loctions) {
        for (let l of loctions) {
            if (l != "") {
                this.Locations = this.Locations.filter(d => d !== l);
                this.Locations.push(l);
            }
        }
        this.Arrange();
    }
    Equal(model) {
        if (this.Key !== model.Key ||
            this.Desc !== model.Desc ||
            this.Group !== model.Group ||
            this.Message !== model.Message) {
            return false;
        }
        if (this.Locations.length != model.Locations.length) {
            return false;
        }
        for (let i = 0; i < this.Locations.length; i++) {
            if (this.Locations[i] != model.Locations[i]) {
                return false;
            }
        }
        return true;
    }
}
exports.Trace = Trace;
Trace.EncodeKey = "Trace";


/***/ }),

/***/ "./src/models/variable.ts":
/*!********************************!*\
  !*** ./src/models/variable.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Variable = void 0;
const base_1 = __webpack_require__(/*! ./base */ "./src/models/base.ts");
const formatter_1 = __webpack_require__(/*! ./formatter */ "./src/models/formatter.ts");
class Variable {
    constructor() {
        this.Key = "";
        this.Value = "";
        this.Group = "";
        this.Desc = "";
    }
    static New() { return new Variable(); }
    Validated() {
        return base_1.ItemKey.Validate(this.Key);
    }
    Encode() {
        return formatter_1.HMMFormatter.EncodeKeyAndValue(formatter_1.HMMFormatter.Level1, Variable.EncodeKey, formatter_1.HMMFormatter.EncodeList(formatter_1.HMMFormatter.Level1, [
            formatter_1.HMMFormatter.Escape(this.Key), //0
            formatter_1.HMMFormatter.Escape(this.Value), //1
            formatter_1.HMMFormatter.Escape(this.Group), //2
            formatter_1.HMMFormatter.Escape(this.Desc), //3
        ]));
    }
    static Decode(val) {
        let result = new Variable();
        let kv = formatter_1.HMMFormatter.DecodeKeyValue(formatter_1.HMMFormatter.Level1, val);
        let list = formatter_1.HMMFormatter.DecodeList(formatter_1.HMMFormatter.Level1, kv.Value);
        result.Key = formatter_1.HMMFormatter.UnescapeAt(list, 0);
        result.Value = formatter_1.HMMFormatter.UnescapeAt(list, 1);
        result.Group = formatter_1.HMMFormatter.UnescapeAt(list, 2);
        result.Desc = formatter_1.HMMFormatter.UnescapeAt(list, 3);
        return result;
    }
    Clone() {
        let result = new Variable();
        result.Key = this.Key;
        result.Value = this.Value;
        result.Group = this.Group;
        result.Desc = this.Desc;
        return result;
    }
    Equal(model) {
        if (this.Key === model.Key && this.Value === model.Value && this.Group === model.Group && this.Desc === model.Desc) {
            return true;
        }
        return false;
    }
    Arrange() { }
    static Sort(list) {
        list.sort((x, y) => x.Group != y.Group ? (x.Group < y.Group ? -1 : 1) : (x.Key < y.Key ? -1 : 1));
    }
}
exports.Variable = Variable;
Variable.EncodeKey = "Variable";


/***/ }),

/***/ "./src/utils/controlcode/controlcode.ts":
/*!**********************************************!*\
  !*** ./src/utils/controlcode/controlcode.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports) => {


//简易的带控制码的字符串转换类
//共有3个状态
//1.转义字符串，用于储存。用于人工读写的格式。
//2.控制码字符串，用于根据控制码进行附加操作，用于根据控制码进行操作。
//3.原始字符串，实际使用的字符串，代码中使用的实际业务格式。
//字符串共有3种操作
//Escape:原生字符串到转义字符串，a=>\a.对应Unescape
//Unpack:编码:转义字符串=>控制码字符串,\a=>%61对应Pack
//Decode:控制码到原生字符串,%61=>a,对应Encode
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ControlCode = exports.Command = void 0;
//命令实例，包含原始字符串，原始代码字符串和转义字符串。
//为了避免不可预期表现，原始代码字符串应该有独立的取值空间，不会被raw和escaped中使用。
class Command {
    constructor(raw, rawcode, escaped) {
        this.Raw = raw;
        this.EncodedCode = ControlCode.EncodeCommand(rawcode);
        this.Escaped = escaped;
        this.Encoded = ControlCode.PreEscape(raw);
    }
    static New(raw, rawcode, escaped) {
        return new Command(raw, rawcode, escaped);
    }
}
exports.Command = Command;
class ControlCode {
    constructor() {
        this.Commands = [];
    }
    static New() {
        return new ControlCode();
    }
    static PreEscape(val) {
        return val.replaceAll(ControlCode.CodeEscape, ControlCode.EncodedEscape).replaceAll(ControlCode.CodeEnd, ControlCode.EncodedEnd).replaceAll(ControlCode.CodeStart, ControlCode.EncodedStart);
    }
    static PreUnescape(val) {
        return val.replaceAll(ControlCode.EncodedStart, ControlCode.CodeStart).replaceAll(ControlCode.EncodedEnd, ControlCode.CodeEnd).replaceAll(ControlCode.EncodedEscape, ControlCode.CodeEscape);
    }
    static EncodeCommand(val) {
        return ControlCode.CodeStart + ControlCode.PreEscape(val) + ControlCode.CodeEnd;
    }
    WithCommand(command) {
        this.Commands.push(command);
        return this;
    }
    Encode(val) {
        val = ControlCode.PreEscape(val);
        for (let i = 0; i < this.Commands.length; i++) {
            let c = this.Commands[i];
            if (c.Encoded !== c.EncodedCode && c.Encoded !== "") {
                val = val.replaceAll(c.Encoded, c.EncodedCode);
            }
        }
        return val;
    }
    Decode(val) {
        for (let i = 0; i < this.Commands.length; i++) {
            let c = this.Commands[i];
            if (c.Raw !== c.EncodedCode && c.EncodedCode !== "") {
                val = val.replaceAll(c.EncodedCode, c.Encoded);
            }
        }
        val = ControlCode.PreUnescape(val);
        return val;
    }
    Pack(val) {
        for (let i = 0; i < this.Commands.length; i++) {
            let c = this.Commands[i];
            if (c.EncodedCode !== c.Escaped && c.EncodedCode !== "") {
                val = val.replaceAll(c.EncodedCode, c.Escaped);
            }
        }
        val = ControlCode.PreUnescape(val);
        return val;
    }
    Unpack(val) {
        val = ControlCode.PreEscape(val);
        for (let i = 0; i < this.Commands.length; i++) {
            let c = this.Commands[i];
            if (c.EncodedCode !== c.Escaped && c.Escaped !== "") {
                val = val.replaceAll(c.Escaped, c.EncodedCode);
            }
        }
        return val;
    }
    Escape(val) {
        val = this.Encode(val);
        val = this.Pack(val);
        return val;
    }
    Unescape(val) {
        val = this.Unpack(val);
        val = this.Decode(val);
        return val;
    }
}
exports.ControlCode = ControlCode;
//指令开始字符
ControlCode.CodeStart = "\x02";
//指令结束字符
ControlCode.CodeEnd = "\x03";
//指令开始/结束转义字符
ControlCode.CodeEscape = "\x04";
ControlCode.EncodedEscape = "\x04\x04";
ControlCode.EncodedStart = "\x04\x05";
ControlCode.EncodedEnd = "\x04\x06";


/***/ }),

/***/ "./src/utils/uniquekeyutil.ts":
/*!************************************!*\
  !*** ./src/utils/uniquekeyutil.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UniqueKeyUtil = void 0;
class UniqueKeyUtil {
    static Escape(val) {
        return val.replaceAll(UniqueKeyUtil.EscapeToken, UniqueKeyUtil.EscapedEscapeToken).replaceAll("\n", UniqueKeyUtil.EscapedSep);
    }
    static Join(str) {
        let escaped = str.map(s => UniqueKeyUtil.Escape(s));
        return escaped.join("\n");
    }
}
exports.UniqueKeyUtil = UniqueKeyUtil;
UniqueKeyUtil.EscapedSep = "\x1B1";
UniqueKeyUtil.EscapeToken = "\x1B";
UniqueKeyUtil.EscapedEscapeToken = "\x1B0";


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DefaultHmmEncoderHooks = exports.MapHeadData = exports.HMMEncoder = exports.MapperOptions = exports.SnapshotSearch = exports.SnapshotSearchResult = exports.SnapshotFilter = exports.QueryResult = exports.Step = exports.UniqueKeyUtil = exports.Environment = exports.CommandCost = exports.Link = exports.Path = exports.Context = exports.Records = exports.MapFile = exports.MapSettings = exports.MapEncoding = exports.MapInfo = exports.Map = exports.Command = exports.ControlCode = exports.SnapshotKey = exports.Snapshot = exports.Variable = exports.RoomConditionExit = exports.Shortcut = exports.Landmark = exports.LandmarkKey = exports.Region = exports.Trace = exports.Route = exports.RoomFilter = exports.Room = exports.Marker = exports.Exit = exports.ItemKey = exports.ToggleKeyValues = exports.ToggleValue = exports.KeyValue = exports.ToggleKeyValue = exports.HMMFormatter = exports.RegionItem = exports.RegionItemType = exports.Data = exports.TypedConditions = exports.ValueCondition = exports.ValueTag = exports.Condition = void 0;
exports.SnapshotHelper = exports.APIListOption = exports.MapDatabase = exports.WalkingStep = exports.Walking = exports.Mapper = void 0;
const base_1 = __webpack_require__(/*! ./models/base */ "./src/models/base.ts");
Object.defineProperty(exports, "Condition", ({ enumerable: true, get: function () { return base_1.Condition; } }));
Object.defineProperty(exports, "ValueTag", ({ enumerable: true, get: function () { return base_1.ValueTag; } }));
Object.defineProperty(exports, "ValueCondition", ({ enumerable: true, get: function () { return base_1.ValueCondition; } }));
Object.defineProperty(exports, "TypedConditions", ({ enumerable: true, get: function () { return base_1.TypedConditions; } }));
Object.defineProperty(exports, "Data", ({ enumerable: true, get: function () { return base_1.Data; } }));
Object.defineProperty(exports, "RegionItemType", ({ enumerable: true, get: function () { return base_1.RegionItemType; } }));
Object.defineProperty(exports, "RegionItem", ({ enumerable: true, get: function () { return base_1.RegionItem; } }));
const formatter_1 = __webpack_require__(/*! ./models/formatter */ "./src/models/formatter.ts");
Object.defineProperty(exports, "HMMFormatter", ({ enumerable: true, get: function () { return formatter_1.HMMFormatter; } }));
Object.defineProperty(exports, "ToggleKeyValue", ({ enumerable: true, get: function () { return formatter_1.ToggleKeyValue; } }));
Object.defineProperty(exports, "KeyValue", ({ enumerable: true, get: function () { return formatter_1.KeyValue; } }));
Object.defineProperty(exports, "ToggleValue", ({ enumerable: true, get: function () { return formatter_1.ToggleValue; } }));
Object.defineProperty(exports, "ToggleKeyValues", ({ enumerable: true, get: function () { return formatter_1.ToggleKeyValues; } }));
const base_2 = __webpack_require__(/*! ./models/base */ "./src/models/base.ts");
Object.defineProperty(exports, "ItemKey", ({ enumerable: true, get: function () { return base_2.ItemKey; } }));
const exit_1 = __webpack_require__(/*! ./models/exit */ "./src/models/exit.ts");
Object.defineProperty(exports, "Exit", ({ enumerable: true, get: function () { return exit_1.Exit; } }));
const marker_1 = __webpack_require__(/*! ./models/marker */ "./src/models/marker.ts");
Object.defineProperty(exports, "Marker", ({ enumerable: true, get: function () { return marker_1.Marker; } }));
const room_1 = __webpack_require__(/*! ./models/room */ "./src/models/room.ts");
Object.defineProperty(exports, "Room", ({ enumerable: true, get: function () { return room_1.Room; } }));
Object.defineProperty(exports, "RoomFilter", ({ enumerable: true, get: function () { return room_1.RoomFilter; } }));
const route_1 = __webpack_require__(/*! ./models/route */ "./src/models/route.ts");
Object.defineProperty(exports, "Route", ({ enumerable: true, get: function () { return route_1.Route; } }));
const trace_1 = __webpack_require__(/*! ./models/trace */ "./src/models/trace.ts");
Object.defineProperty(exports, "Trace", ({ enumerable: true, get: function () { return trace_1.Trace; } }));
const region_1 = __webpack_require__(/*! ./models/region */ "./src/models/region.ts");
Object.defineProperty(exports, "Region", ({ enumerable: true, get: function () { return region_1.Region; } }));
const landmark_1 = __webpack_require__(/*! ./models/landmark */ "./src/models/landmark.ts");
Object.defineProperty(exports, "LandmarkKey", ({ enumerable: true, get: function () { return landmark_1.LandmarkKey; } }));
Object.defineProperty(exports, "Landmark", ({ enumerable: true, get: function () { return landmark_1.Landmark; } }));
const shortcut_1 = __webpack_require__(/*! ./models/shortcut */ "./src/models/shortcut.ts");
Object.defineProperty(exports, "Shortcut", ({ enumerable: true, get: function () { return shortcut_1.Shortcut; } }));
Object.defineProperty(exports, "RoomConditionExit", ({ enumerable: true, get: function () { return shortcut_1.RoomConditionExit; } }));
const variable_1 = __webpack_require__(/*! ./models/variable */ "./src/models/variable.ts");
Object.defineProperty(exports, "Variable", ({ enumerable: true, get: function () { return variable_1.Variable; } }));
const snapshot_1 = __webpack_require__(/*! ./models/snapshot */ "./src/models/snapshot.ts");
Object.defineProperty(exports, "Snapshot", ({ enumerable: true, get: function () { return snapshot_1.Snapshot; } }));
Object.defineProperty(exports, "SnapshotKey", ({ enumerable: true, get: function () { return snapshot_1.SnapshotKey; } }));
const controlcode_1 = __webpack_require__(/*! ./utils/controlcode/controlcode */ "./src/utils/controlcode/controlcode.ts");
Object.defineProperty(exports, "ControlCode", ({ enumerable: true, get: function () { return controlcode_1.ControlCode; } }));
Object.defineProperty(exports, "Command", ({ enumerable: true, get: function () { return controlcode_1.Command; } }));
const map_1 = __webpack_require__(/*! ./models/map */ "./src/models/map.ts");
Object.defineProperty(exports, "Map", ({ enumerable: true, get: function () { return map_1.Map; } }));
Object.defineProperty(exports, "MapInfo", ({ enumerable: true, get: function () { return map_1.MapInfo; } }));
Object.defineProperty(exports, "MapEncoding", ({ enumerable: true, get: function () { return map_1.MapEncoding; } }));
Object.defineProperty(exports, "MapSettings", ({ enumerable: true, get: function () { return map_1.MapSettings; } }));
const mapfile_1 = __webpack_require__(/*! ./models/mapfile */ "./src/models/mapfile.ts");
Object.defineProperty(exports, "MapFile", ({ enumerable: true, get: function () { return mapfile_1.MapFile; } }));
const records_1 = __webpack_require__(/*! ./models/records */ "./src/models/records.ts");
Object.defineProperty(exports, "Records", ({ enumerable: true, get: function () { return records_1.Records; } }));
const context_1 = __webpack_require__(/*! ./models/context */ "./src/models/context.ts");
Object.defineProperty(exports, "Context", ({ enumerable: true, get: function () { return context_1.Context; } }));
Object.defineProperty(exports, "Path", ({ enumerable: true, get: function () { return context_1.Path; } }));
Object.defineProperty(exports, "Link", ({ enumerable: true, get: function () { return context_1.Link; } }));
Object.defineProperty(exports, "CommandCost", ({ enumerable: true, get: function () { return context_1.CommandCost; } }));
Object.defineProperty(exports, "Environment", ({ enumerable: true, get: function () { return context_1.Environment; } }));
const uniquekeyutil_1 = __webpack_require__(/*! ./utils/uniquekeyutil */ "./src/utils/uniquekeyutil.ts");
Object.defineProperty(exports, "UniqueKeyUtil", ({ enumerable: true, get: function () { return uniquekeyutil_1.UniqueKeyUtil; } }));
const step_1 = __webpack_require__(/*! ./models/step */ "./src/models/step.ts");
Object.defineProperty(exports, "Step", ({ enumerable: true, get: function () { return step_1.Step; } }));
Object.defineProperty(exports, "QueryResult", ({ enumerable: true, get: function () { return step_1.QueryResult; } }));
const snapshotsearchresult_1 = __webpack_require__(/*! ./models/snapshotsearchresult */ "./src/models/snapshotsearchresult.ts");
Object.defineProperty(exports, "SnapshotFilter", ({ enumerable: true, get: function () { return snapshotsearchresult_1.SnapshotFilter; } }));
Object.defineProperty(exports, "SnapshotSearchResult", ({ enumerable: true, get: function () { return snapshotsearchresult_1.SnapshotSearchResult; } }));
Object.defineProperty(exports, "SnapshotSearch", ({ enumerable: true, get: function () { return snapshotsearchresult_1.SnapshotSearch; } }));
const mapperoption_1 = __webpack_require__(/*! ./models/mapperoption */ "./src/models/mapperoption.ts");
Object.defineProperty(exports, "MapperOptions", ({ enumerable: true, get: function () { return mapperoption_1.MapperOptions; } }));
const hmmencoder_1 = __webpack_require__(/*! ./helpers/hmmencoder */ "./src/helpers/hmmencoder.ts");
Object.defineProperty(exports, "HMMEncoder", ({ enumerable: true, get: function () { return hmmencoder_1.HMMEncoder; } }));
Object.defineProperty(exports, "MapHeadData", ({ enumerable: true, get: function () { return hmmencoder_1.MapHeadData; } }));
Object.defineProperty(exports, "DefaultHmmEncoderHooks", ({ enumerable: true, get: function () { return hmmencoder_1.DefaultHmmEncoderHooks; } }));
const mapper_1 = __webpack_require__(/*! ./helpers/mapper */ "./src/helpers/mapper.ts");
Object.defineProperty(exports, "Mapper", ({ enumerable: true, get: function () { return mapper_1.Mapper; } }));
Object.defineProperty(exports, "Walking", ({ enumerable: true, get: function () { return mapper_1.Walking; } }));
Object.defineProperty(exports, "WalkingStep", ({ enumerable: true, get: function () { return mapper_1.WalkingStep; } }));
const mapdatabase_1 = __webpack_require__(/*! ./cores/mapdatabase */ "./src/cores/mapdatabase.ts");
Object.defineProperty(exports, "MapDatabase", ({ enumerable: true, get: function () { return mapdatabase_1.MapDatabase; } }));
Object.defineProperty(exports, "APIListOption", ({ enumerable: true, get: function () { return mapdatabase_1.APIListOption; } }));
const snapshothelper_1 = __webpack_require__(/*! ./helpers/snapshothelper */ "./src/helpers/snapshothelper.ts");
Object.defineProperty(exports, "SnapshotHelper", ({ enumerable: true, get: function () { return snapshothelper_1.SnapshotHelper; } }));

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});