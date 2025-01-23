$.Module(function (App) {
    let MQ = {}
    let farlist = ["佛山", "南海", "泉州", "福州", "汝州", "嵩山", "星宿", "天山", "武功", "灵州", "长安", "华山", "襄阳", "扬州", "苏州", "杭州", "成都", "终南", "关外", "大理", "西域"]
    class NPC {
        constructor(name) {
            this.Name = name
        }
        Name = ""
        ID = ""
        Zone = ""
        Times = 0
        Die = false
        Fled = false
        First = true
        NotKilled = true
        Info = []
        Farlist = null
        Head = false
        Loc = null
        Flee() {
            this.First = false
            this.Fled = true
            this.Loc = null
            this.Info = [...Cities[this.Zone].Info]
        }
        SetZone(zone) {
            this.Zone = zone
            this.Fled = false
            this.Info = []
            this.Farlist = null
            this.Times = 0
        }
        NextFar() {
            this.Zone = this.Farlist.shift()
            this.Times = 0
            this.Fled = false
            this.Info = []
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
    MQ.Data = {
        kills: 0,
        helpded: 0,
        start: null,
        current: null,
        eff: 0,
    }
    MQ.NeedJiqu = (letter) => {
        if (App.Core.Study.Jiqu.Max > 0 && App.QuestParams["mqtihui"] > 0) {
            if (!letter && MQ.HelpRate() < 50) {
                return false
            }
            let tihui = App.QuestParams["mqtihui"]
            let lettertihui = App.QuestParams["mqtihui"] * 3
            let lettertihuimax = (App.Core.Study.Jiqu.Max + App.QuestParams["mqtihui"]) / 2
            if (lettertihui > lettertihuimax) {
                lettertihui = lettertihuimax.toFixed()
            }
            return App.Data.Player.HP["体会"] >= (letter ? lettertihui : tihui)
        }
        return false

    }
    MQ.HelpRate = () => {
        return MQ.Data.kills > 3 ? (MQ.Data.helpded * 100 / MQ.Data.kills) : 0
    }
    MQ.OnNpcDie = function () {
        $.RaiseStage("npcdie")
    }
    MQ.LastPause = 0
    MQ.Pause = () => {
        $.Insert(
            $.Do("#jiqu"),
            $.Wait(1000),
            $.Function(() => {
                MQ.LastPause = $.Now()
                App.Send("halt")
                $.Next()
            })
        )
        $.Next()
    }
    MQ.OnNpcFaint = function () {
        $.RaiseStage("npcfaint")
    }
    MQ.CheckYou = () => {
        $.PushCommands(
            $.Function(() => {
                App.Core.NPC.CheckYouxun(MQ.Data.NPC.Name, MQ.Data.NPC.ID)
            }),
            $.Function(() => {
                if (App.Core.NPC.AskYouxunData.Live) {
                    MQ.Far()
                } else {
                    MQ.GiveHead()
                }
            })
        )
        $.Next()
    }
    MQ.Verify = () => {
        if (!App.Quests.Stopped) {
            $.PushCommands(
                $.To(App.Params.LocMaster),
                $.Function(MQ.AskQuest),
            )
        }
        $.Next()
    }
    MQ.Prepare = () => {
        $.PushCommands(
            $.Prepare("commonWithExp"),
            $.Function(MQ.Verify),
        )
        $.Next()
    }
    MQ.CanAccept = () => {
        if (App.Quests.Stopped) {
            return false
        }
        if (App.Core.Dispel.Need) {
            return false
        }
        if (MQ.Data.NPC.Head == false) {
            return true
        }
        if (App.QuestParams["mqletter"] == 2) {
            return false
        }
        let context = {}
        if (App.Core.Weapon.Touch) {
            context.NeiliMin = -100
        }
        let submit = App.Proposals.Submit("commonWithExp", context)
        if (submit) {
            return false
        }
        let ready = App.Quests.GetReady()
        if (ready && ready.RunningQuest && ready.RunningQuest.ID != Quest.ID) {
            return false
        }
        if (MQ.NeedJiqu(true)) {
            return true
        }
        return App.QuestParams["mqletter"] == 1
    }
    let reQuest = /^([^：()\[\]]{2,5})对你道：“我早就看(.*)不顺眼，听说他最近在(.*)，你去做了他，带他的人头来交差！/
    let reQuest2 = /^([^：()\[\]]{2,5})对你道：“(.*)(这个败类打家劫舍，无恶不作，听说他最近在|这个所谓大侠屡次和我派作对，听说他最近在)/
    let reStart = /^据说此人前不久曾经在(.*)出没。/
    let reFlee = /(.{2,5})在(.*)失踪了！现在不知道去了哪里！/
    let reFail = /^([^：()\[\]]{2,5})一脸怒容对你道：“我不是让你.+前杀了/
    let reNoMaster = "这里没有这个人，你怎么领任务？"
    let reNoQuest = "你现在没有领任何任务！"
    let reCurrent = /^师长交给你的任务，你已经连续完成了 (\d+) 个。$/
    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            let fled = false
            MQ.Data.NoMaster = false
            MQ.Data.NPC = null
            MQ.Data.current = null
            task.AddTrigger(reQuest, (tri, result) => {
                MQ.Data.NPC = new NPC(result[2])
                return true
            })
            task.AddTrigger(reQuest2, (tri, result) => {
                MQ.Data.NPC = new NPC(result[2])
                return true
            })
            task.AddTrigger(reStart, (tri, result) => {
                if (MQ.Data.NPC) {
                    MQ.Data.NPC.Zone = result[1].slice(0, 2)
                    if (fled) {
                        MQ.Data.NPC.Flee()
                    }
                }
            })
            task.AddTrigger(reFlee, (tri, result) => {
                if (MQ.Data.NPC && result[1].endsWith(MQ.Data.NPC.Name)) {
                    Note("NPC跑了。")
                    fled = true
                }
                return true
            })
            task.AddTrigger(reFail, () => {
                App.Send("quest cancel")
            })
            task.AddTrigger(reNoMaster, () => {
                MQ.Data.NoMaster = true
                return true
            })
            task.AddTrigger(reCurrent, (tri, result) => {
                MQ.Data.current = result[1] - 0
                return true
            })
            task.AddTrigger(reNoQuest)
            task.AddTrigger(/你现在没有领任何任务！/)
            task.AddTimer(3000)
            $.RaiseStage("mqgivehead")
            App.Send("give head to " + App.Params.MasterID + ";drop head")
            $.RaiseStage("mqbefore")
            App.Sync(() => {
                App.Send("quest " + App.Params.MasterID)
                App.Send("quest")
            })

        },
        (result) => {
            if (result != "cancel") {
                $.Next()
            }
        }
    )
    MQ.GiveHead = () => {
        $.PushCommands(
            $.To(App.Params.LocMaster),
            $.Function(() => {
                $.RaiseStage("mqgivehead")
                $.Next()
            }),
            $.Do("give head to " + App.Params.MasterID + ";drop head"),
            // $.Function(MQ.Prepare),
        )
        $.Next()
    }

    MQ.AskQuest = () => {
        $.PushCommands(
            $.To(App.Params.LocMaster),
            $.Plan(PlanQuest),
            $.Function(() => {
                if (MQ.Data.NoMaster) {
                    Quest.Cooldown(3000000)
                    Note("师傅没了，任务冷却5分钟")
                    App.Log("师傅没了")
                } else if (MQ.Data.NPC) {
                    $.Insert($.Function(MQ.Ready))
                } else {
                    $.Insert(
                        $.Wait(1000),
                        $.Function(MQ.Ready),
                    )
                }
                App.Next()
            }),
        )
        $.Next()
    }
    let Checker = function (wanted) {
        let result = App.Map.Room.Data.Objects.FindByLabel(wanted.Target).Items
        for (var obj of result) {
            if (obj.ID.indexOf(" ") > 0) {
                if (MQ.Data.NPC) {
                    if (App.Map.Room.ID) {
                        MQ.Data.NPC.Loc = App.Map.Room.ID
                    }
                    if (MQ.Data.NPC.Zone) {
                        MQ.Data.NPC.SetZone(MQ.Data.NPC.Zone)
                    }
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
    let Next = function (map, move, wanted) {
        if (App.QuestParams["mqnopause"] == 0) {
            if (MQ.NeedJiqu()) {
                if (Metronome.GetSpace() <= 3 && ($.Now() - MQ.LastPause > 1000)) {
                    Note("走的太快，汲取一下")
                    let snap = App.Map.Snap()
                    $.Insert(
                        $.Function(MQ.Pause),
                        $.Function(() => {
                            App.Map.Rollback(snap)
                            App.Zone.DefaultNext(map, move, wanted)
                        })
                    )
                    $.Next()
                    return
                }
            }
        }
        App.Zone.DefaultNext(map, move, wanted)
    }
    let matcherLetter = /.*(突然一位|忽听“嗖”的一声|你转身一看|你一回头|你正欲离开|只见你刚想离开|只听扑倏扑倏几声)(.*)(弟子急急忙忙地跑了上来，拍拍你的肩膀|一件暗器从你背后飞来|竟见到一只灰点信鸽飞至身旁，你赶紧|只见一位同门装束的弟子满头大汗地跑了过来|忽然发现不远处的地上一块石头上刻着些什么|一位同门装束的弟子追了上来|一只白鸽飞了过来，落在你肩头)/
    let matcherlq1 = /^“字谕弟子(.*)：(得闻恶贼|武林人士|得闻所谓大侠)(.*)(屡次和我派作对|打家劫舍|所为甚是讨厌)(.*)/
    // let matcherlq2 = /(.*)正是大好机会将他除去，你若愿意/
    let matcherAccept = /^如果你愿意接受此任务，请在(.*)秒之内/
    let PlanWaitLetter = new App.Plan(
        App.Positions["Connect"],
        (task) => {
            let mode = 0
            let location = ""
            let name = ""
            task.AddTrigger(matcherLetter, (tri, result) => {
                if (mode == 0) {
                    mode = 1
                    App.Send("l letter of me");
                }
                return true
            })
            task.AddTrigger(matcherlq1, (tri, result) => {
                if (mode == 1 || mode == 0) {
                    mode = 2
                    name = result[3]
                    location = result[5]
                }
                return true
            })
            // task.AddTrigger(matcherlq2, (tri, result) => {
            //     if (mode == 2) {
            //         mode = 3
            //         location += result[1]
            //     }
            //     return true
            // })
            task.AddTrigger(matcherAccept, (tri, result) => {
                if (mode == 2) {
                    mode = 4
                    if (location.indexOf("西域") != -1 || location.indexOf("大理") != -1) {
                        return false
                    }
                    App.Send("accept quest;quest;drop head")
                }
                return true
            })
            task.AddTrigger(reStart, (tri, result) => {
                if (mode == 4) {
                    if (name) {
                        task.Data = new NPC(name)
                        task.Data.SetZone(result[1].slice(0, 2))
                        return false
                    }
                }
                return true
            })
            task.AddTimer(10000)
            App.Send("l letter of me")
        },
        (result) => {
            if (result.Task.Data) {
                MQ.Data.NPC = result.Task.Data
            }
            App.Send("halt;yun recover;hp")
            $.PushCommands(
                $.Sync(),
                $.Function(result.Task.Data ? MQ.Ready : MQ.GiveHead),
            )
            $.Next()
        }
    )
    MQ.WaitLetter = () => {
        Note("接信")
        if (App.Data.Player.HP["经验"] > 100000 && App.Core.Study.Jiqu.Max && App.Core.Study.Jiqu.Max > 0 && App.Core.Study.Jiqu.Commands.length && App.Data.Player.HP["体会"] > App.Core.Study.Jiqu.Max && App.Data.Player.HP["精气百分比"] > 70) {
            App.Send(App.Random(App.Core.Study.Jiqu.Commands))
        }
        $.RaiseStage("wait")
        PlanWaitLetter.Execute()
    }
    MQ.Ready = () => {

        if (MQ.Data.NPC) {
            if (MQ.Data.NPC.Died) {
                $.PushCommands(
                    $.Function(App.Check),
                    $.Function(function () {
                        Note("交头")
                        if (MQ.CanAccept()) {
                            MQ.WaitLetter()
                            return
                        }
                        Note("不接信")
                        MQ.GiveHead()
                    }),
                )
                $.Next()
                return
            }
            if (MQ.Data.NPC.Fled) {
                MQ.AskInfo()
                return
            }
            Note("追杀")
            MQ.GoKill()
            return
        }
        Note("准备")
        MQ.Prepare()
    }
    MQ.Far = () => {
        if (MQ.Data.NPC.Farlist == null) {
            MQ.Data.NPC.Farlist = [...farlist]
            let exp = App.Data.Player.HP["经验"]
            if (exp < 150000) {
                MQ.Data.NPC.Farlist = MQ.Data.NPC.Farlist.slice(0, -4)
            } else if (exp < 400000) {
                MQ.Data.NPC.Farlist = MQ.Data.NPC.Farlist.slice(0, -2)
            } else if (exp < 700000) {
                MQ.Data.NPC.Farlist = MQ.Data.NPC.Farlist.slice(0, -1)
            } else {
                MQ.Data.NPC.Farlist.unshift(MQ.Data.NPC.Farlist.pop())
            }
            MQ.Data.NPC.Loc = null
            MQ.Data.NPC.NextFar()
            MQ.Ready()
            return
        }
        if (MQ.Data.NPC.Farlist.length) {
            MQ.Data.NPC.NextFar()
            $.PushCommands($.Prepare(), $.Function(MQ.Ready))
            $.Next()
            return
        }
        Note("很远没找到，放弃")
        MQ.GiveHead()
    }
    MQ.KillNear = () => {
        if (App.Map.Room.ID && !MQ.Data.NPC.Fled && !MQ.Data.NPC.Died) {
            MQ.Data.NPC.Loc = null
            let rooms = App.Mapper.ExpandRooms(App.Map.Room.ID, 2)
            App.Zone.Wanted = $.NewWanted(MQ.Data.NPC.Name, MQ.Data.NPC.Zone).WithChecker(Checker).WithID(MQ.Data.NPC.ID)
            $.PushCommands(
                $.Rooms(rooms, App.Zone.Finder),
                $.Function(MQ.KillLoc),
            )
        }
        App.Next()
    }
    MQ.KillLoc = () => {
        if (!MQ.Data.NPC.ID && App.Zone.Wanted.ID) {
            MQ.Data.NPC.ID = App.Zone.Wanted.ID
        }

        if (App.Map.Room.Data.Objects.FindByLabel(MQ.Data.NPC.Name).First()) {
            App.Map.Room.Data.Objects.Clear()
            $.Insert(
                $.Kill(MQ.Data.NPC.ID, App.NewCombat("mq").WithPlan(PlanCombat).WithKillInGroup(MQ.Data.NPC.NotKilled)),
                $.Function(() => {
                    if (!(MQ.Data.NPC.Died || MQ.Data.NPC.Fled)) {
                        $.Append($.Function(MQ.KillNear))
                    }
                    App.Next()
                })
            )
        } else {
            MQ.Data.NPC.Loc = null
        }
        $.Next()
    }
    MQ.GoKill = () => {
        if (MQ.Data.NPC.Times > 3) {
            Note("找不到")
            MQ.CheckYou()
            return
        }
        App.Core.HelpFind.HelpFind(MQ.Data.NPC.Name)
        let zone = MQ.Data.NPC.First ? Cities[MQ.Data.NPC.Zone].Path1 : Cities[MQ.Data.NPC.Zone].Path;
        MQ.Data.NPC.First = false
        let wanted = $.NewWanted(MQ.Data.NPC.Name, zone).
            WithChecker(Checker).WithNext(Next).WithOrdered(true).WithID(MQ.Data.NPC.ID)
        $.PushCommands(
            $.Function(() => {
                if (MQ.Data.NPC.Times > 0 && MQ.Data.NPC.Zone != "西域") {
                    if (App.QuestParams["mqnopause"] == 0) {
                        if (MQ.NeedJiqu()) {
                            Note("遍历之前，汲取一下")
                            $.RaiseStage("mqpause")
                            $.Insert(
                                $.Function(MQ.Pause),
                            )
                        }
                    }
                }
                App.Next()
            }),
            $.Prepare(),
            $.To(Cities[MQ.Data.NPC.Zone].Loc),
            $.Function(() => {
                App.Send("yun recover;yun regenerage")
                if (App.Data.Item.List.FindByID("head").Sum() > 2) {
                    App.Send("drop head;i")
                }
                $.RaiseStage("prepare")
                $.PushCommands(
                    $.Sync(),
                    $.Function(() => {
                        if (MQ.Data.NPC.Loc) {
                            App.Zone.SearchRooms(MQ.Data.NPC.Loc, wanted)
                        } else {
                            App.Zone.Search(wanted)
                        }
                    })
                )
                $.Next()
            }),
            $.Function(MQ.KillLoc),
            $.Function(() => {
                MQ.Data.NPC.Times++
                Note("第" + MQ.Data.NPC.Times + "次搜索完毕")
                MQ.Ready()
            }),

        )
        $.Next()
    }
    MQ.Connect = () => {
        planQuest.Execute()
        $.PushCommands(
            $.Function(App.Core.Emergency.CheckDeath),
            $.Function(() => {
                App.Core.Weapon.PickWeapon()
                $.Next()
            }),
            $.Function(MQ.KillLoc)
        )
        $.Next()
    }
    let matcherDie = /^(.+)扑在地上挣扎了几下，腿一伸，口中喷出几口鲜血，死了！$/
    let matcherFaint = /^(.+)脚下一个不稳，跌在地上一动也不动了。$/
    let matcherFlee2 = /^你连连进击，眼看便要得手，接连数招，让(.+)已是避/
    let matcherFlee3 = /^在你一阵狂攻之下，(.+)只有招架之功，哪里还有/
    let matcherFlee = /^(.+)(摇摇欲坠|身负重伤|狂叫一声|晃了两下|再退一步|已是避|深吸一口气，神色略微好了)(.*)/
    let matcherHelper = /^看起来(.+)想杀死你！$/
    let PlanCombat = new App.Plan(
        App.Positions["Combat"],
        (task) => {
            task.AddTrigger(matcherDie, (tri, result) => {
                if (MQ.Data.NPC && MQ.Data.NPC.Name == result[1]) {
                    MQ.Data.NPC.Died = true
                    App.Send("cut head from corpse;get head")
                    MQ.OnNpcDie()
                    App.RaiseEvent(new App.Event("core.combatstop"))
                }
                return true
            })
            task.AddTrigger(matcherFaint, (tri, result) => {
                if (MQ.Data.NPC && MQ.Data.NPC.Name == result[1]) {
                    MQ.Data.NPC.Died = true
                    MQ.OnNpcFaint()
                }
                return true
            })

            task.AddTrigger(matcherFlee, (tri, result) => {
                if (MQ.Data.NPC && MQ.Data.NPC.Name == result[1]) {
                    MQ.Data.NPC.Flee()
                    Note("NPC跑了。")
                }
                return true
            })
            task.AddTrigger(matcherFlee2, (tri, result) => {
                if (MQ.Data.NPC && MQ.Data.NPC.Name == result[1]) {
                    MQ.Data.NPC.Flee()
                    Note("NPC跑了。")
                }
                return true
            })
            task.AddTrigger(matcherFlee3, (tri, result) => {
                if (MQ.Data.NPC && MQ.Data.NPC.Name == result[1]) {
                    MQ.Data.NPC.Flee()
                    Note("NPC跑了。")
                }
                return true
            })
            task.AddTrigger(matcherHelper, function (tri, result) {
                if (MQ.Data.NPC) {
                    if (result[1] == MQ.Data.NPC.Name) {
                        MQ.Data.NPC.NotKilled = false
                    } else {
                        return
                    }
                    return true
                }
            }).WithName("helper")
        },
        (result) => {
            if (result.Name == "helper") {
                App.Reconnect(0, MQ.Connect)
            }
        })
    MQ.AskInfo = function () {
        $.PushCommands(
            $.Prepare("common"),
            $.Function(MQ.GoAskInfo),
        )
        App.Next()
    }
    let reCity = /^.*说道：.*(好像听人说过是在|他不是在|据说是躲到|好像去了|已经躲到|好像是去了|但是也有人说他在|有人说在|不过听人说在|听说是在|不过听说他好像在|现在应该是去了)(.*)/
    MQ.GoAskInfo = function () {
        if (MQ.Data.NPC.Info.length) {
            let infoid = MQ.Data.NPC.Info.shift()
            let info = App.Zone.Info[infoid]
            if (info) {
                $.PushCommands(
                    $.To(info.Loc),
                    $.Nobusy(),
                    $.Ask(info.NPC, MQ.Data.NPC.Name, 1),
                    $.Function(() => {
                        if (App.Data.Ask.Answers.length) {
                            let result = App.Data.Ask.Answers[0].Line.match(reCity)
                            if (result) {
                                let city = result[2].slice(0, 2)
                                if (city == "很远") {
                                    MQ.Far()
                                    return
                                }
                                MQ.Data.NPC.SetZone(city)
                                MQ.Data.Fled = false
                                MQ.Ready()
                                return
                            }
                        }
                        MQ.AskInfo()
                    })
                )
                App.Next()
                return
            }
            MQ.AskInfo()
        }
        Note("没人知道")
        MQ.CheckYou()
    }


    App.BindEvent("core.helpfind.onfound", (event) => {
        let name = event.Data.Name
        let id = event.Data.ID
        let loc = event.Data.Loc
        if (MQ.Data.NPC && MQ.Data.NPC.Name == name) {
            let city = ""
            for (var key in Cities) {
                if (incity(loc, key)) {
                    city = key;
                    break
                }
            }
            if (city == "") {
                return
            }
            if (!MQ.Data.NPC.ID && id) {
                MQ.Data.NPC.ID = id.toLowerCase()
            }
            if (!MQ.Data.NPC.Loc && !MQ.Data.NPC.Died) {
                Note("接到线报:" + name + "|" + id + "|" + loc)
                MQ.Data.helpded++
                MQ.Data.NPC.Loc = loc
                MQ.Data.NPC.SetZone(city)
            }
            if (App.Zone.Wanted && App.Zone.Wanted.Target == name) {
                App.Zone.Wanted.Loc = loc
            }
            MQ.Data.NPC.Farlist = null
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

    let Quest = App.Quests.NewQuest("mq")
    Quest.Name = "师门任务"
    Quest.Desc = ""
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Group = "mq"
    Quest.OnHUD = () => {
        return [
            new App.HUD.UI.Word("任务效率:"),
            new App.HUD.UI.Word(MQ.Data.kills > 3 ? MQ.Data.eff.toFixed(0) : "-", 5, true),
        ]
    }
    Quest.OnSummary = () => {
        return [
            new App.HUD.UI.Word("效:"),
            new App.HUD.UI.Word(MQ.Data.kills > 3 ? MQ.Data.eff.toFixed(0) : "-", 5, true),
        ]
    }
    Quest.OnReport = () => {
        let eff = MQ.Data.kills > 3 ? MQ.Data.eff.toFixed(0) + "个/小时" : "-"
        let num = MQ.HelpRate()
        let rate = num ? num.toFixed(0) + "%" : "-"
        return [`MQ-总数:${MQ.Data.kills} 效率:${eff} 线报率:${rate} 当前任务:${MQ.Data.current || 0}`]
    }
    let matcherHead = /^你捡起一颗(.+)的人头。$/
    let matcherreward = /^通过这次锻炼，你获得了/
    let planQuest = new App.Plan(App.Quests.Position,
        (task) => {
            task.AddTrigger(matcherHead, (tri, result) => {
                if (MQ.Data.NPC && MQ.Data.NPC.Name == result[1]) {
                    MQ.Data.NPC.Head = true
                }
                return true
            })
            task.AddTrigger(matcherreward, (tri, result) => {
                let msg = "任务成功"
                if (MQ.Data.kills == 0) {
                    MQ.Data.start = $.Now()
                }
                MQ.Data.kills++
                if (MQ.Data.kills > 3) {
                    MQ.Data.eff = MQ.Data.kills * 3600 * 1000 / ($.Now() - MQ.Data.start)
                    msg += " 任务效率：" + MQ.Data.eff.toFixed() + " 个/小时,共计" + MQ.Data.kills + "个任务," + "线报率 " + (MQ.Data.helpded * 100 / MQ.Data.kills).toFixed(2) + "%"
                }
                Note(msg)
                return true
            })
        },
    )
    Quest.Start = function (data) {
        if (!App.Params.MasterID) {
            PrintSystem("掌门ID " + App.Params.MasterID + " 无效")
            return
        }
        if (!App.Params.LocMaster) {
            PrintSystem("掌门位置 " + App.Params.LocMaster + " 无效")
            return
        }
        MQ.Data.NPC = null
        planQuest.Execute()
        MQ.Prepare()
    }
    App.BindEvent("core.queststart", (e) => {
        MQ.Data = {
            kills: 0,
            helpded: 0,
            start: null,
            current: null,
            eff: 0,
        }
    })
    App.Quests.Register(Quest)
})