(function () {
    let module = {}
    module.Colors = {
        Black: 1,
        Red: 2,
        Green: 3,
        Yellow: 4,
        Blue: 5,
        Magenta: 6,
        Cyan: 7,
        White: 8,
        BrightBlack: 9,
        BrightRed: 10,
        BrightGreen: 11,
        BrightYellow: 12,
        BrightBlue: 13,
        BrightMagenta: 14,
        BrightCyan: 15,
        BrightWhite: 16
    }
    module.Colors[''] = 0
    module.ColorValues = {}
    for (let color in module.Colors) {
        module.ColorValues[module.Colors[color]] = color
    }
    // 设置flag位，成功返回true,失败false
    function setflag(word, data) {
        let flag = parseInt(data, 16)
        if (flag == null || flag > 16 || flag < 0) {
            return false
        }
        if (flag >= 8) {
            word.Inverse = true
            flag = flag - 8
        }
        if (flag >= 4) {
            word.Blinking = true
            flag = flag - 4
        }
        if (flag >= 2) {
            word.Underlined = true
            flag = flag - 2
        }
        if (flag == 1) {
            word.Bold = true
        }
        return true
    }
    class Line {
        constructor() {
        }
        Words = []
        Text = ''
        AppendWord(word) {
            this.Text = this.Text + word.Text
            if (this.Words.length > 0) {
                let last = this.Words[this.Words.length - 1]
                if (last.GetShortStyle() == word.GetShortStyle()) {
                    this.Words[this.Words.length - 1] = word.CopyStyle(last.Text + word.Text)
                    return this
                }
            }
            this.Words.push(word)
            return this
        }
        ToShort() {
            let result = ''
            this.Words.forEach(function (word) {
                result = result + word.ToShort()
            })
            return result
        }
        Slice(start, length) {
            if (start == null) {
                start = 0
            }
            if (start < 0) {
                return null
            }
            if (length == null) {
                length = 1
            }
            if (length < 0) {
                return null
            }
            let skip = start
            let result = new Line()
            for (let value of this.Words) {
                if (value.Text.length > 0) {
                    if (value.Text.length <= skip) {
                        skip = skip - value.Text.length
                    } else {
                        if (skip + length > value.Text.length) {
                            result.AppendWord(value.CopyStyle(value.Text.slice(skip)))
                            length = length - (value.text - skip + 1)
                            skip = 0
                        } else {
                            result.AppendWord(value.CopyStyle(value.Text, skip, skip + length - 1))
                            return result
                        }
                    }
                }
            }
            return result
        }
        static FromOutput(output) {
            let line = new Line()
            output.Words.forEach(word => {
                let w = new Word(word.Text)
                w.Background = word.Background
                w.Color = word.Color
                w.Color = word.Color
                w.Background = word.Background
                w.Bold = word.Bold
                w.Underlined = word.Underlined
                w.Blinking = word.Blinking
                w.Inverse = word.Inverse
                line.AppendWord(w)
            })
            return line
        }

        static Parse(data) {
            let line = new Line()
            let word = null
            let index = 0
            let length = data.length
            while (index < length) {
                let char = data.slice(index, index + 1)
                // 转义
                if (char == '#') {
                    let left = length - index - 1
                    if (left < 1) {
                        // 孤立的#
                        return null
                    }
                    let next = data.slice(index + 1, index + 2)
                    if (next == '#') {
                        if (word == null) {
                            return null
                        }
                        index = index + 1
                        word.Text = word.Text + '#'
                    } else if (left > 3 && next == '0') {
                        // #0AA0格式
                        var fg = module.ColorValues[data.slice(index + 2, index + 3).charCodeAt() - 65]
                        var bg = module.ColorValues[data.slice(index + 3, index + 4).charCodeAt() - 65]
                        if (fg == null || bg == null) {
                            // 无效颜色
                            return null
                        }
                        if (word != null) {
                            line.AppendWord(word)
                        }
                        word = new Word()
                        word.Color = fg
                        word.Background = bg
                        if (!setflag(word, data.slice(index + 4, index + 5))) {
                            // flag无效
                            return null
                        }
                        index = index + 4
                    } else if (left > 5 && next == '1') {
                        // #1RRGGBBRRGGBB0格式
                        if (word != null) {
                            line.AppendWord(word)
                        }
                        word = new Word()
                        index = index + 2
                        if (string.sub(data, index, index + 1) == '*') {
                            var fg = module.ColorValues[data.slice(index + 1, index + 2).charCodeAt() - 65]
                            if (fg == null) {
                                // 无效颜色
                                return null
                            }
                            word.Color = fg
                            index = index + 2
                        } else {
                            word.Color = '#' + data.slice(index, index + 6)
                            index = index + 6
                        }
                        if (data.slice(index, index + 1) == '*') {
                            let bg = module.ColorValues[data.slice(index + 1, index + 2).charCodeAt() - 65]
                            if (bg == null) {
                                --无效颜色
                                return null
                            }
                            word.Background = bg
                            index = index + 2
                        } else {
                            word.Background = '#' + data.slice(index, index + 6)
                            index = index + 6
                        }
                        if (!setflag(word, data.slice(index, index + 1))) {
                            --flag无效
                            return null
                        }
                    } else {
                        return null
                    }
                } else {
                    // 无效，应该都有样式开头
                    if (word == null) {
                        return null
                    }
                    word.Text = word.Text + char
                }
                index = index + 1
            }
            if (word != null) {
                line.AppendWord(word)
            }
            return line
        }
    }
    class Word {
        constructor(text) {
            if (text) {
                this.Text = text
            }
        }
        Text = ''
        Color = ''
        Background = ''
        Bold = false
        Underlined = false
        Blinking = false
        Inverse = false
        GetShortStyle() {
            let result = '#'
            if ((this.Color != "" && this.Color.slice(0, 1) == '#') || (this.Background != "" && this.Background.slice(0, 1) == '#')) {
                result = result + '1'
                let fg = module.Colors[this.Color]
                if (fg != null) {
                    result = result + '*' + String.fromCharCode(65 + fg)
                } else {
                    result = result + this.Color.slice(1)
                }
                let bg = module.Colors[this.Background]
                if (bg != null) {
                    result = result + '*' + String.fromCharCode(65 + bg)
                } else {
                    result = result + this.Background.slice(1)
                }
            } else {
                result = result +
                    '0' + String.fromCharCode(65 + module.Colors[this.Color]) + String.fromCharCode(65 + module.Colors[this.Background])
            }
            let flag = 0
            if (this.Bold) {
                flag = flag + 1
            }
            if (this.Underlined) {
                flag = flag + 2
            }
            if (this.Blinking) {
                flag = flag + 4
            }
            if (this.Inverse) {
                flag = flag + 8
            }
            result = result + flag.toString(16)
            return result
        }
        CopyStyle(text) {
            if (text == null) {
                text = ""
            }
            let w = new Word()
            w.Text = text
            w.Color = this.Color
            w.Background = this.Background
            w.Bold = this.Bold
            w.Underlined = this.Underlined
            w.Blinking = this.Blinking
            w.Inverse = this.Inverse
            return w
        }
        ToShort() {
            return this.GetShortStyle() + this.Text.replaceAll("#", "##")
        }
    }
    module.Line = Line
    module.Word = Word
    return module
})()