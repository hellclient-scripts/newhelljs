(function (App) {
    let modules = {}
    class Good {
        Key = ""
        ID = ""
        Name = ""
        Type = ""
        From = ""
        Command = ""
        Data = null
    }
    class Goods {
        #items = {}
        #buyers = {}
        LoadCSV(line, sep) {
            let data = line.split(sep)
            let good = new Good()
            good.Key = data[0]
            good.ID = data[1] || ""
            good.Name = data[2] || ""
            good.Type = data[3] || ""
            good.From = data[4] || ""
            good.Command = data[5] || ""
            good.Data = data[6] || ""
            this.RegisterGood(good)
        }
        NewGood() {
            return new Good()
        }
        RegisterBuyer(type, buyer) {
            this.#buyers[type] = buyer
        }
        RegisterGood(good) {
            this.#items[good.Key] = good
        }
        GetGood(key) {
            return this.#items[key]
        }
        GetGoodsByName(name) {
            let result = []
            for (let key in this.#items) {
                let item = this.#items[key]
                if (item.Name == name) {
                    result.push(item)
                }
            }
            return result
        }
        GetGoodsByID(id) {
            let result = []
            for (let key in this.#items) {
                let item = this.#items[key]
                if (item.ID == id) {
                    result.push(item)
                }
            }
            return result
        }
        Buy(key) {
            let item = this.#items[key]
            if (!item) {
                throw new Error("Good [" + key + "] not found.")
            }
            let buyer = this.#buyers[item.Type]
            if (!buyer) {
                throw new Error("Good type [" + buyer + "] not found.")
            }
            buyer(item)
        }
    }
    modules.Goods = Goods
    return modules
})