(function (App) {
    let module = {}
    const ModeNormal = 0
    const ModeComment = 1
    const ModeError = 2
    module.CostToken = "$"
    class Line {
        constructor(data) {
            this.Raw = data
        }
        Raw = ""
        Mode = ModeNormal
        ID = ""
        Name = ""
        Exits = []
        Enabled = true
        Ready() {
            return this.Mode == ModeNormal && this.Enabled
        }
    }
    class Exit {
        constructor(data) {
            this.Raw = data
        }
        Raw = ""
        Mode = ModeNormal
        Tags = []
        ExcludeTags = []
        Delay = 0
        Command = ""
        From = ""
        To = ""
        Enabled = true
        Ready() {
            return this.Mode == ModeNormal && this.Enabled
        }
        AddToMapper() {
            let path = Mapper.newpath()
            path.from = this.From
            path.to = this.To
            path.tags = this.Tags
            path.excludetags = this.ExcludeTags
            path.command = this.Command
            Mapper.addpath(this.From, path)
            return path
        }
    }
    class File {
        Load(lines) {
            let result = []
            this.Raw = lines
            lines.forEach(data => {
                let line = new Line(data)
                data = data.trim()
                if (data == "" || data.startsWith("//")) {
                    line.Mode = ModeComment
                    line.Enabled = false
                    result.push(line)
                    return
                }
                let linedata = SplitN(data, "=", 2)
                if (linedata.length != 2 || linedata[0] == "") {
                    line.Mode = ModeError
                    line.Enabled = false
                    result.push(line)
                    return
                }
                line.ID = linedata[0]
                let roomdata = SplitN(linedata[1], "|", 2)
                if (roomdata.length != 2) {
                    line.Mode = ModeError
                    line.Enabled = false
                    result.push(line)
                    return
                }
                line.Name = roomdata[0]
                if (this.BlockedID[line.ID]) {
                    line.Enabled = false
                }
                let exitlist = SplitN(roomdata[1], ",", -1)
                exitlist.forEach(exitdata => {
                    if (exitdata == "") {
                        return
                    }
                    let exit = this.ParsePath(line.ID, exitdata)
                    if (exit.Enabled && exit.Mode == ModeNormal) {
                        if (this.BlockedPath[exit.From] && this.BlockedPath[exit.From][exit.To]) {
                            exit.Enabled = false
                        } else if (this.To == "*" || this.To == "?") {
                            exit.Enabled = false
                        }
                    }
                    line.Exits.push(exit)
                })
                result.push(line)
            });
            this.Data = this.Data.concat(result)
        }
        Data = []
        Raw = []
        BlockedID = {}
        BlockedPath = {}
        ParsePath = parsepath
    }
    parsepath = function (fr, str) {
        let exit = new Exit(str)
        var tag
        var tags
        var ex
        var etags
        var s
        exit.From = fr
        s = split2(str, module.CostToken)
        str = s[0]
        delay = s[1]
        if (delay) {
            exit.Delay = delay - 0
        }
        s = split2(str, ":")
        str = s[0]
        var to = s[1]
        if (!to) {
            exit.Mode = ModeError
            exit.Enabled = false
            return exit
        }
        exit.To = to
        s = split2(str, ">")
        tag = s[0]
        str = s[1]
        while (str) {
            exit.Tags.push(tag)
            s = split2(str, ">")
            tag = s[0]
            str = s[1]
        }
        str = tag
        s = split2(str, "<")
        ex = s[0]
        str = s[1]
        while (str) {
            exit.ExcludeTags.push(ex)
            s = split2(str, "<")
            ex = s[0]
            str = s[1]
        }
        str = ex
        exit.Command = decodeURIComponent(str)
        return exit
    }
    split2 = function (v, sep) {
        var s = SplitN(v, sep, 2)
        if (s.length < 2) {
            s.push("")
        }
        return s
    }
    module.File = File
    module.Parsepath = parsepath
    return module
})