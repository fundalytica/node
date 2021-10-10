import Utils from './Utils.js'

export default class CryptoData {
    constructor(api_origin) {
        this.api_origin = api_origin
    }

    init(done, fail) {
        const url = `${this.api_origin}/v1/crypto/portfolio`

        const requestCallback = data => {
            if (data.error) {
                console.log(`${url} [𝗑]`)
                return fail(data.error)
            }

            console.log(`${url} [✓]`)
            done(data)
        }

        Utils.request(url, null, requestCallback, fail)
    }

    update(action, symbol, amount, cost, callback) {
        const url = `${this.api_origin}/v1/crypto/portfolio/update`

        const fail = error => {
            console.log(error)
        }

        console.log(`${url} ${symbol} ${amount} ${cost}`)

        const options = { method: 'POST' }

        const body = new URLSearchParams()
        body.append('action', action)
        body.append('symbol', symbol)
        body.append('amount', amount)
        body.append('cost', cost)
        options.body = body

        Utils.request(url, options, callback, fail)
    }
}