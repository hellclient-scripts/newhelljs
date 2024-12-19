(function (app) {
    let cnumberModule = App.RequireModule("helllibjs/cnumber/cnumber.js")

    let module = {}
    module.CNumber = new cnumberModule.CNumber()
    class ObjectData {
        constructor() {
        }
        Unit = ""
        Count = 1
        Name = ""
    }
    module.DataParaser = function (obj) {
        obj.Data = new ObjectData()
        let result = module.CNumber.Convert(obj.Label)
        obj.Data.Count = result.Count
        obj.Data.Unit = result.Unit
        obj.Data.Name = result.Name
    }
    class Object {
        constructor(label, id, raw) {
            this.ID = id
            this.IDLower = id.toLowerCase()
            this.Label = label
            this.#raw = raw
        }
        GetData(noparse) {
            if (this.Data == null) {
                if (!noparse) {
                    module.DataParaser(this)
                } else {
                    this.Data = new ObjectData()
                }
            }
            return this.Data
        }
        GetRaw() {
            return this.#raw
        }
        WithKey(key) {
            this.Key = key
            return this
        }
        WithParam(name, data) {
            this.Params[name] = data
            return this
        }
        Data = null
        ID = ""
        Key = ""
        IDLower = ""
        #raw = null
        Label = ""
        Params = {}
        Mode = 0
    }
    class List {
        constructor() {
        }
        NewObject(label, id, raw) {
            return new Object(label, id, raw)
        }
        IsNotEmpty() {
            return this.Items.length > 0
        }
        Items = []
        Append(item) {
            this.Items.push(item)
        }
        Clear() {
            this.Items = []
        }
        FindByID(id) {
            let result = new List()
            this.Items.forEach(item => {
                if (item.ID == id) {
                    result.Append(item)
                }
            })
            return result
        }
        FindByKey(id) {
            let result = new List()
            this.Items.forEach(item => {
                if (item.Key == id) {
                    result.Append(item)
                }
            })
            return result
        }
        FindByIDLower(id) {
            id = id.toLowerCase()
            let result = new List()
            this.Items.forEach(item => {
                if (item.IDLower == id) {
                    result.Append(item)
                }
            })
            return result
        }
        FindByLabel(label) {
            let result = new List()
            this.Items.forEach(item => {
                if (item.Label == label) {
                    result.Append(item)
                }
            })
            return result
        }
        FindByName(name) {
            let result = new List()
            this.Items.forEach(item => {
                if (item.GetData().Name == name) {
                    result.Append(item)
                }
            })
            return result
        }
        SearchName(key) {
            let result = new List()
            this.Items.forEach(item => {
                if (item.GetData().Name.indexOf(key) > -1) {
                    result.Append(item)
                }
            })
            return result
        }
        SearchID(key) {
            let result = new List()
            this.Items.forEach(item => {
                if (item.ID.indexOf(key) > -1) {
                    result.Append(item)
                }
            })
            return result
        }
        SearchLabel(key) {
            let result = new List()
            this.Items.forEach(item => {
                if (item.Label.indexOf(key) > -1) {
                    result.Append(item)
                }
            })
            return result
        }
        ExcludeID(id) {
            let result = new List()
            this.Items.forEach(item => {
                if (item.ID != id) {
                    result.Append(item)
                }
            })
            return result

        }
        FindByFilter(filter) {
            let result = new List()
            this.Items.forEach(item => {
                if (filter(item, list)) {
                    result.Append(item)
                }
            })
            return result
        }
        First() {
            if (this.Items.length) {
                return this.Items[0]
            }
            return null
        }
        Last() {
            if (this.Items.length) {
                return this.Items[this.Items.length - 1]
            }
            return null
        }
        Sum() {
            let result = 0
            this.Items.forEach(item => {
                result = result + item.GetData().Count
            })
            return result
        }
    }
    module.Object = Object
    module.List = List
    return module
})