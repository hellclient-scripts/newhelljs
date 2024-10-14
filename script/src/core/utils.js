(function (App) {
    App.Random = function (target) {
        if (typeof (target) == "object") {
            if (target instanceof Array) {
                return target[App.Random(target.length)]
            } else {
                return target[App.Random(Object.keys(target))]
            }
        }
        return Math.floor(Math.random() * (target - 0))
    }
    App.LoadLines = function (file, sep) {
        return App.LoadLinesText(ReadLines(file),sep)
    }
    App.LoadVariable=function(name,sep){
        return App.LoadLinesText(GetVariable(name).split("\n"),sep)
    }
    App.LoadLinesText = function (data, sep) {
        let result = []
        data.forEach(line => {
            line = line.trim()
            if (line == "" || line.startsWith("//")) {
                return
            }
            if (sep) {
                result.push(line.split(sep))
            } else {
                result.push(line)
            }
        })
        return result
    }
})(App)