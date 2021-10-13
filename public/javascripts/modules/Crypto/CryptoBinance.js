import Utils from '../Utils.js'

export default class CryptoBinance {
    constructor() {
        this.baseEndpoint = 'https://api.binance.com'
        this.tickerEndpoint = '/api/v3/ticker/price'
        this.data = null
    }

    init(done, fail) {
        const url = `${this.baseEndpoint}${this.tickerEndpoint}`

        const requestCallback = data => {
            if (data.error) {
                console.log(`${url} [𝗑]`)
                return fail(data.error)
            }

            console.log(`${url} [✓]`)
            this.data = data
            done(data)
        }

        Utils.request(url, null, requestCallback, fail)
    }

    symbols() {
        const baseCurrency = 'USDT'

        let symbols = this.data.map(t => t["symbol"])

        // keep pairs ending in USDT
        symbols = symbols.filter(t => t.substr(-baseCurrency.length) == baseCurrency)
        // remove USDT from pair
        symbols = symbols.map(t => t.substr(0, t.length - baseCurrency.length))
        // remove symbols ending in UP, DOWN, BULL, BEAR
        const exclude = ['UP','DOWN','BULL','BEAR']
        symbols = symbols.filter(t => {
            for(const e of exclude) {
                if(t.substr(-e.length) == e) {
                    return false
                }
            }
            return true
        })
        // sort alphabetically
        symbols = symbols.sort()

        return symbols
    }
}