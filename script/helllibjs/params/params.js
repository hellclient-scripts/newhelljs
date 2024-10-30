(function (app) {
    let module = {}
    class Param {
        constructor(id, initvalue, type) {
            this.ID = id
            this.Value = initvalue
            this.Type = type
        }
        WithName(name) {
            this.Name = name
            return this
        }
        WithDesc(desc) {
            this.Desc = desc
            return this
        }
        WithIntro(intro) {
            this.Intro = intro
            return this
        }
        Name = ""
        Desc = ""
        Intro = ""
        ID = ""
        Value = null
        Type = Params.TypeString
    }
    class Params {
        static TypeString = 0
        static TypeNumber = 1
        static TypeBool = 2
        constructor(data) {
            this.#data = data
        }
        Data() {
            return this.#data
        }
        AddNumber(id, initvalue) {
            let p = new Param(id, initvalue, Params.TypeNumber)
            this.Params.push(p)
            this.#data[id] = initvalue
            return p
        }
        AddString(id, initvalue) {
            let p = new Param(id, initvalue, Params.TypeString)
            this.Params.push(p)
            this.#data[id] = initvalue
            return p
        }
        AddBool(id, initvalue) {
            let p = new Param(id, initvalue, Params.TypeBool)
            this.Params.push(p)
            this.#data[id] = initvalue
            return p
        }
        SetStringValues(data) {
            this.Params.forEach((p) => {
                let val = data[p.ID]
                if (val != null) {
                    switch (p.Type) {
                        case Params.TypeString:
                            this.#data[p.ID] = val
                            break
                        case Params.TypeNumber:
                            if (!isNaN(val)) {
                                this.#data[p.ID] = (val - 0)
                            } else {
                                PrintSystem("无效的数字参数 " + p.ID + " : " + val)
                            }
                            break
                        case Params.TypeBool:
                            let v = val.trim().toLowerCase()
                            if (v == "t" || t == "true" || t == "1") {
                                this.#data[p.ID] = true
                            } else {
                                this.#data[p.ID] = false
                            }
                            break
                    }
                }
            })
        }
        Params = []
        #data = {}
    }
    module.Params = Params
    return module
})