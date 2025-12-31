//assist模块，辅助他人
$.Module(function (App) {
    let incity = App.Include("src/quests/mq/incity.js")
    let Assisting = {}
    let farlist = ["佛山", "南海", "泉州", "福州", "汝州", "嵩山", "星宿", "天山", "武功", "灵州", "长安", "华山", "襄阳", "扬州", "苏州", "杭州", "成都", "终南", "关外", "大理", "西域"]
    //NPC接口
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
        //设置NPC逃跑
        Flee() {
            this.First = false
            this.Fled = true
            this.Loc = null
            this.Info = [...Cities[this.Zone].Info]
        }
        // 设置NPC区域
        SetZone(zone) {
            this.Zone = zone
            this.Fled = false
            this.Info = []
            this.Farlist = null
            this.Times = 0
        }
        // 进入下一个很远城市
        NextFar() {
            this.Zone = this.Farlist.shift()
            this.Times = 0
            this.Fled = false
            this.Info = []
        }
    }
    let Cities = {}
    //加载城市数据
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
    Assisting.Data = {
        kills: 0,
        helpded: 0,
        start: null,
        current: null,
        eff: 0,
    }
    let matcherNPC = /^npc (\S+)-(\S+)-(\S+)$/
    //等待行动的计划
    let PlanWaitReady = new App.Plan(
        App.Positions["Room"],
        (task) => {
            let prefix = `quests.asssisted ${Assisting.Data.Assist} `
            task.AddCatcher("core.localBroadcast", (catcher, event) => {
                let msg = event.Data
                if (msg.startsWith(prefix)) {
                    let data = msg.slice(prefix.length)
                    Note(`收到广播 ${data}`)
                    if (data == "ready") {
                        Assisting.Send("ready")
                        catcher.WithName("ready")
                        return true
                    } else if (data.startsWith("npc ")) {
                        var result = data.match(matcherNPC)
                        if (result) {
                            Assisting.Data.NPC = new NPC(result[1])
                            Assisting.Data.NPC.SetZone(result[2])
                            if (result[3] == "t") {
                                Assisting.Data.NPC.Fled = true
                            }
                            catcher.WithName("NPC")
                            return false
                        }
                    }
                }
                return true
            })
            task.AddTimer(30000).WithName("timeout")
            App.Send(`assist ${Assisting.Data.Assist}`)
            Assisting.Send("ready")
        },
        (result) => {
            switch (result.Name) {
                case "NPC":
                    Assisting.Ready()
                    return
            }
            Assisting.Prepare()
        }
    )
    //取消任务
    Assisting.Cancel = () => {
        Assisting.Send("cancel")
        Assisting.Data.NPC = null
        Assisting.WaitReady()
    }
    //等待
    Assisting.WaitReady = () => {
        Note("进入准备模式")
        $.PushCommands(
            $.To("2046"),
            $.Plan(PlanWaitReady)
        )
        $.Next()
    }
    //组内发送
    Assisting.Send = (data) => {
        let msg = `quests.asssisting ${GetVariable("id")} ${data}`
        Note(`发出广播 ${data}`)
        Broadcast(msg, false)
    }
    Assisting.OnNpcFaint = function () {
        $.RaiseStage("npcfaint")
        Assisting.Send(`ok ${App.Map.Room.ID ? App.Map.Room.ID : Assisting.Data.NPC.Loc}-${Assisting.Data.NPC.ID}`)
    }
    //检查NPC是否还在
    Assisting.CheckYou = () => {
        $.PushCommands(
            $.Function(() => {
                App.Core.NPC.CheckYouxun(Assisting.Data.NPC.Name, Assisting.Data.NPC.ID)
            }),
            $.Function(() => {
                if (App.Core.NPC.AskYouxunData.Live) {
                    Assisting.Far()
                } else {
                    Assisting.Cancel()
                }
            })
        )
        $.Next()
    }
    //验证任务
    Assisting.Verify = () => {
        if (!App.Quests.Stopped) {
            Assisting.WaitReady()
            return
        }
        $.Next()
    }
    //准备辅助
    Assisting.Prepare = () => {
        $.PushCommands(
            $.Prepare("commonWithExp"),
            $.Function(Assisting.Verify),
        )
        $.Next()
    }

    //找NPC的检查器
    let Checker = function (wanted) {
        let result = App.Map.Room.Data.Objects.FindByLabel(wanted.Target).Items
        for (var obj of result) {
            if (obj.ID.indexOf(" ") > 0) {
                if (Assisting.Data.NPC) {
                    if (App.Map.Room.ID) {
                        Assisting.Data.NPC.Loc = App.Map.Room.ID
                    }
                    if (Assisting.Data.NPC.Zone) {
                        Assisting.Data.NPC.SetZone(Assisting.Data.NPC.Zone)
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
    //任务开始
    Assisting.Ready = () => {

        if (Assisting.Data.NPC) {
            if (Assisting.Data.NPC.Died) {
                Assisting.Prepare()
                return
            }
            if (Assisting.Data.NPC.Fled) {
                Assisting.AskInfo()
                return
            }
            Note("追杀")
            Assisting.GoKill()
            return
        }
        Note("准备")
        Assisting.Prepare()
    }
    //NPC在很远
    Assisting.Far = () => {
        if (Assisting.Data.NPC.Farlist == null) {
            Assisting.Data.NPC.Farlist = [...farlist]
            Assisting.Data.NPC.Loc = null
            Assisting.Data.NPC.NextFar()
            Assisting.Ready()
            return
        }
        if (Assisting.Data.NPC.Farlist.length) {
            Assisting.Data.NPC.NextFar()
            $.PushCommands($.Prepare(), $.Function(Assisting.Ready))
            $.Next()
            return
        }
        Note("很远没找到，放弃")
        Assisting.Cancel()
    }
    //就进击杀，NPC没杀成功的话就近及格寻找
    Assisting.KillNear = () => {
        if (App.Map.Room.ID && !Assisting.Data.NPC.Fled && !Assisting.Data.NPC.Died) {
            Assisting.Data.NPC.Loc = null
            let rooms = App.Mapper.ExpandRooms([App.Map.Room.ID], 2)
            App.Zone.Wanted = $.NewWanted(Assisting.Data.NPC.Name, Assisting.Data.NPC.Zone).WithChecker(Checker).WithID(Assisting.Data.NPC.ID)
            $.PushCommands(
                $.Rooms(rooms, App.Zone.Finder),
                $.Function(Assisting.KillLoc),
            )
        }
        App.Next()
    }
    //定点击杀，确认NPC位置后前往击杀
    Assisting.KillLoc = () => {
        if (App.Zone.Wanted.ID) {
            Assisting.Data.NPC.ID = App.Zone.Wanted.ID
        }

        if (App.Map.Room.Data.Objects.FindByName(Assisting.Data.NPC.Name).First()) {
            $.Insert(
                $.Kill(Assisting.Data.NPC.ID, App.NewCombat("mq").WithPlan(PlanCombat).WithKillInGroup(Assisting.Data.NPC.NotKilled)),
                $.Function(() => {
                    if (!(Assisting.Data.NPC.Died || Assisting.Data.NPC.Fled)) {
                        $.Append($.Function(Assisting.KillNear))
                    }
                    App.Next()
                })
            )
        } else {
            Assisting.Data.NPC.Loc = null
        }
        $.Next()
    }
    //搜索NPC
    Assisting.GoKill = () => {
        if (Assisting.Data.NPC.Times > 3) {
            Note("找不到")
            Assisting.CheckYou()
            return
        }
        App.Core.HelpFind.HelpFind(Assisting.Data.NPC.Name)
        let zone = Assisting.Data.NPC.First ? Cities[Assisting.Data.NPC.Zone].Path1 : Cities[Assisting.Data.NPC.Zone].Path;
        Assisting.Data.NPC.First = false
        let wanted = $.NewWanted(Assisting.Data.NPC.Name, zone).
            WithChecker(Checker).WithOrdered(true).WithID(Assisting.Data.NPC.ID)
        App.Send("yun recover;yun regenerate")
        $.RaiseStage("prepare")
        $.PushCommands(
            $.Prepare(),
            $.To(Cities[Assisting.Data.NPC.Zone].Loc),
            $.Function(() => {
                if (Assisting.Data.NPC.Loc) {
                    App.Zone.SearchRooms(Assisting.Data.NPC.Loc, wanted)
                } else {
                    App.Zone.Search(wanted)
                }
            }),
            $.Function(Assisting.KillLoc),
            $.Function(() => {
                Assisting.Data.NPC.Times++
                Note("第" + Assisting.Data.NPC.Times + "次搜索完毕")
                Assisting.Ready()
            }),

        )
        $.Next()
    }
    //重连
    Assisting.Connect = () => {
        $.PushCommands(
            $.Function(App.Core.Emergency.CheckDeath),
            $.Function(Assisting.KillLoc)
        )
        $.Next()
    }
    let matcherFaint = /^(.+)脚下一个不稳，跌在地上一动也不动了。$/
    let matcherFlee2 = /^你连连进击，眼看便要得手，接连数招，让(.+)已是避/
    let matcherFlee3 = /^在你一阵狂攻之下，(.+)只有招架之功，哪里还有/
    let matcherFlee = /^(.+)(摇摇欲坠|身负重伤|狂叫一声|晃了两下|再退一步|已是避|深吸一口气，神色略微好了)(.*)/
    let matcherHelper = /^看起来(.+)想杀死你！$/
    //战斗计划
    let PlanCombat = new App.Plan(
        App.Positions["Combat"],
        (task) => {
            task.AddTrigger(matcherFaint, (tri, result) => {
                if (Assisting.Data.NPC && Assisting.Data.NPC.Name == result[1]) {
                    Assisting.Data.NPC.Died = true
                    Assisting.OnNpcFaint()
                    App.Send("halt")
                }
                return true
            })

            task.AddTrigger(matcherFlee, (tri, result) => {
                if (Assisting.Data.NPC && Assisting.Data.NPC.Name == result[1]) {
                    Assisting.Data.NPC.Flee()
                    Note("NPC跑了。")
                }
                return true
            })
            task.AddTrigger(matcherFlee2, (tri, result) => {
                if (Assisting.Data.NPC && Assisting.Data.NPC.Name == result[1]) {
                    Assisting.Data.NPC.Flee()
                    Note("NPC跑了。")
                }
                return true
            })
            task.AddTrigger(matcherFlee3, (tri, result) => {
                if (Assisting.Data.NPC && Assisting.Data.NPC.Name == result[1]) {
                    Assisting.Data.NPC.Flee()
                    Note("NPC跑了。")
                }
                return true
            })
            task.AddTrigger(matcherHelper, function (tri, result) {
                if (Assisting.Data.NPC) {
                    if (result[1] == Assisting.Data.NPC.Name) {
                        Assisting.Data.NPC.NotKilled = false
                    } else {
                        return
                    }
                    return true
                }
            }).WithName("helper")
        },
        (result) => {
            if (result.Name == "helper") {
                App.Reconnect(0, Assisting.Connect)
            }
        })
    //问小二信息
    Assisting.AskInfo = function () {
        $.PushCommands(
            $.Prepare("common"),
            $.Function(Assisting.GoAskInfo),
        )
        App.Next()
    }
    let reCity = /^.*说道：.*(好像听人说过是在|他不是在|据说是躲到|好像去了|已经躲到|好像是去了|但是也有人说他在|有人说在|不过听人说在|听说是在|不过听说他好像在|现在应该是去了)(.*)/
    //前往小二处问信息
    Assisting.GoAskInfo = function () {
        if (Assisting.Data.NPC.Info.length) {
            let infoid = Assisting.Data.NPC.Info.shift()
            let info = App.Zone.Info[infoid]
            if (info) {
                $.PushCommands(
                    $.To(info.Loc),
                    $.Nobusy(),
                    $.Ask(info.NPC, Assisting.Data.NPC.Name, 1),
                    $.Function(() => {
                        if (App.Data.Ask.Answers.length) {
                            let result = App.Data.Ask.Answers[0].Line.match(reCity)
                            if (result) {
                                let city = result[2].slice(0, 2)
                                if (city == "很远") {
                                    Assisting.Far()
                                    return
                                }
                                Assisting.Data.NPC.SetZone(city)
                                Assisting.Data.Fled = false
                                Assisting.Ready()
                                return
                            }
                        }
                        Assisting.AskInfo()
                    })
                )
                App.Next()
                return
            }
            Assisting.AskInfo()
        }
        Note("没人知道")
        Assisting.CheckYou()
    }
    //线报
    App.BindEvent("core.helpfind.onfound", (event) => {
        let name = event.Data.Name
        let id = event.Data.ID
        let loc = event.Data.Loc
        if (Assisting.Data.NPC && Assisting.Data.NPC.Name == name) {
            let city = ""
            for (var key in Cities) {
                if (incity(loc, key, Cities)) {
                    city = key;
                    break
                }
            }
            if (city == "") {
                return
            }
            if (!Assisting.Data.NPC.ID && id) {
                Assisting.Data.NPC.ID = id.toLowerCase()
            }
            if (!Assisting.Data.NPC.Loc && !Assisting.Data.NPC.Died) {
                Note("接到线报:" + name + "|" + id + "|" + loc)
                Assisting.Data.helpded++
                Assisting.Data.NPC.Loc = loc
                Assisting.Data.NPC.SetZone(city)
            }
            if (App.Zone.Wanted && App.Zone.Wanted.Target == name) {
                App.Zone.Wanted.Loc = loc
            }
            Assisting.Data.NPC.Farlist = null
        }
    })
    //定义任务
    let Quest = App.Quests.NewQuest("assisting")
    Quest.Name = "师门任务(协助)"
    Quest.Desc = ""
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Group = "mq"
    Quest.Start = function (data) {
        if (!App.Params.MasterID) {
            PrintSystem("掌门ID " + App.Params.MasterID + " 无效")
            return
        }
        if (!App.Params.LocMaster) {
            PrintSystem("掌门位置 " + App.Params.LocMaster + " 无效")
            return
        }
        data = data.trim()
        if (!data) {
            PrintSystem(`被协助人${data}无效`)
            return
        }
        Assisting.Data.Assist = data
        Assisting.Data.NPC = null
        Assisting.Prepare()
    }
    App.BindEvent("core.queststart", (e) => {
        Assisting.Data.kills = 0
        Assisting.Data.helpded = 0
        Assisting.Data.start = null
        Assisting.Data.current = null
        Assisting.Data.eff = 0
    })
    App.Quests.Register(Quest)
})