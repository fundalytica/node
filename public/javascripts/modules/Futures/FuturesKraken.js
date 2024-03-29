import Utils from '../Utils.js'

export default class FuturesKraken {
    constructor(api_origin) {
        this.api_origin = api_origin

        this.socketURL = 'wss://futures.kraken.com/ws/v1'

        this.sockets = {}

        // [ product_id, ..., product_id ]
        // this.bookSnapshotsSent = []

        // { product_id: { last:, accepted:, rejected: } }
        this.messages = {}
        // { feed: { start:, last:  } }
        this.heartbeats = {}
    }

    init(done, fail) {
        const symbolsURL = `${this.api_origin}/v1/crypto/futures/tickers/symbols/kraken`

        const requestCallback = data => {
            // OVERRIDE
            // const pair = 'bchusd'
            // const period = 'quarter'
            // const maturity = 210924
            // const symbol = `fi_${pair}_${maturity}`
            // data.pairs = {}
            // data.pairs[pair] = {}
            // data.pairs[pair][period] = symbol
            //

            if (data.error) return fail(data.error)

            this.symbols = data

            done(data)
        }

        Utils.request(symbolsURL, null, requestCallback, fail)
    }

    terminate() {
        Object.keys(this.sockets).forEach(id => this.sockets[id].close())
    }

    status() {
        let strings = []

        // socket states
        const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']

        // heartbeats
        Object.keys(this.heartbeats).forEach(id => {
            const state = states[this.sockets[id].readyState].toLowerCase()

            const start = moment(this.heartbeats[id].start)
            const last = this.heartbeats[id].last ? moment(this.heartbeats[id].last) : null

            const fmt = 'HH:mm:ss'

            let str = `[ ${id}:${state} ]`

            if(last) {
                // str += ` ${start.format(fmt)}`
                const minutes = moment.duration(last - start).asMinutes().toFixed(0)
                // str += ` to ${last.format(fmt)} ( +${minutes}m )`
                str += ` ${last.format(fmt)} ( ${minutes}m )`
            }

            strings.push(str)
        })

        return strings
    }

    initSocket(id, subscription, threshold) {
        const start = new Date()

        const ws = new WebSocket(this.socketURL)
        ws.id = id

        ws.onopen = () => {
            ws.send(subscription)
            ws.send('{ "event": "subscribe", "feed": "heartbeat"}')
        }
        ws.onerror = console.log
        ws.onclose = e => {
            // // start over book
            // if(e.currentTarget.id == 'book') {
            //     setTimeout(() => {
            //         this.initBookSocket()
            //     }, 2000)
            // }

            if(e.currentTarget.id == 'ticker') {
                this.initTickerSocket()
            }
        }

        ws.onmessage = e => {
            const data = JSON.parse(e.data)

            if (data.event) {
                if (data.event == 'subscribed') {
                    // const feed = data.feed
                    // const symbol = data.product_ids ? data.product_ids[0] : null
                    // console.log(`subscribed ${feed} ${symbol}`)

                    this.emitEvent(data.event, data)
                }
                else if (data.event != 'info') {
                    console.log('ws.onmessage')
                    console.log(data)
                }
            }

            if (!data.event) {
                const socketId = e.currentTarget.id

                // get id
                const id = `${data.feed}.${data.product_id}`

                // initialize
                if (!this.messages[id]) this.messages[id] = { last: null, accepted: 0, rejected: 0 }

                const last = this.messages[id]['last']
                const now = new Date()
                const ms = last ? now - last : Infinity

                // reject
                if (ms < threshold) {
                    this.messages[id]['rejected']++
                    return
                }

                this.messages[id]['accepted']++
                this.messages[id]['last'] = now

                // const colors = { ticker: 'green', book: 'blue' }
                // console.log(`%c⏱ ${id} +${ms}ms = ${moment(now).format('HH:mm:ss:SSS')} 🙂${this.messages[id]['accepted']} 😡${this.messages[id]['rejected']} 🏃‍♂️${moment.duration(now - start).asSeconds()}s`, `color:${colors[feed]}`)

                // update heartbeat
                if(data.feed == 'heartbeat') {
                    this.heartbeats[socketId].last = data.time
                }
                // // book socket repeatedly connecting, use dummy heartbeat
                // if(data.feed == 'book_snapshot') {
                //     this.heartbeats[socketId].last = new Date().getTime()
                //     document.dispatchEvent(new Event('heartbeat'))
                // }

                this.emitEvent(data.feed, data)
            }
        }

        this.sockets[id] = ws
    }

    initTickerSocket() {
        const id = "ticker"
        const threshold = 200

        const subscription = `{ "event": "subscribe", "feed": "${id}", "product_ids": ${FuturesKraken.productIdsString(this.symbols)}}`
        this.initSocket(id, subscription, threshold)

        if(! this.heartbeats[id]) this.heartbeats[id] = { start: new Date().getTime() }
    }

    // initBookSocket() {
    //     const id = "book"
    //     const threshold = 1000

    //     const subscription = `{ "event": "subscribe", "feed": "${id}", "product_ids": ${FuturesKraken.productIdsString(this.symbols)}}`
    //     this.initSocket(id, subscription, threshold)

    //     if(! this.heartbeats[id]) this.heartbeats[id] = { start: new Date().getTime() }
    // }

    emitEvent(event, data) {
        // // not using book updates (inconsistent)
        // if(data.feed == 'book') return

        // // add spread when book snapshot received
        // if(data.feed == 'book_snapshot') {
        //     // add spread to data
        //     const book = new FuturesOrderBook(data.bids, data.asks)
        //     data.spread = book.spread()
        // }

        // dispatch any event
        const e = new Event(event)
        e.data = data
        document.dispatchEvent(e)

        // // restart book socket
        // if(data.feed == 'book_snapshot') {
        //     // register snapshot flag
        //     this.bookSnapshotsSent.push(data.product_id)
        //     // unique
        //     this.bookSnapshotsSent = [...new Set(this.bookSnapshotsSent)]

        //     // all snapshots received
        //     if(this.bookSnapshotsSent.length == FuturesKraken.symbolsArray(this.symbols).length) {
        //         // close socket
        //         this.sockets['book'].close()
        //         // reset flags
        //         this.bookSnapshotsSent = []
        //     }
        // }
    }

    nextSettlementDays() {
        const symbols = FuturesKraken.symbolsArray(this.symbols)

        const days = symbols.map(s => FuturesKraken.daysUntilSettlement(s)).filter(s => s != null)
        const min = Math.min(...days)

        return min
    }

    // String '["pi_xbtusd","pi_ethusd"]'
    static productIdsString(symbols) {
        const symbolsArray = FuturesKraken.symbolsArray(symbols)

        let product_ids = []

        for (const symbol of symbolsArray) {
            product_ids.push(`"${symbol}"`)
        }

        product_ids = `[${product_ids.join(',')}]`

        return product_ids
    }

    // Array ["pi_xbtusd", "fi_xbtusd_210528", ..... , "pi_ethusd", "fi_ethusd_210528"]
    static symbolsArray(symbols, fixed) {
        let list = []

        for (const pair in symbols['pairs']) {
            for (const period in symbols['pairs'][pair]) {
                const symbol = symbols['pairs'][pair][period]
                list.push(symbol)
            }
        }

        return list
    }

    static maturity(symbol) {
        const split = symbol.split('_')

        if (split.length == 2) return null

        const dateString = split[2]

        const date = moment.tz(dateString, 'YYMMDD', 'Europe/London') // London time now using string format
        date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }) // reset time
        date.add(16, 'hours') // 16:00

        return date
    }

    static daysUntilSettlement(symbol) {
        const maturity = FuturesKraken.maturity(symbol)

        if (!maturity) return null

        const now = moment.tz('Europe/London') // London time now

        return maturity.diff(now, 'days')
    }

    static timeUntilSettlement(format = (h,m,s) => `${h}h ${m}m ${s}s`) {
        const now = moment.tz('Europe/London') // London time now

        const settle = now.clone()
        settle.add(1, 'days') // +1 to cover cases when now is past the settlement time
        settle.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }) // reset time
        settle.add(16, 'hours') // 16:00

        // duration
        const diff = settle.diff(now)
        const h = moment.duration(diff).hours()
        const m = moment.duration(diff).minutes()
        const s = moment.duration(diff).seconds()

        const remaining = format(h, m, s)

        return remaining
    }
}