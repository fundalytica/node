import Utils from './Utils.js'

export default class OptionsData {
    constructor() {
        this.sortKeys = ['symbol', 'expiration', 'basis', 'value', 'profit']
        this.orderKeys = ['asc', 'desc']

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
        const url = 'https://api.fundalytica.com/v1/options/portfolio'

        const doneCallback = data => {
            if (data.error) return fail(data.error)

            this.generated = data.generated
            this.positions = data.positions

            this.enrichPositions()
            this.sortPositions()

            done()
        }

        Utils.request(url, doneCallback, fail)
    }

    enrichPositions() {
        for (const option of this.positions) {
            // add value
            option.value = OptionsData.optionValue(option)

            // add profit
            option.profit = option.value - option.basis
        }
    }

    sortPositions() {
        const ascending = (this.order == 'asc') ? 1 : -1
        const sort = this.sort

        if (sort == 'symbol') {
            this.positions.sort((a, b) => String(a[sort]).localeCompare(String(b[sort])) * ascending)
        }
        else if (sort == 'expiration') {
            this.positions.sort((a, b) => (moment(a[sort], "DD MMM 'YY") - moment(b[sort], "DD MMM 'YY")) * ascending)
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