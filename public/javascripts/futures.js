import FuturesKraken from './modules/FuturesKraken.js'

const UILoading = options => {
}

const UISuccess = (options, data) => {
}

const UIError = error => {
}

const fetch = options => {
    UILoading(options)

    // const url = 'wss://futures.kraken.com/ws/v1'
    // const product_ids = '["PI_XBTUSD","PI_ETHUSD"]'
    // const subscribe = `{"event": "subscribe", "feed": "ticker", "product_ids": ${product_ids}}`
    // var ws = new WebSocket(url)
    // ws.onopen = () => {
    //     console.log('ws.onopen')
    //     ws.send(subscribe)
    // }
    // ws.onmessage = e => {
    //     console.log('ws.onmessage')
    //     console.log(e.data)
    // }

    const futuresKraken = new FuturesKraken()
    futuresKraken.futures()

    // $.ajax({ url: url })
    //     .done(data => {
    //         UISuccess(options, data)
    //     })
    //     .fail(() => UIError(`${url} fail`))
}

const run = () => {
    fetch({})
}

$(run)