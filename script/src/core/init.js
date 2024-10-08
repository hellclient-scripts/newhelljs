(function(app){
    let objectModule=app.RequireModule("helllibjs/object/object.js")
    let cnumberModule = app.RequireModule("helllibjs/cnumber/cnumber.js")

    objectModule.CNumber.ReUnit = /本|幅|壶|支|顶|块|朵|面|匹|位|支|颗|个|把|只|粒|张|枚|件|柄|根|块|文|两|碗|滴/
    objectModule.CNumber.FixedNames=["一千两银票"]
    app.CNumber=new cnumberModule.CNumber()
    app.CNumber.ReUnit = /本|幅|壶|支|顶|块|朵|面|匹|位|支|颗|个|把|只|粒|张|枚|件|柄|根|块|文|两|碗|滴/
    let numcmds=GetVariable("num_cmds")
    if (!isNaN(numcmds)){
        numcmds=numcmds-0
        if (numcmds<=0){numcmds=App.Params.DefaultNumCmds}
    }
    Metronome.settick(1100)
    Metronome.setinterval(50)
    Metronome.setbeats(numcmds)
})(App)