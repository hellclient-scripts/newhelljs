(function (app) {
    let module = {}
    module.Random = function (target) {
        if (typeof (target) == "object") {
            if (target instanceof Array) {
                return target[module.Random(target.length)]
            } else {
                return target[module.Random(Object.keys(target))]
            }
        }
        return Math.floor(Math.random() * (target - 0))
    }
    return module
})