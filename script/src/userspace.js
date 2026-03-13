//方便使用的全局API

//全局命名为$
var $ = App.Userspace

// 快速注册模块
$.Module = function (fn) { return fn(App) }

// Random函数,根据参数支持 数字/数组/对象的随机
$.Random = App.Random

// 加载文本文件,并按行分割,去除空行和//开头的注释
$.LoadLines = App.LoadLines

// 加载文本变量,并按行分割,去除空行和//开头的注释
$.LoadLinesText = App.LoadLinesText

// 触发场景指令,对应位置可以输出在command变量的对应设置
$.RaiseStage = App.Core.Stage.Raise


//当前时间戳
$.Now = function () { return (new Date()).getTime() }

// 创建新战斗,参数为战斗任务,返回一个战斗设置对象,可以进行细节设置
$.NewCombat = App.NewCombat

// 创建新的遍历目标,第一个参数是npc id,第二个参数是区域
$.NewWanted = App.NewWanted

// 创建新的遍历目标,第一个参数是npc id,无视大小写,第二个参数是区域
$.NewIDLowerWanted = App.NewIDLowerWanted



//指令(Command)相关


// 推一个新的指令队列
$.Push = App.Commands.Push.bind(App.Commands)

// 把给定的指令数组作为新的指令队列推入
$.PushCommands = App.Commands.PushCommands.bind(App.Commands)

// 触发下一个指令的Next函数,流程核心
$.Next = App.Next

//当前队列失败
$.Fail = App.Fail

//当前队列弹出
$.Pop = App.Pop

//向当前队列最后插入若干指令,
$.Append = App.Append

//向当前队列最前插入若干指令,
$.Insert = App.Insert

//插入函数指令,参数为 指令名和指令参数,不常用
$.NewCommand = App.Commands.NewCommand

//插入函数指令,参数为函数,需要在函数的合适位置加入$.Next()
$.Function = App.Commands.NewFunctionCommand.bind(App.Commands)

//插入发送指令,参数为带发送的字符串
$.Do = App.Commands.NewDoCommand.bind(App.Commands)

// 等待指令,参数为需要等待的毫秒数
$.Wait = App.Commands.NewWaitCommand.bind(App.Commands)

// 计划指令,在该位置执行计划
$.Plan = App.Commands.NewPlanCommand.bind(App.Commands)

//同步指定,发送等同指令并等待服务器返回相应,一般与$,Do一起使用
$.Sync = App.NewSyncCommand

//等待不忙指令,会等待角色不忙
$.Nobusy = App.NewNobusyCommand

//等待不盲指令,确定角色没有被致盲
$.Noblind = App.NewNoblindCommand

//准备指令,有两个参数,第一个是准备的key,默认为common,第二个是准备的上下文,可以在某些时候变更准备的条件
$.Prepare = App.NewPrepareCommand

// ask指令,第一个参数是npcid,第二个参数是ask的内容
$.Ask = App.NewAskCommand

// 按路径一动指令,第一个参数是 字符串或者step的列表,依次移动,剩下的是路线初始化器
$.Path = App.Move.NewPathCommand

// 移动指令,第一个参数是目标列表,剩下的是路线初始化器
$.To = App.Move.NewToCommand

// 指定房间移动指令,第一个参数是需要去的所有房间,剩下的是路线初始化器
$.Rooms = App.Move.NewRoomsCommand

// 按顺序房间移动指令.第一个房间是带数序的房间数组,如果有房间无法进入会跳到能移动的房间为止,剩下的是路线初始化器
$.Ordered = App.Move.NewOrderedCommand

// 购买道具指令,参数为道具的key
$.Buy = App.Goods.NewBuyCommand

// 战斗指令,反杀,第一个参数为npc id,第二个是$.NewCombat创建的战斗设置
$.CounterAttack = App.NewCounterAttackCommand

// 战斗指令,叫杀,第一个参数为npc id,第二个是$.NewCombat创建的战斗设置
$.Kill = App.NewKillCommand

// 战斗后战斗调整指令
$.Rest = App.Core.Heal.NewRestCommand

// 现金准备指令,参数为具体需要的gold数值
$.PrepareMoney = App.NewPrepareMoneyCommand

//获取Marker位置
$.RID=App.Mapper.LoadMarker