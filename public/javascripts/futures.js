import UIManager from './modules/UI/UIManager.js'
import UITableUtils from './modules/UI/UITableUtils.js'
import UITextUtils from './modules/UI/UITextUtils.js'
import UIUtils from './modules/UI/UIUtils.js'

import FuturesKraken from './modules/Futures/FuturesKraken.js'

const UI = new UIManager("#spinner", "#error")
const futures = new FuturesKraken()
const table = '#table-futures'
const status = '#websocket-status'
let statusTimeout = null

let interval = null

const run = () => {
    UI.loading()

    UIUtils.hide(table)
    UIUtils.hide(status)

    const done = data => {
        UI.ready()

        initTable(table, data)
        socket()

        UIUtils.show(status)

        statusListener()
    }

    const fail = error => UI.error(error)

    futures.init(done, fail)
}

const statusListener = () => {
    // status listener
    UIUtils.addListener(`${status} button`, 'click', () => {
        clearTimeout(statusTimeout)

        const ul = document.querySelector(`${status} ul`)
        UIUtils.empty(`${status} ul`)

        futures.status().forEach(s => {
            const li = document.createElement('li')
            li.textContent = s
            ul.appendChild(li)
        })

        statusTimeout = setTimeout(() => UIUtils.empty(`${status} ul`), 5000)
    })
}

const socket = () => {
    const tickerSubscribed = data => {
        const symbol = data.product_ids[0].toLowerCase()

        const header = UITableUtils.headerList(table)

        const rowIndex = UITableUtils.findRowIndex(table, header.indexOf('symbol'), symbol)
        const nRow = rowIndex + 1

        // entire row color
        UIUtils.removeClass(`${table} tr:nth-child(${nRow})`, 'text-secondary')

        // status icon color
        const nColumn = header.indexOf('status') + 1
        const selector = `${table} tr:nth-child(${nRow}) td:nth-child(${nColumn}) svg`
        UIUtils.removeClass(selector, 'status-off')
        UIUtils.addClass(selector, 'status-on')
    }

    const tickerUpdated = data => {
        const symbol = data['product_id'].toLowerCase()

        const perpetual = 'funding_rate' in data
        const fixed = !perpetual

        // update mark price
        const markPrice = data['markPrice']
        const markPriceString = numeral(markPrice).format('$0,0')
        updateTableValue(table, symbol, 'price', markPriceString)

        // fixed contract, update premium and annualized
        if (fixed) {
            const premium = data['premium']
            const premiumString = numeral(premium / 100).format('0.0%')

            const days = FuturesKraken.daysUntilSettlement(symbol)
            const annualized = days ? premium / days * 365 : null
            const annualizedString = days ? numeral(annualized / 100).format('0.0%') : '-'

            updateTableValue(table, symbol, 'premium', premiumString)
            updateTableValue(table, symbol, 'annualized', annualizedString)

            // bold annualized
            if(data.tag == 'semiannual') {
                const properties = ['pair', 'period', 'annualized']
                const header = UITableUtils.headerList(table)
                properties.forEach(p => {
                    const rowIndex = UITableUtils.findRowIndex(table, header.indexOf('symbol'), symbol)
                    const columnIndex = header.indexOf(p)
                    const selector = `${table} > tbody > tr:nth-child(${rowIndex + 1}) > td:nth-child(${columnIndex + 1})`
                    const elements = document.querySelectorAll(selector)
                    elements.forEach(el => {
                        // const pct = parseFloat(el.textContent)
                        el.classList.add('fw-bolder')
                    })
                })
            }
        }
    }

    const bookSnapshot = data => {
        const symbol = data['product_id'].toLowerCase()
        // console.log(`book_snapshot - symbol: ${symbol} spread: ${data.spread.pct}%`)
        updateTableValue(table, symbol, 'spread', `${data.spread.pct}%`)
    }

    const ticker_feed = 'ticker'
    const book_feed = 'book_snapshot'
    document.addEventListener('subscribed', e => { if(e.data.feed == ticker_feed) { tickerSubscribed(e.data) } })
    document.addEventListener(ticker_feed, e => { tickerUpdated(e.data) })
    document.addEventListener(book_feed, e => { bookSnapshot(e.data) })

    futures.initTickerSocket()
    futures.initBookSocket()

    // UITextUtils.text('#socket', 'futures.kraken.com WebSocket')

    const settlementUpdate = () => UITextUtils.text('#settlement', `Next settlement in ${futures.nextSettlementDays()}d ${FuturesKraken.timeUntilSettlement()}`)
    settlementUpdate()
    if (interval) clearInterval(interval)
    interval = setInterval(settlementUpdate, 1000)
}

const updateTableValue = (table, symbol, property, value) => {
    const header = UITableUtils.headerList(table)
    const rowIndex = UITableUtils.findRowIndex(table, header.indexOf('symbol'), symbol)
    const columnIndex = header.indexOf(property)
    UITableUtils.updateValue(table, rowIndex, columnIndex, value, UITextUtils.blinkText)
}

const initTable = (table, data) => {
    const header = ['pair', 'pair_data', 'period', 'symbol', 'price', 'premium', 'annualized', 'spread', 'maturity', 'days', 'status']
    UITableUtils.addHeader(table, header)

    const rows = []

    for (const pair in data['pairs']) {
        const pairSymbols = data['pairs'][pair]

        for (const period in pairSymbols) {
            const crypto = pair.substr(0, 3)
            const symbol = pairSymbols[period]

            const maturity = FuturesKraken.maturity(symbol)
            const maturity_string = maturity ? maturity.format("DD MMM 'YY") : '-'
            const days_string = maturity ? `${FuturesKraken.daysUntilSettlement(symbol)}d` : '-'

            const status = '<svg viewBox="0 0 20 20" class="status status-off"><circle cx="10" cy="10" r="10"/></svg>'
            const logo_pair = `<img class= "logo" src = "https://www.fundalytica.com/images/logos/crypto/${crypto}.svg" alt = "${crypto} logo" /> <span>${pair.toUpperCase()}</span>`

            const row = [logo_pair, pair, period, symbol, '-', '-', '-', '-', maturity_string, days_string, status]
            // console.table(row)
            // console.trace()

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
    UIUtils.addClass(`${table} tbody tr`, 'text-secondary')

    UIUtils.show(table)
}

UIUtils.ready(run)