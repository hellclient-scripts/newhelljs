// 工作汇报代码
(function (App) {
    let uiModule = App.RequireModule("helllibjs/utils/ui.js")
    App.UI.Report = {}
    App.UI.Report.Show = () => {
        let report = []
        report.push(`ID:${GetVariable("id")}`)
        report.push(`气血(百分比): ${App.Data.Player.HP["气血百分比"] || "-"} 精气(百分比): ${App.Data.Player.HP["精气百分比"] || "-"}`)
        let maxneili = App.Data.Player.HPM["内力上限"]
        let neili = App.Data.Player.HP["内力上限"]
        let line = `当前内力上限${neili} 最大内力上限${maxneili}`
        if (maxneili != null && neili != null && maxneili - neili > 180) {
            let lu = Math.floor((maxneili - neili) / 180)
            line = line + ` 内力可提升${maxneili - neili} ,折天香玉露 ${lu} 个`

        }
        report.push(line)
        report.push(`经验:${App.Data.Player.HP["经验"] || "0"} 潜能:${App.Data.Player.HP["潜能"] || "0"} 体会:${App.Data.Player.HP["体会"] || "0"} 阅历:${App.Data.Player.Score["阅历"] || "-"} 当前等级 ${App.Data.Player.HPM["当前等级"]}`)
        report.push(`门贡:${App.Data.Player.Score["门贡"] || 0} 集资点:${App.Data.Player.Donate || 0}`)

        report.push(`存款:${App.Data.Player.Score["存款" || 0]} 债券:${App.Data.Player.Score["债券" || 0]}`)
        report.push(`打坐位置:${App.Params.LocDazuo} 睡觉位置:${App.Params.LocSleep} 掌门ID:${App.Params.MasterID || "-"} 掌门位置:${App.Params.LocMaster || "-"}`)
        report.push(`最大经验:${GetVariable("max_exp") || 0} 最大潜能:${GetVariable("max_pot")} 最小潜能:${GetVariable("min_pot")} 最大体会${App.Core.Study.Jiqu.Max || "0"}`)
        report.push(`汲取指令列表`)
        App.Core.Study.Jiqu.Commands.forEach(cmd => {
            report.push(`  ${cmd}`)
        });
        report.push("武器列表")
        for (var index in App.Core.Weapon.Duration) {
            let weapon = App.Core.Weapon.Duration[index]
            if (weapon.ID != null && weapon.Name && weapon.Damage) {
                report.push(`  ${weapon.Name}(${weapon.ID}) + ${weapon.Damage} ${weapon.Level ? "LV " + weapon.Level : ""}`)
            }
        }
        if (App.Core.Study.Learn.length) {
            let all = App.Core.Study.AllCanLearn().map(v => `${v.SkillID}(${App.Data.Player.Skills[v.SkillID] ? App.Data.Player.Skills[v.SkillID]["等级"] : 0})`)
            report.push(`学习进度 (${all.length}/${App.Core.Study.Learn.length}):`)
            report.push(`  ${all.join(",")}`)
        }
        let quests = App.Core.Quest.Current ? App.Core.Quest.Current.replaceAll("\n", "||") : "无任务"
        if (!App.Core.Quest.Stopped) {
            let duration = 0
            let td = 0
            if (App.Core.Quest.StartedAt) {
                td = $.Now() - App.Core.Quest.StartedAt
                duration = `${(td / 60000).toFixed()}分钟`
                if (td > 18000000) {
                    duration += `(${App.HUD.UI.FormatTime(td)})`
                }
            }
            report.push(`任务已经持续了${duration}。`)
            if (td) {
                let timeslice = App.Core.Timeslice.List()
                if (timeslice.length) {
                    report.push("时间切片：")
                    let tsdata = [
                    ]
                    let maxName = 0
                    let maxDuration = 0
                    let maxPercent = 0
                    timeslice.forEach(t => {
                        let item = [
                            t.Name,
                            App.HUD.UI.FormatTime(t.Time),
                            (t.Time / td * 100).toFixed(2) + "%" 

                        ]
                        let nameLength = uiModule.CountDisplayLength(item[0])
                        if (nameLength > maxName) {
                            maxName = nameLength
                        }
                        let durationLength = uiModule.CountDisplayLength(item[1])
                        if (durationLength > maxDuration) {
                            maxDuration = durationLength
                        }
                        let percentLength = uiModule.CountDisplayLength(item[2])
                        if (percentLength > maxPercent) {
                            maxPercent = percentLength
                        }
                        tsdata.push(item)
                    })
                    tsdata.forEach(t => {
                        t[0] = uiModule.Pad(t[0], maxName, true)
                        t[1] = uiModule.Pad(t[1], maxDuration, true)
                        t[2] = uiModule.Pad(t[2], maxPercent, true)
                        report.push(`  ${t[0]}  ${t[1]}  ( ${t[2]} )`)
                    })
                }
            }
            if (td) {
                report.push(...App.Core.Analytics.Report())
            }

        }

        report.push(`当前任务:`)
        report.push(`  ${quests}`)
        if (App.Core.Quest.Current) {
            var dup = {}
            var questreports = []
            App.Quests.Queue.forEach(rq => {
                if (!dup[rq.ID]) {
                    dup[rq.ID] = true
                    let q = App.Quests.GetQuest(rq.ID)
                    if (q) {
                        let output = App.Quests.GetQuest(rq.ID).OnReport()
                        if (output) {
                            output.forEach(o => {
                                questreports.push(`  ${o}`)
                            })
                        }
                    }
                }
            });
            if (questreports.length) {
                report.push(`任务报告:`)
                report = report.concat(questreports)
            }
        }
        report.push(`技能列表`)
        for (var i in App.Data.Player.Skills) {
            let skill = App.Data.Player.Skills[i]
            report.push(`  ${skill["名称"]} - ${skill["等级"]}`)
        }
        report.push(`道具列表`)
        for (var i in App.Data.Item.List.Items) {
            let item = App.Data.Item.List.Items[i]
            report.push(`  ${item.GetData().Name} - ${item.GetData().Count} `)
        }
        if (App.Data.Item.List.FindByIDLower("qiankun bag").First()) {
            report.push(`乾坤袋道具列表`)
            for (var i in App.Data.QiankunBag.Items) {
                let item = App.Data.QiankunBag.Items[i]
                report.push(`  ${item.GetData().Name} - ${item.GetData().Count} `)
            }
        } else {
            report.push(`无乾坤袋`)
        }

        Userinput.Note("", "工作汇报", report.join("\n"))
    }
})(App)
