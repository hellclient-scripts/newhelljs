(function () {
    let paramsModule = App.RequireModule("helllibjs/params/params.js")
    App.QuestParams = {
    }
    App.QuestNamedParams = new paramsModule.Params(App.QuestParams)
    App.QuestNamedParams.AddNumber("mqletter", 0).WithName("MQ任务接信设置").WithDesc("0为自动,1为接信,2为不接信")
    App.QuestNamedParams.AddNumber("mqlettertihui", 2000).WithName("MQ自动接写体会").WithDesc("超过这个体会会接信")

    App.QuestNamedParams.AddNumber("qinlingflee", 0).WithName("秦陵自动逃跑").WithDesc("0为逃跑，1为不逃跑")
})()