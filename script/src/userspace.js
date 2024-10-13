var $ = App.Userspace

$.module = function (fn) { return fn(App) }

$.random = App.random

$.function = App.Commnds.NewFunctionCommand

$.do = App.Commnds.NewDoCommand

$.wait = App.Commnds.NewWaitCommand

$.sync = App.NewSyncCommand

$.nobusy = App.NewNobusyCommand

$.push = App.Commands.Push

$.pushCommands = App.Commands.PushCommands

$.next = App.Next

$.pop = App.Pop

