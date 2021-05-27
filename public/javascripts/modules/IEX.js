import Utils from './Utils.js'

export default class IEX {
    constructor(token) {
        this.token = token
        this.batchURI = 'https://cloud.iexapis.com/stable/stock/market/batch'
        this.limit = 100
    }

    getQuotes(symbols, callback) {
        this.batchRequest(symbols, callback, 'quote')
    }
    getLogos(symbols, callback) {
        this.batchRequest(symbols, callback, 'logo')
    }

    batchRequest(symbols, callback, types) {
        const chunks = Utils.chunk(symbols, this.limit)

        let fetch = 0
        let data = {}

        for (const chunk of chunks) {
            const symbols = chunk.join(',')
            const url = this.batchURI + '?symbols=' + symbols + '&types=' + types + '&token=' + this.token

            const success = result => {
                fetch++
                data = Object.assign(data, result)
                if (fetch == chunks.length) callback(data)
            }

            Utils.request(url, success)
        }
    }
}