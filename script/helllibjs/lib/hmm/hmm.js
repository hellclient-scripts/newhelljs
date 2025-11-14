(function () {
    var LoadCommonJS = function (name) {
        var self = globalThis.self
        var module = globalThis.module
        var exports = globalThis.exports
        globalThis.self = globalThis
        globalThis.exports = {}
        globalThis.module = {
            exports: globalThis.exports
        }
        eval(world.ReadFile(name), name)
        var result = globalThis.module.exports;
        globalThis.self = self
        globalThis.exports = exports
        globalThis.module = module
        return result;
    }
    return LoadCommonJS("helllibjs/lib/hmm/hmm.umd.js");
})()