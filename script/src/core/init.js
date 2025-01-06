//初始化
(function (app) {
    let objectModule = App.RequireModule("helllibjs/object/object.js")
    let cnumberModule = App.RequireModule("helllibjs/cnumber/cnumber.js")
    //数字解析
    objectModule.CNumber.ReUnit = /本|幅|壶|支|顶|块|朵|面|匹|位|支|颗|个|把|只|粒|张|枚|件|柄|根|块|文|两|碗|滴|位|枚|包|片|盒|棵|袋|副|锭/
    objectModule.CNumber.FixedNames = ["一千两银票"]
    App.CNumber = new cnumberModule.CNumber()
    App.CNumber.ReUnit = /本|幅|壶|支|顶|块|朵|面|匹|位|支|颗|个|把|只|粒|张|枚|件|柄|根|块|文|两|碗|滴|位|枚|包|片|盒|棵|袋|副|锭/
    //初始化指令
    App.InitCommad = "score;hp;hp -m;cha;i;l qiankun bag of me;set no_more;jifa;donate;set auto_regenerate;unset auto_say;auto_drinkout;#jifa"
    App.Init = function () {
        if (App.InitCommad) {
            App.Send(App.InitCommad)
            App.InitCommad = ""
        }
        App.Commands.PushCommands(
            App.NewSyncCommand(),
            App.Commands.NewFunctionCommand(() => { App.ReloadVariable(); App.Next() })
        )
        App.Next()
    }
})(App)