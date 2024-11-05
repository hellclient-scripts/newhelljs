(function () {
    let paramsModule = App.RequireModule("helllibjs/params/params.js")
    App.Params = {
        DefaultNumCmds: 42,
        Drink: "shui dai",
        DrinkMin: 3,
        DrinkCommand: "drink shui dai",
        Food: "gan liang",
        FoodCommand: "eat gan liang",
        FoodMin: 5,
        LocBank: "23",
        LocRepair: "66",
        IDPass: "",
        ReloginDelay: 120000,
    }
    App.NamedParams = new paramsModule.Params(App.Params)
    App.NamedParams.AddString("MasterID", "").WithName("掌门ID").WithDesc("掌门ID，未指定会根据门派自动判定")
    App.NamedParams.AddString("LocMaster", "").WithName("掌门坐标").WithDesc("掌门坐标，未指定会根据门派自动判定")
    App.NamedParams.AddString("LocDazuo", "1927").WithName("打坐坐标").WithDesc("打坐坐标，未指定会根据门派自动判定")
    App.NamedParams.AddString("LocSleep", "1929").WithName("睡觉坐标").WithDesc("睡觉坐标，未指定会根据门派自动判定")
    App.NamedParams.AddNumber("HealBelow", 75).WithName("气血下限").WithDesc("低于这个值会疗伤")
    // App.NamedParams.AddNumber("InspireBleow", 75).WithName("精气下限").WithDesc("低于这个值会疗伤")
    App.NamedParams.AddNumber("WeaponDurationMin", 40).WithName("武器最小耐久").WithDesc("武器耐久低于这个值会去修理")
    App.NamedParams.AddNumber("NumDazuo", 0).WithName("打坐数值").WithDesc("每次打坐时的打坐数量，为0会自动判断")
    App.NamedParams.AddNumber("NumTuna", 0).WithName("吐纳数值").WithDesc("每次吐纳时的吐纳数量，为0会自动判断")
    App.NamedParams.AddNumber("NeiliMin", 40).WithName("最小内力百分比").WithDesc("判断打坐睡觉的内力百分比比率")
    App.NamedParams.AddNumber("JingliMin", 40).WithName("最小精力百分比").WithDesc("判断打吐纳的精力百分比比率")
    App.NamedParams.AddNumber("GoldMax", 20).WithName("最大黄金数").WithDesc("超过这个数量会去银行存黄金")
    App.NamedParams.AddNumber("GoldKeep", 2).WithName("最小黄金数").WithDesc("身上保持的最少黄金的数量")
    App.NamedParams.AddNumber("SilverMax", 2000).WithName("最大白银数").WithDesc("超过这个数量会去银行存白银")
    App.NamedParams.AddNumber("SilverKeep", 0).WithName("最小白银数").WithDesc("身上保持的最少白银的数量")
    App.NamedParams.AddNumber("CoinMax", 2000).WithName("最大铜钱数").WithDesc("超过这个数量会去银行存铜钱")
    App.NamedParams.AddNumber("CoinKeep", 0).WithName("最小铜钱数").WithDesc("身上保持的最少铜钱的数量")
    App.NamedParams.AddNumber("CashMax", 200).WithName("最大银票数").WithDesc("超过这个数量会去银行存银票")
    App.NamedParams.AddNumber("CashKeep", 30).WithName("最小银票数").WithDesc("预期身上银票的合理数量")

})()