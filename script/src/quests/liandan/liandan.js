$.module(function (App) {
    App.Quest.Liandan = {}
    App.Quest.Liandan.Data = {}
    let locations=["1397","1398","1399","1400","1401"]

    let PlanLiandan=new App.Plan(App.Commands.PositionCommand,
        function(task){
            task.AddTrigger("你找了半天，终于发现其中一株草苗与其它的草略有不同，小心翼翼地将").WithName("got")
            task.AddTrigger("东西到手，快去交了吧。").WithName("got")
            task.AddTrigger("别在这浪费时间了，快走吧。").WithName("got")
            task.AddTrigger("一番摸索后，草丛中似乎没有你要找的东西，你失望的叹了口气。",function(){
                App.Send("cai yao")
                return true
            })
            task.AddTimer(2000,function(){
                App.Send("cai yao")
                return true
            })
            App.Send("cai yao")
        },
        function(result){
            if (result.Name=="got"){
                App.Quest.Liandan.Jiao()
                return
            }
        },
    )
    App.Quest.Liandan.GoAsk=function(){
        App.Commands.PushCommands(
            App.NewPrepareCommand(""),
            App.Move.NewToCommand("1388"),
            App.NewAskCommand("yao chun","炼丹"),
            App.Move.NewToCommand("1387"),
            App.NewAskCommand("xiao tong","药材"),
            App.NewSyncCommand(),
            App.Move.NewToCommand(App.Random(locations)),
            App.Commands.NewPlanCommand(PlanLiandan),
        )
        App.Next()
    }
    App.Quest.Liandan.Jiao=function(){
        App.Commands.PushCommands(
            App.Move.NewToCommand("1387"),
            App.Commands.NewDoCommand("give cao yao to xiao tong"),
            App.Move.NewToCommand("1389"),
            App.Commands.NewDoCommand("liandan"),
            App.NewNobusyCommand(),
            App.Commands.NewWaitCommand(2000),
            App.Move.NewToCommand("1388"),
            App.NewAskCommand("yao chun","炼丹"),
        )
        App.Next()
    }
    App.Quest.Liandan.Ready=function(){
        if (App.Quests.Stopped){
            App.Next()
            return
        }
        App.Quest.Liandan.GoAsk()
    }

    let Quest = App.Quests.NewQuest("liandan")
    Quest.Name = "炼丹"
    Quest.Desc = "北京姚春炼丹"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Start = function (data) {
        App.Quest.Liandan.Ready()
    }
    App.Quests.Register(Quest)
})