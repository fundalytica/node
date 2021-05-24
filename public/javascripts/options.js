import UIManager from './modules/UI/UIManager.js'
import UITableUtils from './modules/UI/UITableUtils.js'
import UIUtils from './modules/UI/UIUtils.js'

import Utils from './modules/Utils.js'
import StringUtils from './modules/StringUtils.js'

import OptionsData from './modules/OptionsData.js'

const UI = new UIManager("#spinner", "#error")
const options = new OptionsData()

const date = '#date'
const tableOrdering = ['#dropdown-sort', '#btn-group-order']
const tables = ['#table-puts', '#table-calls']
const tablesAccessories = ['#toggle-puts', '#toggle-calls', '#info-puts', '#info-calls']

const currencyFormat = '$0,0'
const formats = { strike: '0,0.0', basis: currencyFormat, value: currencyFormat, profit: currencyFormat }

const run = () => {
    UI.loading()

    UIUtils.hide(date)
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
    let date = generated.split(',')[0]

    const days = moment().diff(moment(date), 'days')
    const css = days >= 7 ? 'text-danger' : 'text-secondary'
    $(date).addClass(css)

    date = moment(date).format('D MMM YYYY')
    $(date).text(`Last Update: ${date} (${days}d ago)`)

    UIUtils.show(date)
}

const updateDropdown = () => {
    $('#dropdown-sort').text(`Sorted by ${options.sort}`)

    UIUtils.populateDropdown('#dropdown-menu-sort', options.sortKeys)
    $('li > button.dropdown-item').addClass('btn-sm')

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
                        value = `<img onerror="this.src='${logoFile(option.symbol, 'png')}'" src="${logoFile(option.symbol)}" />`
                    }
                    // symbol
                    else if (key == 'symbol') {
                        value = `<a href='https://www.tradingview.com/symbols/${value}' target='_blank'>\$${value}</a>`
                    }
                    // expiration
                    else if (key == 'expiration') {
                        value = moment(value, 'DDMMMYY',).format("DD MMM 'YY")
                    }

                    // format
                    if (formats[key]) value = numeral(value).format(formats[key])

                    row.push(value)
                }

                UITableUtils.addRow(table, row)
                UITableUtils.addDataTitle(table, header)
            }

            // align
            $('td').addClass('align-middle')

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
    $(`#count-${right}`).text(`${positions.length} ${StringUtils.capitalize(right)}`)
    $(`#basis-${right}`).text(`Basis ${numeral(Utils.propertyTotal(positions, 'basis')).format(currencyFormat)}`)
    $(`#value-${right}`).text(`Value ${numeral(Utils.propertyTotal(positions, 'value')).format(currencyFormat)}`)
    $(`#profit-${right}`).text(`Profit ${numeral(Utils.propertyTotal(positions, 'profit')).format(currencyFormat)}`)
    $(`#assignment-${right}`).text(`Assignment ${numeral(OptionsData.assignmentTotal(positions)).format(currencyFormat)}`)
}

const registerClickEventSort = () => {
    const selector = ".dropdown-menu button"

    $(selector).off()

    $(selector).click(e => {
        options.sort = $(e.currentTarget).text()

        updateDropdown()
        updateTables(options.positions)
    })
}

const registerClickEventOrder = () => {
    const selector = "#btn-group-order .btn-check"

    $(selector).off()

    $(selector).click(e => {
        options.order = e.currentTarget.id.includes('asc') ? 'asc' : 'desc'

        updateTables(options.positions)
    })
}

$(run)