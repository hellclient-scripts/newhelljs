//工具类
(function (App) {
    let utilsModule = App.RequireModule("helllibjs/utils/utils.js")
    App.Utils = utilsModule
    App.Random = App.Utils.Random
    //加载多行文本文件
    App.LoadLines = function (file, sep) {
        return App.LoadLinesText(ReadLines(file), sep)
    }
    //加载变量
    App.LoadVariable = function (name, sep) {
        return App.LoadLinesText(GetVariable(name).split("\n"), sep)
    }
    //加载文本，去除注释和空行
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