import Utils from '../Utils.js'

export default class CryptoBinance {
    constructor() {
        this.baseEndpoint = 'https://api.binance.com'
        this.tickerEndpoint = '/api/v3/ticker/price'
    }

    init(done, fail) {
        const url = `${this.baseEndpoint}${this.tickerEndpoint}`

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
}