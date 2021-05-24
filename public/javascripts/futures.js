import UIManager from './modules/UI/UIManager.js'
import UITableUtils from './modules/UI/UITableUtils.js'
import UITextUtils from './modules/UI/UITextUtils.js'
import UIUtils from './modules/UI/UIUtils.js'

import FuturesKraken from './modules/Futures/FuturesKraken.js'

const UI = new UIManager("#spinner", "#error")
const futures = new FuturesKraken()
const table = '#table-futures'

const run = () => {
    UI.loading()

    UIUtils.hide(table)

    const done = data => {
        UI.ready()

        initializeTable(table, data)
        socket()
    }

    const fail = error => UI.error(error)

    futures.init(done, fail)
}

const socket = () => {
    const subscribed = symbol => {
        symbol = symbol.toLowerCase()

        const header = UITableUtils.headerList(table)

        const rowIndex = UITableUtils.findRowIndex(table, header.indexOf('symbol'), symbol)
        const nRow = rowIndex + 1

        // entire row color
        $(`${table} tr:nth-child(${nRow})`).removeClass('text-secondary')

        // status icon color
        const nColumn = header.indexOf('status') + 1
        const selector = `${table} tr:nth-child(${nRow}) td:nth-child(${nColumn}) i`
        $(selector).removeClass('text-danger').addClass('text-success')
    }

    const update = data => {
        const symbol = data['product_id'].toLowerCase()

        const perpetual = 'funding_rate' in data
        const fixed = !perpetual

        const header = UITableUtils.headerList(table)

        // update mark price
        const markPrice = data['markPrice']
        const markPriceString = numeral(markPrice).format('$0,0')
        const rowIndex = UITableUtils.findRowIndex(table, header.indexOf('symbol'), symbol)
        const columnIndex = header.indexOf('price')
        UITableUtils.updateValue(table, rowIndex, columnIndex, markPriceString, UITextUtils.blinkText)

        // fixed contract, update premium and annualized
        if (fixed) {
            const premium = data['premium']
            const annualized = premium / FuturesKraken.days(symbol) * 365
            const premiumString = numeral(premium / 100).format('0.0%')
            const annualizedString = numeral(annualized / 100).format('0.0%')

            UITableUtils.updateValue(table, rowIndex, header.indexOf('premium'), premiumString, UITextUtils.blinkText)
            UITableUtils.updateValue(table, rowIndex, header.indexOf('annualized'), annualizedString, UITextUtils.blinkText)
        }
    }

    futures.initSocket(subscribed, update)

    $('#socket').text(`futures.kraken.com WebSocket`)
}

const initializeTable = (table, data) => {
    const header = ['pair', 'pair_data', 'period', 'symbol', 'expiration', 'days', 'price', 'premium', 'annualized', 'status']
    UITableUtils.addHeader(table, header)

    const rows = []

    for (const pair in data['pairs']) {
        const pairSymbols = data['pairs'][pair]

        for (const period in pairSymbols) {
            const crypto = pair.substr(0, 3)
            const symbol = pairSymbols[period]

            const expiration = FuturesKraken.expiration(symbol)
            const expiration_string = expiration ? expiration.format("DD MMM 'YY") : '-'
            const days_string = expiration ? `${FuturesKraken.days(symbol)}d` : '-'

            const status = '<i class="status text-danger bi bi-circle-fill"></i>'
            const logo_pair = `<img class="logo" src="https://www.fundalytica.com/images/logos/crypto/${crypto}.svg" /> <span>${pair.toUpperCase()}</span>`

            const row = [logo_pair, pair, period, symbol, expiration_string, days_string, '-', '-', '-', status]
            rows.push(row)
        }
    }

    // sort
    const pairIndex = header.indexOf('pair_data')
    const pairOrder = ['xbtusd', 'ethusd']
    const symbolIndex = header.indexOf('symbol')
    rows.sort((a, b) => {
        if (pairOrder.indexOf(a[pairIndex]) == pairOrder.indexOf(b[pairIndex])) {
            return b[symbolIndex].localeCompare(a[symbolIndex])
        }
        else {
            return pairOrder.indexOf(a[0]) - pairOrder.indexOf(b[0])
        }
    })

    // add rows
    for (const row of rows) {
        UITableUtils.addRow(table, row)
    }

    // hide columns
    const hide = ['symbol', 'pair_data']
    UITableUtils.hideColumns(table, header, hide)

    // makes table responsive
    UITableUtils.addDataTitle(table, header)

    // fade out text
    $(`${table} tbody tr`).addClass('text-secondary')

    // align
    $('td').addClass('align-middle')

    UIUtils.show(table)
}

$(run)