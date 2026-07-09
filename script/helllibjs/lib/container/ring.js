(function () {
    class Ring {
        constructor() {
        }
        #items = []
        #currentIndex = 0
        Next() {
            if (this.#items.length === 0) {
                return null
            }
            let index = (this.#currentIndex + 1) % this.#items.length
            let r = new Ring()
            r.#items = this.#items
            r.#currentIndex = index
            return r
        }
        Prev() {
            if (this.#items.length === 0) {
                return null
            }
            let index = (this.#currentIndex - 1 + this.#items.length) % this.#items.length
            let r = new Ring()
            r.#items = this.#items
            r.#currentIndex = index
            return r
        }
        Value() {
            if (this.#items.length === 0) {
                return null
            }
            return this.#items[this.#currentIndex]
        }
        WithValue(v) {
            if (this.#items.length === 0) {
                return this
            } else {
                this.#items[this.#currentIndex] = v
            }
            return this
        }
        Len(){
            return this.#items.length
        }
        Move(n) {
            if (this.#items.length === 0) {
                return this
            }
            let index = (this.#currentIndex + n + this.#items.length) % this.#items.length
            let r = new Ring()
            r.#items = this.#items
            r.#currentIndex = index
            return r
        }
        static New(n) {
            let r = new Ring()
            r.#items = new Array(n).fill(null)
            r.#currentIndex = 0
            return r
        }
    }
    return Ring
})()