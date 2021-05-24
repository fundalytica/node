import Chart from './modules/Chart.js'
import ChartStrings from './modules/ChartStrings.js'

import StringUtils from './modules/StringUtils.js'

const chart = new Chart('chart', { legend: false }, 'ath')

const UILoading = options => {
    $("#symbol-form").addClass('d-none')

    $('#title').text(`${options.symbol} - All Time Highs`)
    $('#dates').text('')

    chart.show(false)

    $('#toggle').addClass('d-none')
    $('#table').addClass('d-none')
    $("#table tbody").empty()

    $('#error').text('')

    $("#spinner").removeClass('d-none')
}

const UISuccess = (options, data) => {
    $("#spinner").addClass('d-none')

    $("#symbol-form").removeClass('d-none')
    $('#symbol').val('')

    if (data.error) {
        $('#title').text('')
        $('#error').text(`${options.symbol} market data is currently not available`)

        $('#symbol').focus()
    }
    else {
        $('#dates').text(StringUtils.range(data.dates.from, data.dates.to, "D MMM 'YY"))

        chart.addATHSeries(data.ath.close, true)
        chart.show()

        updateTable(data.ath.close)
        $('#table').removeClass('d-none')
        $('#toggle').removeClass('d-none')
    }
}

const updateTable = close => {
    const timestampKeys = Object.keys(close).sort().reverse()

    for (const index in timestampKeys) {
        const timestamp = timestampKeys[index]
        const date = moment.unix(timestamp / 1000)
        const price = close[timestamp]

        let row = '<tr>'

        row += `<td data-title="Date">${date.format("MMM D, YYYY")}</td>`
        row += `<td data-title="Price">${numeral(price).format('0,0.00')}</td>`
        row += `<td data-title="Change">${ChartStrings.priceChangeString(close, timestamp)}</td>`
        row += `<td data-title="After">${ChartStrings.afterDaysString(close, timestamp)}</td>`
        row += '</tr>'

        $('#table > tbody:last-child').append(row)
    }

    const pointsString = numeral(Object.keys(close).length).format('0,0')
    $("#points").text(`${pointsString} ATH days`)
}

const fetch = options => {
    UILoading(options)

    $.ajax({
        url: `https://api.fundalytica.com/v1/historical/dip/${options.symbol}-${options.minimumDip}`,
        success: data => UISuccess(options, data)
    })
}

const run = () => {
    const defaultSymbol = 'TSLA'
    fetch({ symbol: defaultSymbol, minimumDip: 5 })

    $('#symbol-form').submit(event => {
        event.preventDefault()
        const symbol = $('#symbol').val().toUpperCase()
        $(fetch({ symbol: symbol, minimumDip: 5 }))
    })
}

$(run)