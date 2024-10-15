var $ = App.Userspace

$.Module = function (fn) { return fn(App) }

$.Random = App.Random

$.LoadLines = App.LoadLines

$.LoadLinesText = App.LoadLinesText

$.Function = App.Commands.NewFunctionCommand.bind(App.Commands)

$.Do = App.Commands.NewDoCommand.bind(App.Commands)

$.Wait = App.Commands.NewWaitCommand.bind(App.Commands)

$.Plan = App.Commands.NewPlanCommand.bind(App.Commands)

$.Sync = App.NewSyncCommand

$.Nobusy = App.NewNobusyCommand

$.Push = App.Commands.Push.bind(App.Commands)

$.PushCommands = App.Commands.PushCommands.bind(App.Commands)

$.Next = App.Next

$.Fail = App.Fail

$.Pop = App.Pop

$.Prepare = App.NewPrepareCommand

$.Ask = App.NewAskCommand

$.To = App.Move.NewToCommand

$.Rooms = App.Move.NewRoomsCommand

$.Buy = App.Goods.NewBuyCommand

$.CountAttack = App.NewCounterAttackCommand

$.Kill = App.NewKillCommand

$.Append = App.Append

$.Insert = App.Insert

$.PrepareMoney=App.NewPrepareMoneyCommand

$.Now = function () { return (new Date()).getTime() }
