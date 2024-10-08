(function () {
    class Ring {
        constructor() {
        }
        #next = null
        #prev = null
        #value = null
        #init() {
            this.#next = this
            this.#prev = this
            return this
        }
        Next() {
            if (this.#next == null) {
                return this.#init()
            }
            return this.#next
        }
        Prev() {
            if (this.#next == null) {
                return this.#init()
            }
            return this.#prev
        }
        Value() {
            return this.#value
        }
        WithValue(v) {
            this.#value = v
            return this
        }
        Move(n) {
            if (this.#next == null) {
                return this.#init()
            }
            let r = this
            if (n < 0) {
                while (n < 0) {
                    r = r.Prev()
                    n = n + 1
                }
            } else if (n > 0) {
                while (n > 0) {
                    r = r.Next()
                    n = n - 1
                }
            }
            return r
        }
        Link(r) {
            let n = this.Next()
            if (r != null) {
                let p = r.Prev()
                this.#next = r
                r.#prev = this
                n.#prev = p
                p.#next = n
            }
            return n
        }
        Unlink(n) {
            if (n <= 0) {
                return null
            }
            return this.Link(this.Move(n + 1))
        }
        Len() {
            let n = 0
            if (this != null) {
                n = 1
                let p = this.Next()
                while (p != this) {
                    n = n + 1
                    p = p.Next()
                }
            }
            return n
        }
        Apply(fn) {
            if (this != null) {
                let p = this.Next()
                while (p != this) {
                    fn(p.Value())
                    p = p.Next()
                }
            }
        }
        static New(n) {
            if (n <= 0) {
                return null
            }
            let r = new Ring()
            let p = r
            let i = 1
            while (i < n) {
                let newp = new Ring()
                newp.#prev = p
                p.#next = newp
                p = newp
                i = i + 1
            }
            p.#next = r
            r.#prev = p
            return r
        }
    }
    return Ring
})()