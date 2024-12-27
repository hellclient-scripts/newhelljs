$.Module(function (App) {

    let TJZ = {}
    TJZ.Finished = false
    // let roomlist = [
    //     ["乾", "否", "涿", "履", "无妄", "逅", "讼", "同人",],
    //     ["炔", "萃", "咸", "兑", "随", "大过", "困", "革",],
    //     ["大有", "晋", "旅", "暌", "噬嗑", "鼎", "未济", "离",],
    //     ["大壮", "豫", "小过", "归妹", "震", "恒", "解", "丰",],
    //     ["小畜", "观", "渐", "中孚", "益", "巽", "涣", "家人",],
    //     ["需", "比", "謇", "节", "屯", "井", "坎", "既济",],
    //     ["大畜", "剥", "艮", "损", "颐", "盅", "蒙", "喷",],
    //     ["泰", "坤", "谦", "临", "复", "升", "师", "明夷",],
    // ]
    let roomlist = [
        ["乾：元，亨，利，贞。", "否：否之匪人，不利君子贞，大往小来。", "□：亨，小利贞。", "履：履虎尾，不□①人，亨。", "无妄：元，亨，利，贞。 其匪正有眚，不利有攸往。", "□①：女壮，勿用取女。", "讼：有孚，窒。 惕中吉。 终凶。 利见大人，不利涉大川。", "同人：同人于野，亨。 利涉大川，利君子贞。",],
        ["□①：扬于王庭，孚号，有厉，告自邑，不利即戎，利有攸往。", "萃：亨。 王假有庙，利见大人，亨，利贞。 用大牲吉，利有攸往。", "咸：亨，利贞，取女吉。", "兑：亨，利贞。", "随：元亨利贞，无咎。", "大过：栋桡，利有攸往，亨。", "困：亨，贞，大人吉，无咎，有言不信。", "革：己日乃孚，元亨利贞，悔亡。",],
        ["大有：元亨。", "晋：康侯用锡马蕃庶，昼日三接。", "旅：小亨，旅贞吉。", "睽：小事吉。", "噬嗑：亨。 利用狱。", "鼎：元吉，亨。", "未济：亨，小狐汔济，濡其尾，无攸利。", "离：利贞，亨。 畜牝牛，吉。",],
        ["大壮：利贞。", "豫：利建侯行师。", "小过：亨，利贞，可小事，不可大事。飞鸟遗之音，不宜上宜下，大", "归妹：征凶，无攸利。", "震：亨。 震来□①□①，笑言哑哑。 震惊百里，不丧匕鬯。", "恒：亨，无咎，利贞，利有攸往。", "解：利西南，无所往，其来复吉。 有攸往，夙吉。", "丰：亨，王假之，勿忧，宜日中。",],
        ["小畜：亨。 密云不雨，自我西郊。", "观：盥而不荐，有孚□若。", "渐：女归吉，利贞。", "中孚：豚鱼吉，利涉大川，利贞。", "益：利有攸往，利涉大川。", "巽：小亨，利攸往，利见大人。", "涣：亨。 王假有庙，利涉大川，利贞。", "家人：利女贞。",],
        ["需：有孚，光亨，贞吉。 利涉大川。", "比：吉。 原筮元永贞，无咎。 不宁方来，后夫凶。", "蹇：利西南，不利东北；利见大人，贞吉。", "节：亨。 苦节不可贞。", "屯：元，亨，利，贞，勿用，有攸往，利建侯。", "井：改邑不改井，无丧无得，往来井井。汔至，亦未□①井，羸其瓶，", "坎：习坎，有孚，维心亨，行有尚。", "既济：亨，小利贞，初吉终乱。",],
        ["大畜：利贞，不家食吉，利涉大川。", "剥：不利有攸往。", "艮：艮其背，不获其身，行其庭，不见其人，无咎。", "损：有孚，元吉，无咎，可贞，利有攸往？  曷之用，二簋可用享。", "颐：贞吉。 观颐，自求口实。", "蛊：元亨，利涉大川。 先甲三日，后甲三日。", "蒙：亨。 匪我求童蒙，童蒙求我。 初噬告，再三渎，渎则不告。利", "贲：亨。 小利有所往。",],
        ["泰：小往大来，吉亨。", "坤：元，亨，利牝马之贞。 君子有攸往，先迷后得主，利西南得朋，", "谦：亨，君子有终。", "临：元，亨，利，贞。 至于八月有凶。", "复：亨。 出入无疾，朋来无咎。 反复其道，七日来复，利有攸往。", "升：元亨，用见大人，勿恤，南征吉。", "师：贞，丈人，吉无咎。", "明夷：利艰贞。",],
    ]
    TJZ.Rooms = {}
    roomlist.forEach((row, y) => {
        row.forEach((name, x) => {
            TJZ.Rooms[name.trim().slice(0, 10)] = { x: x, y: y }
        })
    })
    let blocks = {}
    //2*2的区块
    class Block {
        constructor(lc, left, rc, right) {
            this.Left = left
            this.LeftCommand = lc
            this.Right = right
            this.RightComand = rc
        }
        Next = ""
        LeftCommand = ""
        Prev = ""
        RightComand = ""
    }
    //2*2的区块，首尾相连的遍历关系
    blocks["1-0"] = new Block("w", "0-0", "e", "2-0")
    blocks["0-0"] = new Block("s", "0-1", "e", "1-0")
    blocks["0-1"] = new Block("e", "1-1", "n", "0-0")
    blocks["1-1"] = new Block("s", "1-2", "w", "0-1")
    blocks["1-2"] = new Block("w", "0-2", "n", "1-1")
    blocks["0-2"] = new Block("s", "0-3", "e", "1-2")
    blocks["0-3"] = new Block("e", "1-3", "n", "0-2")
    blocks["1-3"] = new Block("e", "2-3", "w", "0-3")
    blocks["2-3"] = new Block("e", "3-3", "w", "1-3")
    blocks["3-3"] = new Block("n", "3-2", "w", "2-3")
    blocks["3-2"] = new Block("w", "2-2", "s", "3-3")
    blocks["2-2"] = new Block("n", "2-1", "e", "3-2")
    blocks["2-1"] = new Block("e", "3-1", "s", "2-2")
    blocks["3-1"] = new Block("n", "3-0", "w", "2-1")
    blocks["3-0"] = new Block("w", "2-0", "s", "3-1")
    blocks["2-0"] = new Block("w", "1-0", "e", "3-0")
    let direct = { n: 0, e: 2, s: 4, w: 6 }
    let pos = { 0: 7, 1: 1, 2: 3, 3: 5 }
    let toDirect = (direct) => {
        if (direct > 7) { direct = direct - 8 } else if (direct < 0) { direct = direct + 8 }
        switch (direct) {
            case 0:
                return "n";
            case 2:
                return "e";
            case 4:
                return "s";
            case 6:
                return "w";
        }
    }
    //当前位置对准0位时的相对北方
    let rNorth
    //当前位置对准0位时的相对西方
    let rWest
    //当前位置对准0位时的相对东方
    let rEast
    //当前位置对准0位时的相对南方
    let rSouth
    let next
    let prev
    let loadcurrent = (rev) => {
        //正常next是left,prev是right
        next = TJZ.Left == rev ? blocks[TJZ.CurrentBlock].RightComand : blocks[TJZ.CurrentBlock].LeftCommand
        prev = TJZ.Left == rev ? blocks[TJZ.CurrentBlock].LeftCommand : blocks[TJZ.CurrentBlock].RightComand

        rNorth = pos[TJZ.CurrentPosition] + 1
        if (rNorth > 7) {
            rNorth = rNorth - 8
        }
        rWest = pos[TJZ.CurrentPosition] - 1
        if (rWest < 0) {
            rWest = rWest + 8
        }
        rEast = pos[TJZ.CurrentPosition] + 3
        if (rEast > 7) {
            rEast = rEast - 8
        }
        rSouth = pos[TJZ.CurrentPosition] - 3
        if (rSouth < 0) {
            rSouth = rSouth + 8
        }

    }
    //后退，经过一半的格子
    let Step = (rev) => {
        loadcurrent(rev)
        switch (direct[prev]) {
            case rNorth:
                switch (direct[next]) {
                    case rEast:
                        TJZ.PushPath(toDirect(rSouth), toDirect(rEast), toDirect(rEast))
                        TJZ.CurrentPosition -= 1
                        break
                    case rSouth:
                        TJZ.PushPath(toDirect(rSouth), toDirect(rSouth))
                        TJZ.CurrentPosition += 0
                        break
                    case rWest:
                        TJZ.PushPath(toDirect(rWest))
                        TJZ.CurrentPosition += 1
                        break
                }
                break
            case rWest:
                switch (direct[next]) {
                    case rSouth:
                        TJZ.PushPath(toDirect(rEast), toDirect(rSouth), toDirect(rSouth))
                        TJZ.CurrentPosition += 1
                        break
                    case rEast:
                        TJZ.PushPath(toDirect(rEast), toDirect(rEast))
                        TJZ.CurrentPosition += 0
                        break
                    case rNorth:
                        TJZ.PushPath(toDirect(rNorth))
                        TJZ.CurrentPosition -= 1
                        break

                }
                break
            default:
                PrintSystem("计算错误")
                return false
        }
        if (TJZ.CurrentPosition < 0) { TJZ.CurrentPosition += 4 } else if (TJZ.CurrentPosition > 3) { TJZ.CurrentPosition -= 4 }
        TJZ.CurrentBlock = TJZ.Left == rev ? blocks[TJZ.CurrentBlock].Right : blocks[TJZ.CurrentBlock].Left
        return true
    }
    let Back = () => {
        return Step(true)
    }
    //返回，经过另一半格子
    let Forward = () => {
        return Step(false)
    }
    //掉头
    let Turn = () => {
        loadcurrent(false)
        switch (direct[next]) {
            case rNorth:
                TJZ.PushPath(toDirect(rSouth), toDirect(rEast), toDirect(rNorth), toDirect(rNorth))
                TJZ.CurrentPosition += 2
                break
            case rWest:
                TJZ.PushPath(toDirect(rEast), toDirect(rSouth), toDirect(rWest), toDirect(rWest))
                TJZ.CurrentPosition += 2
                break
        }
        if (TJZ.CurrentPosition < 0) { TJZ.CurrentPosition += 4 } else if (TJZ.CurrentPosition > 3) { TJZ.CurrentPosition -= 4 }
        TJZ.CurrentBlock = TJZ.Left ? blocks[TJZ.CurrentBlock].Left : blocks[TJZ.CurrentBlock].Right
    }
    let First = () => {

        if (TJZ.CurrentBlock != TJZ.FinishBlock) {
            if (blocks[TJZ.CurrentBlock].Right == TJZ.FinishBlock) {
                TJZ.Left = false
            }
            loadcurrent(true)
            switch (direct[next]) {
                case rEast:
                    if (direct[prev] == rNorth) {
                        TJZ.PushPath(toDirect(rSouth), toDirect(rEast), toDirect(rEast))
                        TJZ.BackCommand = [toDirect(rNorth)]
                        TJZ.BackPosition = TJZ.CurrentPosition + 2
                        TJZ.CurrentPosition += 3
                    } else {
                        TJZ.PushPath(toDirect(rEast), toDirect(rEast))
                        TJZ.BackCommand = [toDirect(rWest), prev]
                        if (direct[prev] == rWest) {
                            TJZ.BackPosition = TJZ.CurrentPosition + 2
                        } else {
                            TJZ.BackPosition = TJZ.CurrentPosition + 0
                        }
                        TJZ.CurrentPosition += 0
                    }
                    break
                case rSouth:
                    if (direct[prev] == rWest) {
                        TJZ.PushPath(toDirect(rEast), toDirect(rSouth), toDirect(rSouth))
                        TJZ.BackCommand = [toDirect(rWest)]
                        TJZ.BackPosition = TJZ.CurrentPosition + 2
                        TJZ.CurrentPosition += 1
                    } else {
                        TJZ.PushPath(toDirect(rSouth), toDirect(rSouth))
                        TJZ.BackCommand = [toDirect(rNorth), prev]
                        if (direct[prev] == rNorth) {
                            TJZ.BackPosition = TJZ.CurrentPosition + 2
                        } else {
                            TJZ.BackPosition = TJZ.CurrentPosition + 0
                        }
                        TJZ.CurrentPosition += 0
                    }
                    break
                case rWest:
                    TJZ.PushPath(toDirect(rWest))
                    TJZ.BackCommand = [toDirect(rSouth), toDirect(rEast), prev]
                    if (direct[prev] == rNorth) {
                        TJZ.BackPosition = TJZ.CurrentPosition + 2
                    } else {
                        TJZ.BackPosition = TJZ.CurrentPosition + 0
                    }
                    TJZ.CurrentPosition += 1
                    break
                case rNorth:
                    TJZ.PushPath(toDirect(rNorth))
                    TJZ.BackCommand = [toDirect(rSouth), toDirect(rEast), prev]
                    if (direct[prev] == rNorth) {
                        TJZ.BackPosition = TJZ.CurrentPosition + 3
                    } else {
                        TJZ.BackPosition = TJZ.CurrentPosition + 1
                    }
                    TJZ.CurrentPosition += 3
                    break
            }
        } else {
            loadcurrent(false)
            let diff = TJZ.FinishPosition - TJZ.CurrentPosition
            if (diff < 0) { diff = diff + 4 }
            switch (diff) {
                case 1:
                    if (direct[prev] == rNorth) {
                        TJZ.Left = false
                    }
                    break
                case 3:
                    if (direct[prev] == rWest) {
                        TJZ.Left = false
                    }
                    break
            }
            loadcurrent(true)
            switch (direct[next]) {
                case rNorth:
                    TJZ.PushPath(toDirect(rNorth))
                    TJZ.CurrentPosition += 3
                    TJZ.BackCommand = [toDirect(rSouth), toDirect(rWest)]
                    break
                case rEast:
                    if (diff == 1) {
                        TJZ.PushPath(toDirect(rSouth), toDirect(rEast), toDirect(rEast))
                        TJZ.BackCommand = []
                        TJZ.CurrentPosition += 3
                    } else {
                        TJZ.PushPath(toDirect(rEast), toDirect(rEast))
                        TJZ.BackCommand = [toDirect(rWest)]
                        TJZ.CurrentPosition += 0
                    }
                    break
                case rSouth:
                    if (diff == 1) {
                        TJZ.PushPath(toDirect(rSouth), toDirect(rSouth))
                        TJZ.BackCommand = [toDirect(rNorth)]
                        TJZ.CurrentPosition += 0
                    } else {
                        TJZ.PushPath(toDirect(rEast), toDirect(rSouth), toDirect(rSouth))
                        TJZ.BackCommand = []
                        TJZ.CurrentPosition += 1
                    }
                    break
                case rWest:
                    TJZ.PushPath(toDirect(rWest))
                    TJZ.BackCommand = [toDirect(rEast), toDirect(rNorth)]
                    TJZ.CurrentPosition += 1
                    break
            }
        }
        if (TJZ.CurrentPosition < 0) { TJZ.CurrentPosition += 4 } else if (TJZ.CurrentPosition > 3) { TJZ.CurrentPosition -= 4 }
        TJZ.CurrentBlock = TJZ.Left ? blocks[TJZ.CurrentBlock].Right : blocks[TJZ.CurrentBlock].Left
    }
    let BackFirst = () => {
        TJZ.PushPath(...TJZ.BackCommand)
        TJZ.CurrentPosition = TJZ.BackPosition
        if (TJZ.CurrentPosition < 0) { TJZ.CurrentPosition += 4 } else if (TJZ.CurrentPosition > 3) { TJZ.CurrentPosition -= 4 }
        TJZ.CurrentBlock = TJZ.Left ? blocks[TJZ.CurrentBlock].Left : blocks[TJZ.CurrentBlock].Right
    }
    //前进，涂满4*4格子
    let Walk = () => {
        loadcurrent(false)
        switch (direct[next]) {
            case rNorth:
                TJZ.PushPath(toDirect(rSouth), toDirect(rEast), toDirect(rNorth), toDirect(rNorth))
                TJZ.CurrentPosition += 2
                break
            case rWest:
                TJZ.PushPath(toDirect(rEast), toDirect(rSouth), toDirect(rWest), toDirect(rWest))
                TJZ.CurrentPosition += 2
                break
            case rEast:
                TJZ.PushPath(toDirect(rSouth), toDirect(rEast), toDirect(rNorth), toDirect(rEast))
                TJZ.CurrentPosition += 0
                break
            case rSouth:
                TJZ.PushPath(toDirect(rEast), toDirect(rSouth), toDirect(rWest), toDirect(rSouth))
                TJZ.CurrentPosition += 0
                break
        }
        if (TJZ.CurrentPosition < 0) { TJZ.CurrentPosition += 4 } else if (TJZ.CurrentPosition > 3) { TJZ.CurrentPosition -= 4 }
        TJZ.CurrentBlock = TJZ.Left ? blocks[TJZ.CurrentBlock].Left : blocks[TJZ.CurrentBlock].Right
    }
    //结束
    let Finish = () => {
        let diff = TJZ.FinishPosition - TJZ.CurrentPosition
        if (diff < 0) { diff = diff + 4 }
        loadcurrent(false)
        switch (diff) {
            case 1:
                TJZ.PushPath(toDirect(rSouth), toDirect(rEast), toDirect(rNorth))
                break
            case 3:
                TJZ.PushPath(toDirect(rEast), toDirect(rSouth), toDirect(rWest))
                break
        }
        return
    }
    //路径
    TJZ.Path = []
    TJZ.PushPath = (...path) => {
        TJZ.Path.push(...path)
    }
    //当前坐标
    TJZ.CurrentBlock = ""
    //当前位置
    TJZ.CurrentPosition = 0//0 左上 1 右上 2 右下 3左下
    //最终坐标
    TJZ.FinishBlock = ""
    //最终位置
    TJZ.FinishPosition = 0
    //向左前行
    TJZ.Left = true
    TJZ.BackCommand = []
    TJZ.BackPosition = 0
    //坐标转位置
    let toPosition = (x, y) => {
        switch ((x % 2) + ((y) % 2) * 2) {
            case 0:
                return 0;
            case 1:
                return 1;
            case 2:
                return 3;
            case 3:
                return 2;
        }

    }
    TJZ.WalkAll = (x1, y1, x2, y2, left) => {
        TJZ.Left = left != false
        TJZ.Path = []
        if (((x1 + y1 + x2 + y2) % 2) == 0) {
            return TJZ.Path
        }
        let blockStart = Math.floor(x1 / 2) + "-" + Math.floor(y1 / 2)
        TJZ.FinishBlock = Math.floor(x2 / 2) + "-" + Math.floor(y2 / 2)
        TJZ.CurrentBlock = blockStart
        TJZ.CurrentPosition = toPosition(x1, y1)
        TJZ.FinishPosition = toPosition(x2, y2)
        TJZ.BackCommand = []
        TJZ.BackPosition = 0
        First()
        while (blocks[TJZ.CurrentBlock][TJZ.Left ? "Right" : "Left"] != TJZ.FinishBlock) {
            if (!Back()) {
                return []
            }
        } 
        Turn()
        while (TJZ.CurrentBlock != blockStart) {
            if (!Forward()) {
                return [];
            }
        } 
        BackFirst()
        if (blockStart != TJZ.FinishBlock) {
            while (TJZ.CurrentBlock != TJZ.FinishBlock) {
                Walk()
            }
            if (blockStart != TJZ.FinishBlock) {
                Finish()
            }
        }
        return TJZ.Path
    }
    let matcherLook = /(\S{1,4}：.*)$/
    TJZ.Current = null
    let PlanLook = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.AddTrigger(matcherLook, (tri, result) => {
                if (task.Data == null) {
                    task.Data = result[1].trim().slice(0, 10)
                }
                return true
            })
            App.Send("l shibei")
            App.Sync()
        }, (result) => {
            TJZ.Current = TJZ.Rooms[result.Task.Data]
            if (TJZ.Current == null) {
                Note("定位失败")
                return
            }
            App.Next()
        }
    )
    TJZ.GetPath = (x1, y1, x2, y2) => {
        let path = TJZ.WalkAll(x1, y1, x2, y2, true)
        if (path.length != 63) {
            //左右反转
            path = TJZ.WalkAll(x1, y1, x2, y2, false)
        }
        if (path.length != 63) {
            PrintSystem(`计算错误,长度${path.length}不符合(${x1},${y1},${x2},${y2})`)
            App.Fail()
            return
        }
        let result = []
        let cx = x1
        let cy = y1
        path.forEach(cmd => {
            switch (cmd) {
                case "n":
                    cy = cy - 1
                    break
                case "e":
                    cx = cx + 1
                    break
                case "s":
                    cy = cy + 1
                    break
                case "w":
                    cx = cx - 1
                    break
            }
            result.push(App.Map.NewStep(cmd, `tjz_${cx}_${cy}`))
        })
        return result
    }
    TJZ.FindTarget = () => {
        let odd = (TJZ.Current.x + TJZ.Current.y) % 2
        let target
        if (TJZ.Target != null) {
            if ((TJZ.Target.x + TJZ.Target.y + TJZ.Current.x + TJZ.Current.y) % 2 == 1) {
                Note("前往晕点")
                target = TJZ.Target
            } else {
                Note("晕点无法到达")
            }
        }
        if (target == null) {
            if (odd) {
                target = { x: 0, y: 0 }
            } else {
                target = { x: 0, y: 1 }
            }
        }
        let path = TJZ.GetPath(TJZ.Current.x, TJZ.Current.y, target.x, target.y)
        if (path.length != 63) {
            App.Fail()
            return
        }
        $.PushCommands(
            $.Path(path, App.Map.Movement.SingleStep)
        )
        $.Next()
    }
    TJZ.CheckRoom = () => {
        $.PushCommands(
            $.Plan(PlanLook),
            $.Function(TJZ.FindTarget),
        )
        $.Next()
    }
    TJZ.Start = () => {
        TJZ.FaintMode = 0
        PlanQuest.Execute()
        TJZ.Current = null
        TJZ.Target = null
        TJZ.Enter()
    }
    TJZ.Entered = () => {
        if (App.Map.Room.Name != "石阵") {
            Note("入阵失败")
            App.Fail()
            return
        }
        TJZ.CheckRoom()
    }
    TJZ.Enter = () => {
        if (!TJZ.Finished) {
            $.PushCommands(
                $.Prepare(),
                $.To("2789"),
                $.Function(TJZ.Entered),
            )
        }
        $.Next()
    }
    TJZ.FaintMode = 0
    TJZ.Target = null
    let PlanQuest = new App.Plan(
        App.Positions["Quest"],
        (task) => {
            task.AddTrigger("你脚下一虚，不由自主的向下飞坠......你的意识渐渐模糊起来......", () => {
                TJZ.FaintMode = 1
                Note("晕点")
                return true
            })
            task.AddTrigger("四周景物突然变得模糊起来，你觉得头脑一阵晕眩......", () => {
                TJZ.Finished = true
                Note("成功过阵")
                return true
            })
            task.AddCatcher("core.faint", (catcher, event) => {
                switch (TJZ.FaintMode) {
                    case 1:
                        let data = (App.Map.Room.ID.split("_"))
                        if (data[0] == "tjz") {
                            TJZ.Target = { x: data[1] - 0, y: data[2] - 0 }
                            Note(`找到晕点${TJZ.Target.x}-${TJZ.Target.y}`)
                        }
                        event.Context.Set("callback", TJZ.AfterFaint)
                        break
                }
                TJZ.FaintMode = 0
                App.Map.Room.ID = ""
                return true
            })
            Note("进入破阵状态")
        }, (result) => {
            Note("离开破阵状态")
        })
    TJZ.AfterFaint = () => {
        App.Map.DiscardMove()
        PlanQuest.Execute()
        $.PushCommands(
            $.Do("l"),
            $.Sync(),
            $.Function(TJZ.Enter)
        )
        $.Next()
    }

    let Quest = App.Quests.NewQuest("tjz")
    Quest.GetReady = function (q, data) {
        if (!TJZ.Finished) {
            return () => { Quest.Start(data) }
        }
        return null
    }

    Quest.Name = "过天机阵，加智力"
    Quest.Desc = "过天机阵，加智力"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Start = function (data) {
        TJZ.Start()
    }
    App.Quests.Register(Quest)
    App.Quests.TJZ = TJZ
})
