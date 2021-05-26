import Utils from '../Utils.js'

export default class FuturesKraken {
    constructor() { }

    init(done, fail) {
        const symbolsURL = 'https://api.fundalytica.com/v1/crypto/futures/tickers/symbols/kraken'

        const doneCallback = data => {
            if (data.error) return fail(data.error)

            this.symbols = data
            done(data)
        }

        Utils.request(symbolsURL, doneCallback, fail)
    }

    initSocket(subscribed, update) {
        const url = 'wss://futures.kraken.com/ws/v1'

        const subscribe = `{"event": "subscribe", "feed": "ticker", "product_ids": ${FuturesKraken.productIds(this.symbols)}}`

        const ws = new WebSocket(url)

        ws.onopen = () => ws.send(subscribe)

        ws.onerror = console.log

        ws.onmessage = e => {
            const data = JSON.parse(e.data)

            if (data.event) {
                if (data.event == 'subscribed') {
                    const symbol = data.product_ids[0]
                    subscribed(symbol)
                }
                else if (data.event != 'info') {
                    console.log('ws.onmessage')
                    console.log(data)
                }
            }

            if (!data.event) {
                update(data)
            }
        }
    }

    // String '["pi_xbtusd","pi_ethusd"]'
    static productIds(symbols) {
        const symbolsList = FuturesKraken.symbolsList(symbols)

        let product_ids = []

        for (const symbol of symbolsList) {
            product_ids.push(`"${symbol}"`)
        }

        product_ids = `[${product_ids.join(',')}]`

        return product_ids
    }

    // Array ["pi_xbtusd", "fi_xbtusd_210528", ..... , "pi_ethusd", "fi_ethusd_210528"]
    static symbolsList(symbols) {
        let list = []

        for (const pair in symbols['pairs']) {
            for (const period in symbols['pairs'][pair]) {
                const symbol = symbols['pairs'][pair][period]
                list.push(symbol)
            }
        }

        return list
    }

    static expiration(symbol) {
        const split = symbol.split('_')

        if (split.length == 2) return null

        const date = split[2]

        return moment(date, "YYMMDD")
    }

    static days(symbol) {
        return FuturesKraken.expiration(symbol).diff(moment(), 'days')
    }
}