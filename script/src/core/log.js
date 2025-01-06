//日志模块
(function (App) {
    let ring = App.Include("helllibjs/lib/container/ring.js")
    App.Core.Log = {}
    //日志大小
    const logsize = 500
    //环状结构
    App.Core.Log.Data = ring.New(logsize)
    App.Core.Log.FormatTime = () => {
        let t = new Date()
        let year = t.getFullYear().toString().padStart(4, "0")
        let month = (t.getMonth() + 1).toString().padStart(2, "0")
        let day = t.getDate().toString().padStart(2, "0")
        let hour = t.getHours().toString().padStart(2, "0")
        let minute = t.getMinutes().toString().padStart(2, "0")
        let second = t.getSeconds().toString().padStart(2, "0")
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    }
    //追加日志的方法
    App.Core.Log.Append = (msg) => {
        App.Core.Log.Data = App.Core.Log.Data.Next().WithValue(`${App.Core.Log.FormatTime()} ${msg}`)
        App.RaiseEvent(new App.Event("core.onlog", msg))
    }
    //别名
    App.Log = App.Core.Log.Append
    //加载日志数据
    App.Core.Log.Load = (n) => {
        if (!n) {
            n = App.Core.Log.Data.Len()
        }
        let result = []
        if (n > logsize) {
            n = logsize
        }
        let r = this.App.Core.Log.Data
        for (let i = 0; i < n; i++) {
            let v = r.Value()
            if (v != null) {
                result.unshift(v)
            }
            r = r.Prev()
        }
        return result
    }

})(App)