$.Module(function (App) {
    let Letter = {}
    let fangqi = {
        "襄阳": true,
        "关外": true,
    }
    class NPC {
        constructor(name) {
            this.Name = name
        }
        Name = ""
        ID = ""
        Zone = ""
        Times = 0
        Gived = false
        First = true
        SetZone(zone) {
            this.Zone = zone
            this.Times = 0
        }
    }
    let Cities = {}
    App.LoadLines("src/quests/mq/cities.txt", "|").forEach((data) => {
        Cities[data[0]] = {
            Name: data[0],
            Loc: data[1],
            ID: data[2],
            Path: data[3],
            Path1: data[4],
            Info: data[5].split(";")
        }
    })
    Letter.Data = {
        start: null,
    }
    Letter.Verify = () => {
        if (!App.Quests.Stopped) {
            $.PushCommands(
                $.To(App.Params.LocMaster),
                $.Function(Letter.AskQuest),
            )
        }
        $.Next()
    }
    Letter.Prepare = () => {
        $.PushCommands(
            $.Prepare("commonWithExp"),
            $.Function(Letter.Verify),
        )
        $.Next()
    }
    let reQuest = /^([^：()\[\]]{2,5})吩咐你在.+之前把信件送到(.+)手中，取回执交差。$/
    let reStart = /^据闻不久前此人曾经在(.+)。$/
    let reFail = /^([^：()\[\]]{2,5})一脸怒容对你道：“我不是让你.+前把信送到/
    let reNoMaster = "这里没有这个人，你怎么领任务？"
    let reNoQuest = "你现在没有领任何任务！"
    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            Letter.Data.NoMaster = false
            Letter.Data.NPC = null
            task.AddTrigger(reQuest, (tri, result) => {
                Letter.Data.NPC = new NPC(result[2])
                return true
            })
            task.AddTrigger(reStart, (tri, result) => {
                if (Letter.Data.NPC) {
                    Letter.Data.NPC.Zone = result[1].slice(0, 2)
                }
            })
            task.AddTrigger(reFail, () => {
                App.Send("quest cancel")
            })
            task.AddTrigger(reNoMaster, () => {
                Letter.Data.NoMaster = true
                return true
            })
            task.AddTrigger(reNoQuest)
            task.AddTrigger(/你现在没有领任何任务！/)
            task.AddTimer(3000)
            App.Send("give receipt to " + App.Params.MasterID + ";drop receipt;drop receipt 2;drop letter")
            App.Send("quest " + App.Params.MasterID)
            App.Send("quest")
        },
        (result) => {
            if (result != "cancel") {
                $.Next()
            }
        }
    )
    Letter.AskQuest = () => {
        $.PushCommands(
            $.Plan(PlanQuest),
            $.Function(() => {
                if (Letter.Data.NoMaster) {
                    Quest.Cooldown(3000000)
                    Note("师傅没了，任务冷却5分钟")
                } else if (Letter.Data.NPC) {
                    $.Insert($.Function(Letter.Ready))
                } else {
                    $.Insert(
                        $.Wait(1000),
                        $.Function(Letter.Ready),
                    )
                }
                App.Next()
            }),
        )
        $.Next()
    }
    let Checker = function (wanted) {
        let result = App.Map.Room.Data.Objects.FindByName(wanted.Target).Items
        for (var obj of result) {
            if (obj.ID.indexOf(" ") > 0) {
                if (Letter.Data.NPC && Letter.Data.NPC.Zone) {
                    Letter.Data.NPC.SetZone(Letter.Data.NPC.Zone)
                }
                return obj
            }
        }
        if (App.Map.Room.ID) {
            App.Map.Room.Data.Objects.Items.forEach((item) => {
                if (item.ID.indexOf(" ") > 0 && item.Label.length < 5) {
                    App.Core.HelpFind.OnNPC(item.Label, item.ID, App.Map.Room.ID)
                }
            })
        }
        return null
    }
    Letter.GiveReceipt = () => {
        $.PushCommands(
            $.To(App.Params.LocMaster),
            $.Do("give receipt to " + App.Params.MasterID + ";drop receipt;hp;score"),
        )
        $.Next()
    }
    Letter.Ready = () => {
        if (Letter.Data.NPC) {
            if (Letter.Data.NPC.Gived) {
                Note("交差")
                Letter.GiveReceipt()
                return
            }
            if (fangqi[Letter.Data.NPC.Zone]) {
                Note(`区域${Letter.Data.NPC.Zone}不适合，放弃`)
                Letter.AskQuest()
                return
            }
            Note("找人")
            Letter.GoKill()
            return
        }
        Note("准备")
        Letter.Prepare()
    }
    Letter.KillNear = () => {
        if (App.Map.Room.ID && !Letter.Data.NPC.Fled && !Letter.Data.NPC.Died) {
            Letter.Data.NPC.Loc = null
            let rooms = App.Mapper.ExpandRooms(App.Map.Room.ID, 2)
            App.Zone.Wanted = $.NewWanted(Letter.Data.NPC.Name, Letter.Data.NPC.Name.Zone).WithChecker(Checker).WithID(Letter.Data.NPC.ID)
            $.PushCommands(
                $.Rooms(rooms, App.Zone.Finder),
                $.Function(Letter.KillLoc),
            )
        }
        App.Next()
    }
    Letter.KillLoc = () => {
        if (App.Zone.Wanted.ID) {
            Letter.Data.NPC.ID = App.Zone.Wanted.ID
        }
        if (App.Map.Room.Data.Objects.FindByName(Letter.Data.NPC.Name).First()) {
            $.Insert(
                $.Plan(PlanGive),
                $.Function(() => {
                    if (!(Letter.Data.NPC.Died || Letter.Data.NPC.Fled)) {
                        $.Append($.Function(Letter.KillNear))
                    }
                    App.Next()
                })
            )
        }
        $.Next()
    }
    Letter.GoKill = () => {
        if (Letter.Data.NPC.Times > 3) {
            Note("找不到")
            App.Next()
            return
        }
        App.Core.HelpFind.HelpFind(Letter.Data.NPC.Name)
        let zone = Letter.Data.NPC.First ? Cities[Letter.Data.NPC.Zone].Path1 : Cities[Letter.Data.NPC.Zone].Path;
        Letter.Data.NPC.First = false
        App.Core.Stage.ChangeStance("mq")
        let wanted = $.NewWanted(Letter.Data.NPC.Name, zone).
            WithChecker(Checker).WithOrdered(true).WithID(Letter.Data.NPC.ID)
        App.Send("yun recover;yun regenerage")
        $.RaiseStage("prepare")
        $.PushCommands(
            $.Prepare(),
            $.To(Cities[Letter.Data.NPC.Zone].Loc),
            $.Function(() => { App.Zone.Search(wanted) }),
            $.Function(Letter.KillLoc),
            $.Function(() => {
                Letter.Data.NPC.Times++
                Note("第" + Letter.Data.NPC.Times + "次搜索完毕")
                Letter.Ready()
            }),

        )
        $.Next()
    }
    Letter.Connect = () => {
        $.PushCommands(
            $.Function(App.Core.Emergency.CheckDeath),
            $.Function(Letter.KillLoc)
        )
        $.Next()
    }
    let matcherGived = /^(.+)交给你一张回执。$/
    let PlanGive = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.AddTrigger(matcherGived, (tri, result) => {
                if (Letter.Data.NPC && Letter.Data.NPC.Name == result[1]) {
                    Letter.Data.NPC.Gived = true
                }
                return true
            })
            App.Send("give letter to " + Letter.Data.NPC.ID)
            App.Sync()
        },
        (result) => {
            App.Next()
        })
    App.BindEvent("core.helpfind.onfound", (event) => {
        let name = event.Data.Name
        let id = event.Data.ID
        let loc = event.Data.Loc
        if (Letter.Data.NPC && Letter.Data.NPC.Name == name) {
            if (!incity(loc, "很远")) {
                return
            }
            if (!Letter.Data.NPC.ID && id) {
                Letter.Data.NPC.ID = id.toLowerCase()
            }
            if (!Letter.Data.NPC.Loc) {
                Letter.Data.helpded++
                Letter.Data.NPC.Loc = loc
            }
            if (App.Zone.Wanted && App.Zone.Wanted.Target == name) {
                App.Zone.Wanted.Loc = loc
            }
            Note("接到线报:" + name + "|" + id + "|" + loc)
            Letter.Data.NPC.Farlist = null
        }
    })
    function incity(coor, cy) {
        if (Trim(coor) == "")
            return false;

        if (cy == "很远") {
            for (var key in Cities) {
                if (incity(coor, key)) {
                    return true;
                }
            }
            return false
        }


        if (cy == "长安" && ((coor >= 244 && coor <= 381) || coor == 20 || coor == 709 || coor == 909
            || coor == 1010 || coor == 1139))
            return true;

        if (cy == "成都" && ((coor >= 659 && coor <= 708) || coor == 1610 || coor == 1611))
            return true;

        if (cy == "大理" && ((coor >= 423 && coor <= 647) || coor == 1608))
            return true;

        if (cy == "佛山" && ((coor >= 388 && coor <= 422) || coor == 1467 || coor == 1468))
            return true;

        if (cy == "福州" && ((coor >= 198 && coor <= 243) || coor == 1464))
            return true;

        if (cy == "关外" && (coor >= 1211 && coor <= 1248))

            return true;

        if (cy == "杭州" && ((coor >= 190 && coor <= 194) || (coor >= 785 && coor <= 891) || coor == 911
            || coor == 986 || coor == 1573 || coor == 1672 || coor == 1673))
            return true;

        if (cy == "华山" && ((coor >= 248 && coor <= 251) || (coor >= 987 && coor <= 1005)
            || (coor >= 1025 && coor <= 1065) || coor == 1712))
            return true;

        if (cy == "灵州" && ((coor >= 1175 && coor <= 1207) || coor == 1659 || coor == 1660))
            return true;

        if (cy == "南海" && ((coor >= 390 && coor <= 421) || coor == 1468))
            return true;

        if (cy == "泉州" && ((coor >= 207 && coor <= 216) || (coor >= 411 && coor <= 413)))
            return true;

        if (cy == "汝州" && ((coor >= 1068 && coor <= 1127) || (coor >= 2499 && coor <= 2503)))
            return true;

        if (cy == "嵩山" && (coor >= 1068 && coor <= 1138) || (coor >= 2499 && coor <= 2503))
            return true;

        if (cy == "苏州" && ((coor >= 190 && coor <= 194) || (coor >= 785 && coor <= 787)
            || (coor >= 911 && coor <= 986) || coor == 68 || coor == 69 || coor == 1564
            || coor == 1573 || coor == 1574 || coor == 1577 || coor == 1681))
            return true;

        if (cy == "天山" && ((coor >= 1157 && coor <= 1167) || coor == 1150))
            return true;

        if (cy == "武功" && ((coor >= 276 && coor <= 279) || (coor >= 709 && coor <= 728)
            || (coor >= 892 && coor <= 909)))
            return true;

        if (cy == "西域" && ((coor >= 700 && coor <= 707) || (coor >= 1139 && coor <= 1172)
            || (coor >= 1632 && coor <= 1654) || (coor >= 1753 && coor <= 1786)
            || (coor >= 1808 && coor <= 1811) || coor == 301 || coor == 666 || coor == 1797 || coor == 2764))
            return true;

        if (cy == "襄阳" && ((coor >= 77 && coor <= 189) || coor == 19 || coor == 20 || coor == 244
            || coor == 1566 || coor == 1567))
            return true;

        if (cy == "星宿" && (coor >= 1140 && coor <= 1172))
            return true;

        if (cy == "扬州" && ((coor >= 0 && coor <= 78) || (coor >= 190 && coor <= 193)
            || (coor >= 244 && coor <= 247) || (coor >= 1025 && coor <= 1039)
            || (coor >= 1454 && coor <= 1459) || (coor >= 1558 && coor <= 1565)
            || (coor >= 1681 && coor <= 1686) || (coor >= 1733 && coor <= 1739)
            || (coor >= 2490 && coor <= 2496) || coor == 147 || coor == 382 || coor == 785
            || coor == 786 || coor == 1143 || coor == 1713))
            return true;

        if (cy == "终南" && ((coor >= 276 && coor <= 279) || (coor >= 709 && coor <= 784)
            || (coor >= 892 && coor <= 909)))
            return true;

        return false;
    }

    let Quest = App.Quests.NewQuest("letter")
    Quest.Name = "送信任务"
    Quest.Desc = ""
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Start = function (data) {
        if (!App.Params.MasterID) {
            PrintSystem("掌门ID " + App.Params.MasterID + " 无效")
            return
        }
        if (!App.Params.LocMaster) {
            PrintSystem("掌门位置 " + App.Params.LocMaster + " 无效")
            return
        }
        Letter.Data.NPC = null
        Letter.Prepare()
    }
    App.Quests.Register(Quest)
})