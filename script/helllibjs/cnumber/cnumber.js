(function (App) {
    let module = {}
    class Result {
        constructor(count, unit, name) {
            this.Count = count
            this.Unit = unit
            this.Name = name
        }
        Count = 0
        Unit = ""
        Name = ""
    }
    let numbers = {}
    "零一二三四五六七八九".split("").forEach(function (value, index) { numbers[value] = index })

    let multi = {
        "十": 10,
        "百": 100,
        "千": 1000,
        "万": 10000,
        "亿": 100000000,
    }
    const reNumber = /^(零|一|二|三|四|五|六|七|八|九|十|百|千|万|亿)+$/
    class CNumber {
        constructor() {

        }
        ReUnit = /个/
        FixedNames = []
        ParseNumber(str) {
            var result = 0
            var lastnumber = 0
            var lastunit = 0
            for (let i = 0; i < str.length; i++) {
                var char = str[i]
                switch (char) {
                    case "零":
                        if (lastnumber >= 0) {
                            return -1
                        }
                        lastnumber = 0
                        break
                    case "十":
                    case "百":
                    case "千":
                        var m = multi[char]
                        if (lastunit != 0 && m >= lastunit) {
                            return -1
                        }
                        if (lastnumber <= 0) {
                            lastnumber = 1
                        }
                        result = result + lastnumber * m
                        lastnumber = -1
                        lastunit = m
                        break
                    case "万":
                    case "亿":
                        var m = multi[char]
                        if (lastnumber > 0) {
                            result = result + lastnumber
                        }
                        result = result * m
                        lastunit = 0
                        lastnumber = -1
                        break
                    default:
                        let value = numbers[char]
                        if (value == null) {
                            return result
                        }
                        if (lastnumber > 0) {
                            return -1
                        }
                        lastnumber = value
                }
            }
            if (lastnumber > 0) {
                result = result + lastnumber
            }
            return result

        }
        Convert(label) {
            for (let fixedname of this.FixedNames) {
                if (label == fixedname) {
                    return new Result(1, "", label)
                }
            }
            let reresult = label.match(this.ReUnit)
            if (reresult == null) {
                return new Result(1, "", label)
            }
            let number = label.slice(0, reresult.index)
            if (number.match(reNumber) == null) {
                return new Result(1, "", label)
            }
            let count = this.ParseNumber(number)
            if (count == -1) {
                return new Result(1, "", label)
            }
            let unit = reresult[0]
            let name = label.slice(reresult.index + unit.length)
            if (name) {//npc名可能正好是量词，比如万片
                return new Result(count, unit, name)
            }
            return label
        }
    }
    module.CNumber = CNumber
    return module
})