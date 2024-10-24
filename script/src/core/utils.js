(function (App) {
    let utilsModule = App.RequireModule("helllibjs/utils/utils.js")
    App.Utils = utilsModule
    App.Random = App.Utils.Random
    App.LoadLines = function (file, sep) {
        return App.LoadLinesText(ReadLines(file), sep)
    }
    App.LoadVariable = function (name, sep) {
        return App.LoadLinesText(GetVariable(name).split("\n"), sep)
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