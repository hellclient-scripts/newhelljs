(function (App) {
    let uiModule = App.RequireModule("helllibjs/utils/ui.js")

    App.Core.Analytics = {}
    App.Core.Analytics.Tasks = {}
    App.Core.Analytics.RegisterTask = function (ID, Label, Timeslice) {
        App.Core.Analytics.Tasks[ID] = new Task(ID, Label, Timeslice)
    }
    App.Core.Analytics.Add = function (ID, Exp, Pot, Tihui) {
        if (App.Core.Analytics.Tasks[ID] == null) {
            throw `未登记的分析任务 ${ID}`
            return
        }
        let task = App.Core.Analytics.Tasks[ID]
        task.Exp += Exp
        task.Pot += Pot
        task.Tihui += Tihui
    }
    App.Core.Analytics.List = () => {
        let result = []
        for (let key in App.Core.Analytics.Tasks) {
            let task = App.Core.Analytics.Tasks[key]
            if (task.Exp > 0 || task.Pot > 0 || task.Tihui > 0) {
                result.push({
                    ID: task.ID,
                    Label: task.Label,
                    Timeslice: App.Core.Timeslice.Get(task.Timeslice),
                    Exp: task.Exp,
                    Pot: task.Pot,
                    Tihui: task.Tihui,
                })
            }
        }
        result.sort((a, b) => {
            if (a.Tihui < b.Tihui) {
                return -1
            }
            return 1
        })
        return result
    }
    App.Core.Analytics.Reset = function () {
        for (let key in App.Core.Analytics.Tasks) {
            let task = App.Core.Analytics.Tasks[key]
            task.Reset()
        }
    }
    App.Core.Analytics.FormatNumber = function (num) {
        num = num.toFixed(0).toString()
        let prefix = ""
        if (num.startsWith("-")) {
            prefix = "-"
            num = num.substring(1)
        }
        let result = ""
        for (let i = 0; i < num.length; i++) {
            if (i > 0 && i % 3 == 0) {
                result = "," + result
            }
            result = num[num.length - 1 - i] + result
        }
        return prefix + result
    }
    let formatNumber = App.Core.Analytics.FormatNumber
    let getPer = function (total, value, timeslice, all) {
        if (timeslice && total && all) {
            let result = (value / total) / (timeslice / all)
            result = result.toFixed(2)
            if (result > 99) {
                result = "99+"
            } else {
                result = result.toString()
            }
            return result
        }
        return "0"
    }
    let formatTables = function (tables) {
        let maxLabel = 0
        let maxPer = 0
        let maxTotal = 0
        let maxEff = 0
        let maxPureEff = 0
        tables.forEach(table => {
            table.sort((a, b) => {
                if (a[5] < b[5]) {
                    return 1
                }
                return -1
            })
            table.unshift(["任务", "效费比", "总计", "毛效率(每小时)", "净效率(每小时)", ""])
            table.forEach(item => {
                let lengthLabel = uiModule.CountDisplayLength(item[0])
                if (lengthLabel > maxLabel) {
                    maxLabel = lengthLabel
                }
                let lengthPer = uiModule.CountDisplayLength(item[1])
                if (lengthPer > maxPer) {
                    maxPer = lengthPer
                }
                let lengthTotal = uiModule.CountDisplayLength(item[2])
                if (lengthTotal > maxTotal) {
                    maxTotal = lengthTotal
                }
                let lengthEff = uiModule.CountDisplayLength(item[3])
                if (lengthEff > maxEff) {
                    maxEff = lengthEff
                }
                let lengthPureEff = uiModule.CountDisplayLength(item[4])
                if (lengthPureEff > maxPureEff) {
                    maxPureEff = lengthPureEff
                }
            })
        })
        tables.forEach(table => {
            table.forEach(item => {
                item[0] = uiModule.Pad(item[0], maxLabel, true)
                item[1] = uiModule.Pad(item[1], maxPer, true)
                item[2] = uiModule.Pad(item[2], maxTotal, true)
                item[3] = uiModule.Pad(item[3], maxEff, true)
                item[4] = uiModule.Pad(item[4], maxPureEff, true)
                delete item[5]
            })
        })
    }
    App.Core.Analytics.Report = function () {
        let result = []
        let tasks = App.Core.Analytics.List()
        if (tasks.length > 0) {
            let totalExp = 0
            let totalPot = 0
            let totalTihui = 0
            for (let task of tasks) {
                totalExp += task.Exp
                totalPot += task.Pot
                totalTihui += task.Tihui
            }
            let all = ($.Now() - App.Core.Quest.StartedAt)
            let used = all / 1000
            let totalexplabel = formatNumber(totalExp)
            let totalpotlabel = formatNumber(totalPot)
            let totaltihuilabel = formatNumber(totalTihui)
            let maxlabel = Math.max(totalexplabel.length, totalpotlabel.length, totaltihuilabel.length)
            totalexplabel = uiModule.Pad(totalexplabel, maxlabel, true)
            totalpotlabel = uiModule.Pad(totalpotlabel, maxlabel, true)
            totaltihuilabel = uiModule.Pad(totaltihuilabel, maxlabel, true)
            let avgexplabel = formatNumber(totalExp * 3600 / used)
            let avgpotlabel = formatNumber(totalPot * 3600 / used)
            let avgtihuilabel = formatNumber(totalTihui * 3600 / used)
            let maxavglabel = Math.max(avgexplabel.length, avgpotlabel.length, avgtihuilabel.length)
            avgexplabel = uiModule.Pad(avgexplabel, maxavglabel, true)
            avgpotlabel = uiModule.Pad(avgpotlabel, maxavglabel, true)
            avgtihuilabel = uiModule.Pad(avgtihuilabel, maxavglabel, true)
            result.push("成长分析")
            result.push(`  经验-共 ${totalexplabel} , 平均 ${avgexplabel} /小时`)
            result.push(`  潜能-共 ${totalpotlabel} , 平均 ${avgpotlabel} /小时`)
            result.push(`  体会-共 ${totaltihuilabel} , 平均 ${avgtihuilabel} /小时`)
            let exptable = []
            for (let task of tasks) {
                let item = [
                    task.Label,
                    getPer(totalExp, task.Exp, task.Timeslice, all),
                    formatNumber(task.Exp),
                    formatNumber(task.Exp * 3600 / used),
                    formatNumber(task.Exp * 3600 / (task.Timeslice / 1000)),
                    task.Timeslice
                ]
                exptable.push(item)
            }
            let pottable = []
            for (let task of tasks) {
                let item = [
                    task.Label,
                    getPer(totalPot, task.Pot, task.Timeslice, all),
                    formatNumber(task.Pot),
                    formatNumber(task.Pot * 3600 / used),
                    formatNumber(task.Pot * 3600 / (task.Timeslice / 1000)),
                    task.Timeslice
                ]
                pottable.push(item)
            }
            let tihuitable = []
            for (let task of tasks) {
                let item = [
                    task.Label,
                    getPer(totalTihui, task.Tihui, task.Timeslice, all),
                    formatNumber(task.Tihui),
                    formatNumber(task.Tihui * 3600 / used),
                    formatNumber(task.Tihui * 3600 / (task.Timeslice / 1000)),
                    task.Timeslice
                ]
                tihuitable.push(item)
            }
            formatTables([exptable, pottable, tihuitable])
            result.push("经验详情")
            exptable.forEach(item => {
                result.push("  " + item.join("   "))
            })
            result.push("潜能详情")
            pottable.forEach(item => {
                result.push("  " + item.join("   "))
            })
            result.push("体会详情")
            tihuitable.forEach(item => {
                result.push("  " + item.join("   "))
            })
        }
        return result
    }
    class Task {
        constructor(ID, Label, Timeslice) {
            this.ID = ID
            this.Label = Label
            this.Timeslice = Timeslice
        }
        ID = ""
        Label = ""
        Timeslice = ""
        Exp = 0
        Pot = 0
        Tihui = 0
        Reset() {
            this.Exp = 0
            this.Pot = 0
            this.Tihui = 0
        }
    }

})(App)