import Chart from './modules/Chart.js'
import ChartStrings from './modules/ChartStrings.js'

import UIManager from './modules/UI/UIManager.js'
import UIUtils from './modules/UI/UIUtils.js'
import UITableUtils from './modules/UI/UITableUtils.js'
import UITextUtils from './modules/UI/UITextUtils.js'

import Utils from './modules/Utils.js'
import StringUtils from './modules/StringUtils.js'

const UI = new UIManager('#spinner', '#error')
const chart = new Chart('chart', { legend: false }, 'ath')

const table = '#table'

const UILoading = options => {
    UI.loading()

    UIUtils.hide('#symbol-form')
    UIUtils.hide('#toggle')
    UIUtils.hide(table)

    UITextUtils.text('#title', `${options.symbol} - All Time Highs`)
    UITextUtils.text('#dates', '')

    chart.show(false)

    UIUtils.empty(`${table} tbody`)
}

const UISuccess = (options, data) => {
    UI.ready()

    UIUtils.show('#symbol-form')
    document.querySelector('#symbol-input').value = ''

    if (data.error) {
        UITextUtils.text('#title', '')
        UITextUtils.text('#error', `${options.symbol} market data is currently not available`)
        UIUtils.show('#error')

        document.querySelector('#symbol-input').focus()
    }
    else {
        UITextUtils.text('#dates', StringUtils.range(data.dates.from, data.dates.to, "D MMM 'YY"))

        chart.addATHSeries(data.ath.close, true)
        chart.show()

        updateTable(data.ath.close)

        UIUtils.show(table)
        UIUtils.show('#toggle')
    }
}

const updateTable = close => {
    const timestampKeys = Object.keys(close).sort().reverse()

    for (const index in timestampKeys) {
        const timestamp = timestampKeys[index]
        const date = moment.unix(timestamp / 1000)
        const price = close[timestamp]

        const values = []
        values.push(date.format("MMM D, YYYY"))
        values.push(numeral(price).format('0,0.00'))
        values.push(ChartStrings.priceChangeString(close, timestamp))
        values.push(ChartStrings.afterDaysString(close, timestamp))

        UITableUtils.addRow(table, values)
    }

    const header = UITableUtils.headerList(table)
    UITableUtils.addDataTitle(table, header)

    const pointsString = numeral(Object.keys(close).length).format('0,0')
    UITextUtils.text('#points', `${pointsString} ATH days`)
}

const fetch = options => {
    UILoading(options)

    const url = `https://api.fundalytica.com/v1/historical/dip/${options.symbol}-${options.minimumDip}`
    const done = data => UISuccess(options, data)
    const fail = error => UI.error(error)

    Utils.request(url, null, done, fail)
}

const run = () => {
    const defaultSymbol = 'TSLA'
    fetch({ symbol: defaultSymbol, minimumDip: 5 })

    const form = document.querySelector('#symbol-form')

    form.addEventListener('submit', event => {
        event.preventDefault()
        const input = document.querySelector('#symbol-input').value.toUpperCase()
        fetch({ symbol: input, minimumDip: 5 })
    })
}

UIUtils.ready(run)