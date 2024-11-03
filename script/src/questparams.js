(function () {
    let paramsModule = App.RequireModule("helllibjs/params/params.js")
    App.QuestParams = {
    }
    App.QuestNamedParams = new paramsModule.Params(App.Params)
    App.QuestNamedParams.AddNumber("mqletter", 0).WithName("MQ任务接信设置").WithDesc("0为自动接信，1为不接信")
})()