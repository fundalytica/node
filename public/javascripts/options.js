import UIManager from './modules/UI/UIManager.js'
import UITableUtils from './modules/UI/UITableUtils.js'
import UITextUtils from './modules/UI/UITextUtils.js'
import UIUtils from './modules/UI/UIUtils.js'

import Utils from './modules/Utils.js'
import StringUtils from './modules/StringUtils.js'

import OptionsData from './modules/OptionsData.js'

const UI = new UIManager("#spinner", "#error")
const optionsData = new OptionsData(window.api_origin)

const dateSelector = '#date'
const tableOrdering = ['#dropdown-sort', '#btn-group-order']
const tables = ['#table-puts', '#table-calls']
const tablesAccessories = ['#toggle-puts', '#toggle-calls', '#info-puts', '#info-calls']

const currencyFormat = '$0,0'
const formats = { strike: '0,0.0', quantity: '0,0', basis: currencyFormat, value: currencyFormat, profit: currencyFormat }

const intervals = {}

const run = () => {
    UI.loading()

    UIUtils.hide(dateSelector)
    UIUtils.hide(tables.concat(tablesAccessories, tableOrdering))

    const done = () => {
        updateStocks(optionsData.stocks)
        updateDate(optionsData.generated)
        updateDropdown()
        updateTables(optionsData.options)
        registerClickEventOrder()

        UI.ready()
    }

    const fail = error => UI.error(error)

    optionsData.init(done, fail)
}

const updateDate = generated => {
    const date = generated.split(',')[0]
    const formattedDate = moment(date).format('D MMM YYYY')

    const days = moment().diff(moment(date), 'days')

    let text = `Imported Statement: Up to ${formattedDate} (${days}d ago)`
    if(days >= 7) text = `⚠️ ${text} ⚠️`

    UITextUtils.text(dateSelector, text)
    UIUtils.addClass(dateSelector, days >= 7 ? 'text-danger' : 'text-secondary')
    UIUtils.show(dateSelector)
}

const imageElement = symbol => {
    const logoFile = (symbol, extension = 'svg') => `/images/logos/stocks/${symbol.toLowerCase()}.${extension}`

    const img = document.createElement('img')
    img.setAttribute('onerror', `this.onerror=null;this.src="${logoFile(symbol, 'png')}";`)
    img.setAttribute('src', logoFile(symbol))
    img.setAttribute('alt', `${symbol} logo`)

    return img
}

const symbolElement = symbol => {
    const a = document.createElement('a')
    a.setAttribute('href', `https://www.tradingview.com/symbols/${symbol}`)
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener')
    a.innerText = `\$${symbol}`
    return a
}

const updateStocks = stocks => {
    if(! stocks.length) return

    const header = Object.keys(stocks[0])

    // add
    header.unshift('logo')
    header.push('average')
    header.push('calls')
    // header.push('puts')

    const table = '#table-stocks'
    UITableUtils.addHeader(table, header)

    const totalOptions = (options, symbol) => {
        options = options.filter(o => o.symbol == symbol)
        options = options.map(o => o.quantity)
        return options.reduce((acc, val) => acc + parseInt(val), 0)
    }

    const optionsString = count => {
        if(count == 0) return '-'
        if(count < 0) return `💣 ${-count}`
        return count
    }

    for (const stock of stocks) {
        const row = []
        for (const key of header) {
            let value = stock[key]

            if(key == 'logo') value = imageElement(stock.symbol)
            if(key == 'symbol') value = symbolElement(value)
            if(key == 'average') value = numeral(stock.basis / stock.quantity).format('$0,0.0')
            if(key == 'calls') value = optionsString(totalOptions(optionsData.calls, stock.symbol))
            if(key == 'puts') value = optionsString(totalOptions(optionsData.puts, stock.symbol))

            if (formats[key]) value = numeral(value).format(formats[key])

            row.push(value)
        }
        UITableUtils.addRow(table, row)
    }

    UITableUtils.addDataTitle(table, header)

    UIUtils.show('#stocks')
}

const updateDropdown = () => {
    UITextUtils.text('#dropdown-sort', `Sorted by ${optionsData.sort}`)

    UIUtils.populateDropdown('#dropdown-menu-sort', optionsData.sortKeys)
    UIUtils.addClass('.dropdown-menu > li > button', 'btn-sm')

    registerClickEventSort()
}

const updateTables = data => {
    // clear
    UITableUtils.clearTables(tables)

    // header
    const header = Object.keys(data[0])
    // console.log(header)
    // console.log(header.indexOf('expiration'))
    // console.log(header.indexOf('remaining'))

    // move remaining next to expiration
    const remainingIndex = header.indexOf('remaining')
    const expirationIndex = header.indexOf('expiration')
    header.splice(expirationIndex + 1, 0, header.splice(remainingIndex)[0])

    // add logo
    header.unshift('logo')

    for (const right of ['puts', 'calls']) {
        const options = (right == 'puts') ? optionsData.puts : optionsData.calls
        const count = options.length

        const table = `#table-${right}`

        // summary
        updateTableSummary(right, options)

        // header                UITableUtils.addRow(table, row, classes)

        UITableUtils.addHeader(table, header)

        if (count) {
            // rows
            for (const option of options) {
                const row = []

                for (const key of header) {
                    let value = option[key]

                    // logo
                    if (key == 'logo') {
                        value = imageElement(option.symbol)
                    }
                    // symbol
                    else if (key == 'symbol') {
                        value = symbolElement(value)
                    }
                    // expiration
                    else if (key == 'expiration') {
                        value = moment(value, 'DDMMMYY').format(optionsData.expirationDisplayFormat)
                    }
                    else if (key == 'remaining') {
                        // option has expired
                        if(option['remaining'] <= 0) {
                            value = 'expired'
                        }
                        else {
                            const localExpiration = moment().add(value, 's')
                            const localNow = moment()
                            const days = localExpiration.diff(localNow, 'days')

                            // if zero days, show hours and minutes
                            if(days > 0) {
                                value = `${days}d`
                            }
                            else {
                                const format = "H[h] m[m]" // "H[h] m[m] s[s]"
                                const time = moment(localExpiration.diff(localNow)).format(format)
                                value = `${time}`
                            }
                        }
                    }

                    // format
                    if (formats[key]) {
                        value = numeral(value).format(formats[key])
                    }

                    row.push(value)
                }

                let classes = []
                if(option['remaining'] < 0) {
                    classes = classes.concat(['text-danger'])
                }

                UITableUtils.addRow(table, row, classes)
                UITableUtils.addDataTitle(table, header)
            }

            // align
            UIUtils.addClass('td', 'align-middle')

            // hide columns
            const hide = ['right', 'price']
            UITableUtils.hideColumns(table, header, hide)
        }

        // visibility, tables & accessories
        const hide = (count == 0)
        UIUtils.hide(tables.filter(t => t.includes(right)), hide)
        UIUtils.hide(tablesAccessories.filter(t => t.includes(right)), hide)
    }

    // visibility, common ordering
    const hide = ! (optionsData.puts.length || optionsData.calls.length)
    UIUtils.hide(tableOrdering, hide)
}

const updateTableSummary = (right, options) => {
    UITextUtils.text(`#count-${right}`, `${options.length} ${StringUtils.capitalize(right)}`)
    UITextUtils.text(`#basis-${right}`, `Basis ${numeral(Utils.propertyTotal(options, 'basis')).format(currencyFormat)}`)
    UITextUtils.text(`#value-${right}`, `Value ${numeral(Utils.propertyTotal(options, 'value')).format(currencyFormat)}`)
    UITextUtils.text(`#profit-${right}`, `Profit ${numeral(Utils.propertyTotal(options, 'profit')).format(currencyFormat)}`)
    UITextUtils.text(`#assignment-${right}`, `Assignment ${numeral(OptionsData.assignmentTotal(options)).format(currencyFormat)}`)

    updateNearestExpiration(right, options)
}

const updateNearestExpiration = (right, options) => {
    const selector = `#expiration-${right}`
    UIUtils.hide(selector, (options.length == 0))

    if(options.length == 0) return

    const elementUpdate = () => {
        // nearest expiration
        const nearest = OptionsData.nearestExpiration(options)

        // difference from now
        const localExpiration = moment().add(nearest.remaining, 's')
        const localNow = moment()
        const diff = localExpiration.diff(localNow)
        // duration
        const duration = moment.duration(diff)

        // units
        const days = Math.floor(duration.asDays())
        const h = Math.floor(duration.asHours()) % 24
        const m = Math.floor(duration.asMinutes()) % 60
        const s = Math.floor(duration.asSeconds()) % 60

        // time
        const time = `${h}h ${m}m ${s}s`

        // symbols
        const symbols = nearest.symbols.join('•')

        UITextUtils.text(selector, `Next Expiration in ${days}d ${time} ${symbols}`)
    }
    elementUpdate()

    if (intervals[selector]) clearInterval(intervals[selector])
    intervals[selector] = setInterval(elementUpdate, 1000)
}

const registerClickEventSort = () => {
    const selector = ".dropdown-menu button"

    const handler = e => {
        optionsData.sort = e.currentTarget.innerText
        updateDropdown()
        updateTables(optionsData.options)
    }

    UIUtils.removeListener(selector, 'click', handler)
    UIUtils.addListener(selector, 'click', handler)
}

const registerClickEventOrder = () => {
    const selector = "#btn-group-order .btn-check"

    const handler = e => {
        optionsData.order = e.currentTarget.id.includes('asc') ? 'asc' : 'desc'
        updateTables(optionsData.options)
    }

    UIUtils.removeListener(selector, 'click', handler)
    UIUtils.addListener(selector, 'click', handler)
}

UIUtils.ready(run)

