import UIManager from './modules/UI/UIManager.js'
import UITableUtils from './modules/UI/UITableUtils.js'
import UITextUtils from './modules/UI/UITextUtils.js'
import UIUtils from './modules/UI/UIUtils.js'

import Utils from './modules/Utils.js'
import StringUtils from './modules/StringUtils.js'

import OptionsData from './modules/OptionsData.js'

const UI = new UIManager("#spinner", "#error")
const options = new OptionsData(window.api_origin)

const dateSelector = '#date'
const tableOrdering = ['#dropdown-sort', '#btn-group-order']
const tables = ['#table-puts', '#table-calls']
const tablesAccessories = ['#toggle-puts', '#toggle-calls', '#info-puts', '#info-calls']

const currencyFormat = '$0,0'
const formats = { strike: '0,0.0', basis: currencyFormat, value: currencyFormat, profit: currencyFormat }

const intervals = {}

const run = () => {
    UI.loading()

    UIUtils.hide(dateSelector)
    UIUtils.hide(tables.concat(tablesAccessories, tableOrdering))

    const done = () => {
        updateDate(options.generated)
        updateDropdown()
        updateTables(options.positions)
        registerClickEventOrder()

        UI.ready()
    }

    const fail = error => UI.error(error)

    options.init(done, fail)
}

const updateDate = generated => {
    const date = generated.split(',')[0]
    const formattedDate = moment(date).format('D MMM YYYY')

    const days = moment().diff(moment(date), 'days')
    const className = days >= 7 ? 'text-danger' : 'text-secondary'

    UITextUtils.text(dateSelector, `Last Update: ${formattedDate} (${days}d ago)`)
    UIUtils.addClass(dateSelector, className)
    UIUtils.show(dateSelector)
}

const updateDropdown = () => {
    UITextUtils.text('#dropdown-sort', `Sorted by ${options.sort}`)

    UIUtils.populateDropdown('#dropdown-menu-sort', options.sortKeys)
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
        const positions = (right == 'puts') ? options.puts(data) : options.calls(data)
        const count = positions.length

        const table = `#table-${right}`

        // summary
        updateTableSummary(right, positions)

        // header
        UITableUtils.addHeader(table, header)

        if (count) {
            // rows
            for (const option of positions) {
                const row = []

                for (const key of header) {
                    let value = option[key]

                    // logo
                    if (key == 'logo') {
                        const logoFile = (symbol, extension = 'svg') => `/images/logos/stocks/${symbol.toLowerCase()}.${extension}`

                        const img = document.createElement('img')
                        img.setAttribute('onerror', `this.onerror=null;this.src="${logoFile(option.symbol, 'png')}";`)
                        img.setAttribute('src', logoFile(option.symbol))
                        img.setAttribute('alt', `${option.symbol} logo`)
                        value = img
                    }
                    // symbol
                    else if (key == 'symbol') {
                        const a = document.createElement('a')
                        a.setAttribute('href', 'https://www.tradingview.com/symbols/${value}')
                        a.setAttribute('target', '_blank')
                        a.setAttribute('rel', 'noopener')
                        a.innerText = `\$${value}`
                        value = a
                    }
                    // expiration
                    else if (key == 'expiration') {
                        value = moment(value, 'DDMMMYY').format(options.expirationDisplayFormat)
                    }
                    else if (key == 'remaining') {
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

                    // format
                    if (formats[key]) {
                        value = numeral(value).format(formats[key])
                    }

                    row.push(value)
                }

                UITableUtils.addRow(table, row)
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
    const hide = ! (options.puts(data).length || options.calls(data).length)
    UIUtils.hide(tableOrdering, hide)
}

const updateTableSummary = (right, positions) => {
    UITextUtils.text(`#count-${right}`, `${positions.length} ${StringUtils.capitalize(right)}`)
    UITextUtils.text(`#basis-${right}`, `Basis ${numeral(Utils.propertyTotal(positions, 'basis')).format(currencyFormat)}`)
    UITextUtils.text(`#value-${right}`, `Value ${numeral(Utils.propertyTotal(positions, 'value')).format(currencyFormat)}`)
    UITextUtils.text(`#profit-${right}`, `Profit ${numeral(Utils.propertyTotal(positions, 'profit')).format(currencyFormat)}`)
    UITextUtils.text(`#assignment-${right}`, `Assignment ${numeral(OptionsData.assignmentTotal(positions)).format(currencyFormat)}`)

    updateNearestExpiration(right, positions)
}

const updateNearestExpiration = (right, positions) => {
    const selector = `#expiration-${right}`
    UIUtils.hide(selector, (positions.length == 0))

    if(positions.length == 0) return

    const elementUpdate = () => {
        // nearest expiration
        const nearest = OptionsData.nearestExpiration(positions)
        // days
        const localExpiration = moment().add(nearest.remaining, 's')
        const localNow = moment()
        const days = localExpiration.diff(localNow, 'days')
        // time
        const format = "H[h] m[m] s[s]"
        const time = moment(localExpiration.diff(localNow)).format(format)
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
        options.sort = e.currentTarget.innerText
        updateDropdown()
        updateTables(options.positions)
    }

    UIUtils.removeListener(selector, 'click', handler)
    UIUtils.addListener(selector, 'click', handler)
}

const registerClickEventOrder = () => {
    const selector = "#btn-group-order .btn-check"

    const handler = e => {
        options.order = e.currentTarget.id.includes('asc') ? 'asc' : 'desc'
        updateTables(options.positions)
    }

    UIUtils.removeListener(selector, 'click', handler)
    UIUtils.addListener(selector, 'click', handler)
}

UIUtils.ready(run)

