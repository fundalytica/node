import Utils from './Utils.js'

export default class API {
    constructor(token) {
        this.token = token
        this.quoteURI = 'https://api.fundalytica.com/v1/quote'
    }

    getPrices(symbols, callback) {
        this.batchRequest(symbols, callback)
    }

    batchRequest(symbols, callback) {
        let fetch = 0
        let data = {}

        for(const symbol of symbols) {
            const url = this.quoteURI + '/' + symbol

            const success = result => {
                fetch++
                data[result.symbol] = result
                if(fetch == symbols.length) callback(data)
            }

            $.getJSON({ url, success })
        }
    }
}
