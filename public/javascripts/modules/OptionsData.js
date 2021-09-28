import Utils from './Utils.js'

export default class OptionsData {
    constructor(api_origin) {
        this.api_origin = api_origin
        this.sortKeys = ['symbol', 'expiration', 'basis', 'value', 'profit']
        this.orderKeys = ['asc', 'desc']
        this.expirationDisplayFormat = "DD MMM 'YY"

        this._sort = this.sortKeys[0]
        this._order = this.orderKeys[0]
    }

    set sort(value) {
        this._sort = value;
        this.sortPositions()
    }
    get sort() {
        return this._sort
    }

    set order(value) {
        this._order = value;
        this.sortPositions()
    }
    get order() {
        return this._order
    }

    init(done, fail) {
        const url = `${this.api_origin}/v1/options/portfolio`

        const requestCallback = data => {
            if (data.error) return fail(data.error)

            this.generated = data.generated
            this.positions = data.positions

            this.enrichPositions()
            this.sortPositions()

            done()
        }

        Utils.request(url, null, requestCallback, fail)
    }

    enrichPositions() {
        for (const option of this.positions) {
            // add value
            option.value = OptionsData.optionValue(option)

            // add profit
            option.profit = option.value - option.basis
        }
    }

    sortPositions(expirationFormat) {
        const ascending = (this.order == 'asc') ? 1 : -1
        const sort = this.sort

        if (sort == 'symbol') {
            this.positions.sort((a, b) => String(a[sort]).localeCompare(String(b[sort])) * ascending)
        }
        else if (sort == 'expiration') {
            this.positions.sort((a, b) => (moment(a[sort], this.expirationDisplayFormat) - moment(b[sort], this.expirationDisplayFormat)) * ascending)
        }
        else if (['basis', 'value'].includes(sort)) {
            this.positions.sort((a, b) => (parseFloat(a[sort]) - parseFloat(b[sort])) * ascending)
        }
        else {
            this.positions.sort((a, b) => (parseFloat(a[sort]) - parseFloat(b[sort])) * ascending)
        }
    }

    puts() {
        return this.positions.filter(row => row.right == 'P')
    }

    calls() {
        return this.positions.filter(row => row.right == 'C')
    }

    static optionValue(option) {
        return option.price * option.quantity * 100
    }

    static assignmentTotal(positions) {
        return positions.reduce((acc, val) => acc += parseFloat(val.strike * val.quantity * 100), 0)
    }
}