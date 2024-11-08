(function () {
    let paramsModule = App.RequireModule("helllibjs/params/params.js")
    App.QuestParams = {
    }
    App.QuestNamedParams = new paramsModule.Params(App.QuestParams)
    App.QuestNamedParams.AddNumber("mqletter", 0).WithName("MQ任务接信设置").WithDesc("0为不接信,1为接信")
})()