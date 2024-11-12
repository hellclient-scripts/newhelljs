(function (app) {
    let module = {}
    module.Backward = {
        "west": "east", "w": "e",
        "north": "south", "n": "s",
        "east": "west", "e": "w",
        "south": "north", "s": "n",
        "up": "down", "u": "d",
        "down": "up", "d": "u",
        "enter": "out",
        "out": "enter",
        "northeast": "southwest", "ne": "sw",
        "southeast": "northwest", "se": "nw",
        "southwest": "northeast", "sw": "ne",
        "northwest": "southeast", "nw": "se",
        "northup": "southdown", "nu": "sd",
        "eastup": "westdown", "eu": "wd",
        "southup": "northdown", "su": "nd",
        "westup": "eastdown", "wu": "ed",
        "northdown": "southup", "nd": "su",
        "eastdown": "westup", "ed": "wu",
        "southdown": "northup", "sd": "nu",
        "westdown": "eastup", "eu": "wd",
    }
    module.Depath = 20
    let DFS = function (depth, backward) {
        //最大步数
        this.Depth = depth ? depth : module.Depath
        this.Backward = backward ? backward : module.Backward
    }
    DFS.prototype.GetBackward = function (cmd) {
        return this.Backward[cmd] ? this.Backward[cmd] : null
    }
    DFS.prototype.New = function () {
        return new Next(this, null, null)
    }
    let Next = function (DFS, level, command) {
        this.Level = level
        this.DFS = DFS
        this.Command = command
        this.IsBack = false
    }
    Next.prototype.Arrive = function (exits) {
        let filtered = []
        exits.forEach(exit => {
            let back = this.DFS.GetBackward(exit)
            if (back && back != this.Command) {
                filtered.push(exit)
            }
        });
        return new Level(this.DFS, this.Level, filtered, this.DFS.GetBackward(this.Command))
    }
    Next.prototype.Skip = function () {
        return this.Level
    }
    let Back = function (DFS, level, command) {
        this.Level = level
        this.DFS = DFS
        this.Command = command
        this.IsBack = true
    }
    Next.prototype.ConcatBackward = function () {
        let result = (this.Level == null) ? [] : this.Level.ConcatBackward()
        result.unshift(this.DFS.GetBackward(this.Command))
        return result
    }
    Next.prototype.Concat = function () {
        let result = (this.Level == null) ? [] : this.Level.Concat()
        result.push(this.Command)
        return result
    }
    Back.prototype.Skip = function () {
        return null
    }
    Back.prototype.Arrive = function (exits) {
        return this.Level
    }
    Back.prototype.ConcatBackward = function () {
        let result = (this.Level == null) ? [] : this.Level.ConcatBackward()
        return result
    }
    Back.prototype.Concat = function () {
        let result = (this.Level == null) ? [] : this.Level.Concat()
        return result
    }
    let Level = function (DFS, parent, exits, backward) {
        this.DFS = DFS
        this.Parent = parent
        this.Exits = exits
        this.Index = parent ? parent.Index + 1 : 1
        this.Backward = backward
    }
    Level.prototype.Next = function () {
        if (!this.Exits.length || this.Index >= this.DFS.Depth) {
            return this.Back()
        }
        let newexits = [...this.Exits]
        let command = newexits.shift()
        let clone = new Level(this.DFS, this.Parent, newexits, this.Backward)
        return new Next(this.DFS, clone, command)
    }
    Level.prototype.Back = function () {
        if (this.Backward) {
            return new Back(this.DFS, this.Parent, this.Backward)
        }
        return null
    }
    Level.prototype.Concat = function () {
        if (this.Parent) {
            let result = this.Parent.Concat()
            result.push(this.DFS.GetBackward(this.Backward))
            return result
        }
        return []
    }
    Level.prototype.ConcatBackward = function () {
        if (this.Parent) {
            let result = this.Parent.ConcatBackward()
            result.unshift(this.Backward)
            return result
        }
        return []
    }
    module.DFS = DFS
    return module
})