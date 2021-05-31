import UIManager from './modules/UI/UIManager.js'
import UITableUtils from './modules/UI/UITableUtils.js'
import UITextUtils from './modules/UI/UITextUtils.js'
import UIUtils from './modules/UI/UIUtils.js'

import Utils from './modules/Utils.js'
import StringUtils from './modules/StringUtils.js'

import OptionsData from './modules/OptionsData.js'

const UI = new UIManager("#spinner", "#error")
const options = new OptionsData()

const dateSelector = '#date'
const tableOrdering = ['#dropdown-sort', '#btn-group-order']
const tables = ['#table-puts', '#table-calls']
const tablesAccessories = ['#toggle-puts', '#toggle-calls', '#info-puts', '#info-calls']

const currencyFormat = '$0,0'
const formats = { strike: '0,0.0', basis: currencyFormat, value: currencyFormat, profit: currencyFormat }

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
    UIUtils.addClass('.dropdown-menu > li > button', 'dropdown-item')
    UIUtils.addClass('.dropdown-menu > li > button', 'btn-sm')

    registerClickEventSort()
}

const updateTables = data => {
    // clear
    UITableUtils.clearTables(tables)

    // header
    const header = Object.keys(data[0])
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
                        const logoFile = (symbol, extension = 'svg') => `https://www.fundalytica.com/images/logos/stocks/${symbol.toLowerCase()}.${extension}`
                        value = `<img onerror="this.src='${logoFile(option.symbol, 'png')}'" src="${logoFile(option.symbol)}" alt="${option.symbol} logo"/>`
                    }
                    // symbol
                    else if (key == 'symbol') {
                        value = `<a href='https://www.tradingview.com/symbols/${value}' target='_blank' rel='noopener'>\$${value}</a>`
                    }
                    // expiration
                    else if (key == 'expiration') {
                        value = moment(value, 'DDMMMYY',).format(options.expirationDisplayFormat)
                    }

                    // format
                    if (formats[key]) value = numeral(value).format(formats[key])

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
    const hide = !(options.puts(data).length || options.calls(data).length)
    UIUtils.hide(tableOrdering, hide)
}

const updateTableSummary = (right, positions) => {

    UITextUtils.text(`#count-${right}`, `${positions.length} ${StringUtils.capitalize(right)}`)
    UITextUtils.text(`#basis-${right}`, `Basis ${numeral(Utils.propertyTotal(positions, 'basis')).format(currencyFormat)}`)
    UITextUtils.text(`#value-${right}`, `Value ${numeral(Utils.propertyTotal(positions, 'value')).format(currencyFormat)}`)
    UITextUtils.text(`#profit-${right}`, `Profit ${numeral(Utils.propertyTotal(positions, 'profit')).format(currencyFormat)}`)
    UITextUtils.text(`#assignment-${right}`, `Assignment ${numeral(OptionsData.assignmentTotal(positions)).format(currencyFormat)}`)
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