// import FuturesKraken from './modules/FuturesKraken.js'

const IDs = ["futures"]

const fetch = options => {
    UILoading(options)

    const url = 'https://api.fundalytica.com/v1/crypto/futures/tickers/symbols/kraken'
    $.ajax({ url: url })
        .done(data => {
            UISuccess(options, data)
        })
        .fail(() => UIError(`${url} fail`))
}

const UILoading = options => {
    clearTables()

    $("#spinner").removeClass('d-none')

    $("#error").addClass('d-none')
    $('#error').text('')

    for(const id of IDs) {
        hideIDElements(id)
    }
}

const UIError = error => {
    $("#spinner").addClass('d-none')

    $('#error').text(`😭 ${error}`)
    $("#error").removeClass('d-none')
}

const UISuccess = (options, data) => {
    $("#spinner").addClass('d-none')

    console.log(data)

    updateTables(data)

    socket(symbols(data))
}

const clearTables = () => {
    for(const id of IDs) {
        $(`#table-${id} thead`).empty()
        $(`#table-${id} tbody`).empty()
    }
}

const hideIDElements = (id, hide = true) => {
    if(hide) {
        $(`#table-${id}`).addClass('d-none')
    }
    else {
        $(`#table-${id}`).removeClass('d-none')
    }
}

const symbols = data => {
    let symbols = []

    for (const pair in data['pairs']) {
        for (const period in data['pairs'][pair]) {
            const symbol = data['pairs'][pair][period]
            symbols.push(symbol)
        }
    }

    return symbols
}

const socket = symbols => {
    $('#socket').text(`futures.kraken.com WebSocket`)

    const url = 'wss://futures.kraken.com/ws/v1'

    // const product_ids = '["pi_xbtusd","pi_ethusd"]'
    let product_ids = []
    for (const symbol of symbols) {
        product_ids.push(`"${symbol}"`)
    }
    product_ids = `[${product_ids.join(',')}]`

    const subscribe = `{"event": "subscribe", "feed": "ticker", "product_ids": ${product_ids}}`

    var ws = new WebSocket(url)

    ws.onopen = () => ws.send(subscribe)

    ws.onerror = e => {
        console.log(e)
    }

    ws.onmessage = e => {
        console.log('msg')

        const data = JSON.parse(e.data)

        if (data.event) {
            if (data.event == 'subscribed') {
                console.log(`${data.event} ${data.product_ids[0]}`)

                const symbol = data.product_ids[0].toLowerCase()

                // entire row color
                $(`#${symbol}`).removeClass('text-secondary')

                // status icon color
                $(`#${symbol} .status i`).removeClass('text-danger')
                $(`#${symbol} .status i`).addClass('text-success')
            }
            else {
                console.log('ws.onmessage')
                console.log(data)
            }
        }
        if (!data.event) {
            const symbol = data['product_id'].toLowerCase()
            const markPrice = data['markPrice']

            updateText(`#${symbol} > .price`, numeral(markPrice).format('$0,0'))

            if (!data['funding_rate']) {
                const premium = data['premium']
                const annualized = premium / days(symbol) * 365

                updateText(`#${symbol} > .premium`, numeral(premium / 100).format('0.0%'))
                updateText(`#${symbol} > .annualized`, numeral(annualized / 100).format('0.0%'))
            }
        }
    }
}

const updateText = (element, text) => {
    const currentText = $(element).text()

    if (currentText != text) {
        $(element).finish()

        $(element).animate({ opacity: .5 }, 100, "linear", function () {
            $(this).animate({ opacity: 1 }, 100)
        })
    }

    $(element).text(text)
}

const addHeader = (id, headers, hide) => {
    let row = '<tr>'

    for (const key of headers) {
        if (hide.includes(key)) continue

        row += `<th class="align-middle">${key}</th>`
    }

    row += '</tr>'

    $(`#table-${id} > thead`).append(row)
}

const addRow = (id, headers, values, hide) => {
    const symbol = values[headers.indexOf('symbol')]
    let row = `<tr id=${symbol} class="text-secondary">`

    for (let i = 0; i < values.length; i++) {
        const key = headers[i]
        let value = values[i]

        if (hide.includes(key)) continue

        row += `<td class="${key} align-middle" data-title="${key}">${value}</td>`
    }

    row += '</tr>'

    $(`#table-${id} > tbody:last-child`).append(row)
}

const updateTables = data => {
    const id = 'futures'

    const headers = ['pair', 'period', 'symbol', 'expiration', 'days', 'price', 'premium', 'annualized', 'status']
    const hide = ['symbol']

    addHeader(id, headers, hide)

    const rows = []

    for (const pair in data['pairs']) {
        const symbols = data['pairs'][pair]

        for (const period in symbols) {
            const crypto = pair.substr(0, 3)
            const symbol = symbols[period]

            const expiration_string = expiration(symbol) ? expiration(symbol).format("DD MMM 'YY") : '-'
            const days_string = expiration(symbol) ? `${days(symbol)}d` : '-'

            const status = '<i class="text-danger bi bi-circle-fill"></i>'
            const logo_pair = `<img class="logo" src="https://www.fundalytica.com/images/logos/crypto/${crypto}.svg" /> <span>${pair.toUpperCase()}</span>`

            const values = [logo_pair, period, symbol, expiration_string, days_string, '-', '-', '-', status]
            rows.push(values)
        }
    }

    // sort
    const pairIndex = headers.indexOf('pair')
    const pairOrder = ['xbtusd', 'ethusd']
    const symbolIndex = headers.indexOf('symbol')
    rows.sort((a, b) => {
        if (pairOrder.indexOf(a[pairIndex]) == pairOrder.indexOf(b[pairIndex])) {
            return b[symbolIndex].localeCompare(a[symbolIndex])
        }
        else {
            return pairOrder.indexOf(a[0]) - pairOrder.indexOf(b[0])
        }
    })

    for (const row of rows) {
        addRow(id, headers, row, hide)
    }

    hideIDElements(id, false)
}

const expiration = symbol => {
    const split = symbol.split('_')

    if (split.length == 2) return null

    const date = split[2]

    return moment(date, "YYMMDD")
}

const days = symbol => expiration(symbol).diff(moment(), 'days')

const run = () => {
    fetch({})
}

$(run)