$.Module(function (App) {
    let San = {}
    let Helpers = ["huang shang", "nanhai shenni", "kuihua taijian", "dugu qiubai"]
    let ImbueList = ["jiuzhuan jindan", "feicui lan", "magic water", "xisui dan", "xian dan", "puti zi"]
    San.Data = {
        Weapon: "",
        Times: 0,
        Helpers: [],
        ImbueList: [],
        Saned: false,
        Finished: false,
        WeaponName: "",
        CurrenHelper: null,
    }
    let matcherTimes = /^(.+)已经运用灵物浸入了(.+)次，正在激发它的潜能。$/
    let PlanTimes = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.AddTrigger(matcherTimes, (tri, result) => {
                if (result[1] == San.Data.WeaponName) {
                    task.Data = result[2]
                }
            })
            App.Send(`l ${San.Data.Weapon}`)
            App.Sync()
        },
        (result) => {
            if (result.Task.Data) {
                San.Data.Times = App.CNumber.ParseNumber(result.Task.Data)
                App.HUD.Update()
            }
            App.Next()
        }
    )
    // 红楼剑阁已经运用灵物浸入了四十四次，正在激发它的潜能。
    //你拿出一柄红楼剑阁，握在手中。
    let matcherName = /^你拿出一.(.+)，握在手中。$/
    let PlanName = new App.Plan(
        App.Positions["Response"],
        (task) => {
            App.Send(`hand none;hand ${San.Data.Weapon};hand none`)
            task.AddTrigger(matcherName, (tri, result) => {
                San.Data.WeaponName = result[1]
                return true
            })
            App.Sync()
        },
        (result) => {
            App.Next()
        }
    )
    San.Prepare = () => {
        $.PushCommands(
            $.Prepare(),
            $.Do("unwield " + San.Data.Weapon),
            $.Do("remove " + San.Data.Weapon),
            $.Do("hp;hp -m;i"),
            $.Sync(),
            $.Function(San.CheckNeili),
        )
        $.Next()

    }
    San.Start = () => {
        San.Data.Saned = false
        San.Data.Helpers = [...Helpers]
        San.Data.ImbueList = [...ImbueList]
        San.Prepare()
    }
    San.CheckNeili = () => {
        if (App.Data.Player.HPM["内力上限"] - App.Data.Player.HP["内力上限"] > 180) {
            $.PushCommands(
                $.Function(() => { San.FetchItem("magic water") }),
                $.Function(App.Core.EatLu),
                $.Function(San.Prepare),
            )
        } else if (App.Data.Player.HP["精力上限"] < 1000) {
            $.PushCommands(
                $.Function(() => { San.FetchItem("renshen wan") }),
                $.Do("eat renshen wan;hp;hp -m;i"),
                $.Sync(),
                $.Function(San.Prepare),
            )
        } else {
            $.PushCommands(
                $.Plan(PlanName),
                $.Plan(PlanTimes),
                $.Function(San.Ready),
            )
        }
        $.Next()
    }
    let matcherSelfSan = /^你轻轻抚过.+，两指点于其上/
    let matcherSelfSaned = /^现在.+已经被充分的圣化了/
    let PlanSan = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.AddTrigger(matcherSelfSan, (tri, result) => {
                task.Data = "ok"
                return true
            })
            task.AddTrigger(matcherSelfSaned, (tri, result) => {
                task.Data = "imbue"
                return true
            })
            App.Send(`san ${San.Data.Weapon}`)
            App.Sync()
        },
        (result) => {
            switch (result.Task.Data) {
                case "imbue":
                    San.Data.Saned = true
                    San.Ready()
                    break
                case "ok":
                    San.Data.Saned = true
                    San.Ready()
                    break
                default:
                    App.Fail()

            }
        })
    San.Store = () => {
        App.Push()
        if (San.Data.LastItem) {
            if (San.Data.LastItem.Qiankun) {
                App.Send(`keep ${San.Data.LastItem.ID}`)
            } else {
                App.Append(
                    $.To("2682"),
                    $.Do(`store ${San.Data.LastItem.ID}`),
                )
            }
        }
        App.Append($.Function(San.GoImbue))
        App.Next()
    }
    let matcherNPCName = /^你拿出一柄.+对(.+)说：恳请大师为此神兵圣化...$/
    let matecherSaned = /^(.+)说道： 现在(.+)已经被充分的圣化了，需要浸入神物以进一步磨练。$/
    let matecherOk = /^(.+)轻轻抚过(.+)，两指点于其上，/
    let matcherNext = /^(.+)说道： 我已经为(.+)圣化过了，你需要去寻求他人帮助以继续圣化。$/
    let matcherFinished = /^(.+)说道： 现在(.+)的潜力已经充分挖掘了，只是需要最后一步融合。/
    let PlanShow = new App.Plan(
        App.Positions["Response"],
        (task) => {
            let name = ""
            App.Send(`show ${San.Data.Weapon}`)
            task.AddTrigger(matcherNPCName, (tri, result) => {
                name = result[1]
                return true
            })
            task.AddTrigger(matecherSaned, (tri, result) => {
                if (result[1] == name && result[2] == San.Data.WeaponName) {
                    task.Data = "imbue"
                }
                return true
            })
            task.AddTrigger(matecherOk, (tri, result) => {
                if (result[1] == name && result[2] == San.Data.WeaponName) {
                    task.Data = "ok"
                }
                return true
            })
            task.AddTrigger(matcherNext, (tri, result) => {
                if (result[1] == name && result[2] == San.Data.WeaponName) {
                    task.Data = "next"
                }
                return true
            })
            task.AddTrigger(matcherFinished, (tri, result) => {
                if (result[1] == name && result[2] == San.Data.WeaponName) {
                    task.Data = "finished"
                }
                return true
            })

            

            App.Sync()
        },
        (result) => {
            switch (result.Task.Data) {
                case "imbue":
                    San.Data.Helpers = []
                    San.GoImbue()
                    break
                case "ok":
                    San.Ready()
                    break
                case "next":
                    San.Ready()
                    break
                default:
                    App.Fail()
                    break
                case "finished":
                    Note("san完了")
                    break
            }
        }
    )
    let matcherNextImbue = /^(.+)现在不需要用.+来浸入。$/
    let MatcherSucces = /^你将.+的效力浸入了.+。/
    let PlanImbue = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.AddTrigger(matcherNextImbue, (tri, result) => {
                if (San.Data.WeaponName == result[1]) {
                    Note("imbue下一个")
                    task.Data = "next"
                }
                return true
            })
            task.AddTrigger(MatcherSucces, (tri, result) => {
                Note("成功")
                task.Data = "success"
            })
            App.Sync()
        },
        (result) => {
            switch (result.Task.Data) {
                case "next":
                    San.Store()
                    return
                case "success":
                    San.Data.ImbueList = []
                    break
            }
            App.Next()
        }
    )
    San.GoImbue = () => {
        if (San.Data.ImbueList.length == 0) {
            Note("结束")
            App.Next()
            return
        }
        let item = San.Data.ImbueList.shift()
        Note("尝试" + item + "。")
        $.PushCommands(
            $.Function(() => { San.FetchItem(item) }),
            $.Nobusy(),
            $.Do(`imbue ${item} in ${San.Data.Weapon};hp;i`),
            $.Plan(PlanImbue),
        )
        $.Next()
    }
    San.Ready = () => {
        if (!San.Data.WeaponName) {
            PrintSystem(`无法获取${San.Data.Weapon}的名字，请确认是否拼写错误。`)
            return
        }
        if (San.Data.Helpers.length) {
            San.Data.CurrenHelper = App.Core.NPC.Kungfu[San.Data.Helpers.shift()]
            $.PushCommands(
                $.To(San.Data.CurrenHelper.Loc),
                $.Nobusy(),
                $.Plan(PlanShow),
            )
        } else if (!San.Data.Saned) {
            $.PushCommands(
                $.To(App.Params.LocDazuo),
                $.Nobusy(),
                $.Plan(PlanSan),
            )
        } else {
            $.PushCommands(
                $.Function(San.GoImbue)
            )
        }
        $.Next()
    }
    San.Data.LastItem = null
    San.FetchItem = (id) => {
        $.PushCommands()
        San.Data.LastItem = null
        if (!App.Data.Item.List.FindByIDLower(id).First()) {
            let qkitem = App.Data.QiankunBag.FindByIDLower(id).First()
            if (qkitem) {
                San.Data.LastItem = {
                    ID: id,
                    Qiankun: true,
                }
                $.Append(
                    $.Do(`fetch ${qkitem.Key} 1;i;l qiankun bag`),
                    $.Sync()
                )
            } else {
                San.Data.LastItem = {
                    ID: id,
                    Qiankun: false,
                }
                $.Append(
                    $.To("2682"),
                    $.Nobusy(),
                    $.Do(`take 1 ${id};i;`),
                    $.Nobusy(),
                )
            }
        }
        $.Append(
            $.Function(() => {
                if (!App.Data.Item.List.FindByIDLower(id).First()) {
                    PrintSystem(`获取道具${id}失败`)
                    return
                }
                App.Next()
            })
        )
        App.Next()
    }
    let Quest = App.Quests.NewQuest("san")
    Quest.Name = "san武器"
    Quest.Desc = "san 10lv"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.OnHUD = () => {
        return [
            new App.HUD.UI.Word("San:"),
            new App.HUD.UI.Word(San.Data.Times + ""),
        ]
    }
    Quest.OnSummary = () => {
        return [
            new App.HUD.UI.Word("San:"),
            new App.HUD.UI.Word(San.Data.Times + ""),
        ]
    }
    Quest.OnReport = () => {
        return [`San-${San.Data.WeaponName}(${San.Data.Weapon}) 次数:${San.Data.Times}`]
    }

    Quest.Start = function (data) {
        let weapon = data.trim()
        if (weapon == "") {
            PrintSystem("未指定要san的武器")
            return
        }
        San.Data.Weapon = weapon
        San.Start()
    }
    App.Quests.Register(Quest)
})