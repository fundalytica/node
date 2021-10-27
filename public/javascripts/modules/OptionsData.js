import Utils from './Utils.js'

export default class OptionsData {
    constructor(api_origin) {
        this.api_origin = api_origin
        this.sortKeys = ['symbol', 'expiration', 'basis', 'value', 'profit']
        this.orderKeys = ['asc', 'desc']
        this.expirationDisplayFormat = "DD MMM 'YY"

        this._sort = this.sortKeys[1]
        this._order = this.orderKeys[0]
    }

    set sort(value) {
        this._sort = value;
        this.sortOptions()
    }
    get sort() {
        return this._sort
    }

    set order(value) {
        this._order = value;
        this.sortOptions()
    }
    get order() {
        return this._order
    }

    get puts() {
        return this.options.filter(row => row.right == 'P')
    }

    get calls() {
        return this.options.filter(row => row.right == 'C')
    }

    init(done, fail) {
        const url = `${this.api_origin}/v1/options/portfolio`

        const requestCallback = data => {
            if (data.error) return fail(data.error)

            this.generated = data.generated
            this.options = data.options
            this.stocks = data.stocks

            this.enrichOptions()
            this.sortOptions()

            done()
        }

        Utils.request(url, null, requestCallback, fail)
    }

    enrichOptions() {
        for (const option of this.options) {
            // add value
            option.value = OptionsData.optionValue(option)

            // add profit
            option.profit = option.value - option.basis

            // add remaining
            option.remaining = OptionsData.remaining(option.expiration)
        }
    }

    sortOptions(expirationFormat) {
        const ascending = (this.order == 'asc') ? 1 : -1
        const sort = this.sort

        if (sort == 'symbol') {
            this.options.sort((a, b) => String(a[sort]).localeCompare(String(b[sort])) * ascending)
        }
        else if (sort == 'expiration') {
            this.options.sort((a, b) => (moment(a[sort], this.expirationDisplayFormat) - moment(b[sort], this.expirationDisplayFormat)) * ascending)
        }
        else if (['basis', 'value'].includes(sort)) {
            this.options.sort((a, b) => (parseFloat(a[sort]) - parseFloat(b[sort])) * ascending)
        }
        else {
            this.options.sort((a, b) => (parseFloat(a[sort]) - parseFloat(b[sort])) * ascending)
        }
    }

    static optionValue(option) {
        return option.price * option.quantity * 100
    }

    static assignmentTotal(options) {
        return options.reduce((acc, val) => acc += parseFloat(val.strike * val.quantity * 100), 0)
    }

    static nearestExpiration(options) {
        // update remaining, time has passed since initialization
        let array = options.map(p => OptionsData.remaining(p['expiration']))

        // remove already expired entries
        array = array.filter(n => n > 0)

        const remaining = Math.min(...array)

        // indices sharing the same expiration date
        const indices = []
        let idx = array.indexOf(remaining)
        while(idx != -1) {
            indices.push(idx)
            idx = array.indexOf(remaining, idx + 1)
        }

        const symbols = options.map(p => p['symbol']).filter((s, index) => indices.includes(index))

        return { remaining, symbols }
    }

    static remaining(expiration) {
        moment.tz.setDefault("America/New_York") // set default time zone to NYSE time
        const newYorkNow = moment()
        const newYorkExpiration = moment(expiration, 'DDMMMYY')
        moment.tz.setDefault() // restore time zone

        // trading hours, 9:30 a.m. to 4 p.m. ET
        newYorkExpiration.set('hour', 16)
        newYorkExpiration.set('minute', 0)
        newYorkExpiration.set('second', 0)

        // remaining in seconds
        const remaining = newYorkExpiration.diff(newYorkNow, 'seconds') + 1

        return remaining
    }
}