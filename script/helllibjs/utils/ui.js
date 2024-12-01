(function (app) {
    let module = {}
    module.Pad = (str, length, front, overflowtoken) => {
        str = str || ""
        length = length || 0
        front = front || false
        overflowtoken = overflowtoken || "*"
        let count = 0
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) < 256) {
                count += 1
            } else {
                count += 2
            }
        }
        let offset = length - count
        if (offset < 0) {
            return overflowtoken.repeat(length)
        }
        let newlength = str.length + offset
        return front ? str.padStart(newlength, " ") : str.padEnd(newlength, " ")
    }
    module.Cut = (str, length, overflowtoken) => {
        str = str || ""
        length = length || 1
        overflowtoken = overflowtoken || "+"
        overflowtokenlength = overflowtoken.charCodeAt(i) < 256 ? 1 : 2
        let count = 0
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) < 256) {
                count += 1
            } else {
                count += 2
            }
            if (count + overflowtokenlength >= length) {
                return str.slice(0, i - 1) + overflowtoken
            }
        }
        return str
    }
    module.FormatTime = (time, short) => {
        if (time > 432000000) {
            return Math.floor(time / 86400000) + (short ? "d" : "天")
        }
        if (time > 18000000) {
            return Math.floor(time / 3600000) + (short ? "h" : "小时")
        }
        if (time > 300000) {
            return Math.floor(time / 60000) + (short ? "m" : "分钟")
        }
        if (time > 1000) {
            return Math.floor(time / 1000) + (short ? "s" : "秒")
        }
        return "0"
    }
    class Word {
        constructor(text, space, padstart) {
            this.Text = text
            if (space != null) {
                this.Space = space
            }
            if (padstart != null) {
                this.PadStart = padstart
            }
        }
        Text = ""
        Color = ""
        Background = ""
        Bold = false
        Underlined = false
        Blinking = false
        Inverse = false
        Space = -1
        PadStart = false
        WithText(text) {
            this.Text = text
            return this
        }
        WithColor(val) {
            this.Color = val
            return this
        }
        WithBackground(val) {
            this.Background = val
            return this
        }
        WithBold(val) {
            this.Bold = (val == true)
            return this
        }
        WithUnderlined(val) {
            this.Underlined = (val == true)
            return this
        }
        WithBlinking(val) {
            this.Blinking = (val == true)
            return this
        }
        WithInverse(val) {
            this.Inverse = (val == true)
            return this
        }
        WithSpace(val) {
            this.Space = val
            return this
        }
        WithPadStart(val) {
            this.PadStart = val
            return this
        }
        ToRaw() {
            let text = this.Text + ""
            if (this.Space > 0) {
                text = module.Pad(text, this.Space, this.PadStart)
            }
            let word = JSON.parse(NewWord(text))
            word.Color = this.Color
            word.Background = this.Background
            word.Bold = this.Bold
            word.Blinking = this.Blinking
            word.Inverse = this.Inverse
            word.Underlined = this.Underlined
            return word
        }
        static Join(...words) {
            let line = JSON.parse(NewLine())
            words.forEach(w => {
                if (w) {
                    line.Words.push(w.ToRaw())
                }
            })
            return line
        }
    }
    module.Word = Word
    module.ShortNumber = function (num, tofixed) {
        num = num || 0
        tofixed = tofixed || 0
        let unit = ""
        if (num >= 999) {
            num = num / 1000
            unit = "K"
        }
        if (num >= 999) {
            num = num / 1000
            unit = "M"
        }
        if (tofixed) {
            let pow = Math.pow(10, tofixed)
            num = Math.floor(num / pow) * pow
        } else {
            num = Math.floor(num)
        }
        return num + unit
    }
    return module
})