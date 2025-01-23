// 默认系统参数文件
(function () {
    let paramsModule = App.RequireModule("helllibjs/params/params.js") //使用params库,定义统一格式的可配置参数
    // 默认设定,用户不可修改
    App.Params = {
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
    App.NamedParams.AddString("LocYanjiu", "").WithName("研究坐标").WithDesc("研究坐标，未指定会根据是否有房屋信息去1949或LocDazuo")
    App.NamedParams.AddString("LocSleep", "1929").WithName("睡觉坐标").WithDesc("睡觉坐标，未指定会根据门派自动判定")
    App.NamedParams.AddNumber("HealBelow", 75).WithName("气血下限").WithDesc("低于这个值会疗伤")
    App.NamedParams.AddNumber("LearnMax", 100).WithName("学习最大次数").WithDesc("每次学习的最大次数")
    App.NamedParams.AddNumber("YanjiuMax", 100).WithName("研究最大次数").WithDesc("每次研究的最大次数")
    App.NamedParams.AddNumber("LianMax", 50).WithName("练习次数").WithDesc("每次练技能的最大次数")
    App.NamedParams.AddNumber("InspireBelow", 85).WithName("精气下限").WithDesc("低于这个值会疗精")
    App.NamedParams.AddNumber("WeaponDurationMin", 40).WithName("武器最小耐久").WithDesc("武器耐久低于这个值会去修理")
    App.NamedParams.AddNumber("NumDazuo", 0).WithName("打坐数值").WithDesc("每次打坐时的打坐数量，为0会自动判断")
    App.NamedParams.AddNumber("NumTuna", 0).WithName("吐纳数值").WithDesc("每次吐纳时的吐纳数量，为0会自动判断")
    App.NamedParams.AddNumber("NeiliMin", 40).WithName("最小内力百分比").WithDesc("判断打坐睡觉的内力百分比比率")
    App.NamedParams.AddNumber("NumJingliMin", 400).WithName("最小精力值").WithDesc("判断打吐纳的精力值，绝对数值")
    App.NamedParams.AddNumber("GoldMax", 20).WithName("最大黄金数").WithDesc("超过这个数量会去银行存黄金")
    App.NamedParams.AddNumber("GoldKeep", 2).WithName("最小黄金数").WithDesc("身上保持的最少黄金的数量")
    App.NamedParams.AddNumber("SilverMax", 2000).WithName("最大白银数").WithDesc("超过这个数量会去银行存白银")
    App.NamedParams.AddNumber("SilverKeep", 0).WithName("最小白银数").WithDesc("身上保持的最少白银的数量")
    App.NamedParams.AddNumber("CoinMax", 2000).WithName("最大铜钱数").WithDesc("超过这个数量会去银行存铜钱")
    App.NamedParams.AddNumber("CoinKeep", 0).WithName("最小铜钱数").WithDesc("身上保持的最少铜钱的数量")
    App.NamedParams.AddNumber("CashMax", 200).WithName("最大银票数").WithDesc("超过这个数量会去银行存银票")
    App.NamedParams.AddNumber("CashKeep", 30).WithName("最小银票数").WithDesc("预期身上银票的合理数量")
    App.NamedParams.AddNumber("NumCmds", 20).WithName("每心跳指令数").WithDesc("每个心跳的指令数0")
    App.NamedParams.AddNumber("SenderTimer", 1100).WithName("发送间隔").WithDesc("发送指令的间隔")
    App.NamedParams.AddNumber("NumStep", 6).WithName("多步行走步数").WithDesc("多步行走时的最大步数,小于等于1强制单步")

    App.NamedParams.AddString("ShowRoomID", "").WithName("显示房间ID").WithDesc("设为t打开")
    App.NamedParams.AddString("Echo", "t").WithName("指令回显").WithDesc("设为f关闭回显")

})()