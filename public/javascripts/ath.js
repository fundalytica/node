import Chart from './modules/Chart.js'
import Strings from './modules/Strings.js'
import Utils from './modules/Utils.js'

const chart = new Chart('chart', { legend: false })
const strings = new Strings()

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

    if(data.error) {
        $('#title').text('')
        $('#error').text(`${options.symbol} market data is currently not available`)

        $('#symbol').focus()
    }
    else {
        $('#dates').text(strings.range(data.dates.from, data.dates.to))

        chart.addATHSeries(data.ath.close, true)
        chart.show()

        updateTable(data.ath.close)
        $('#table').removeClass('d-none')
        $('#toggle').removeClass('d-none')
    }
}

const updateTable = close => {
    close = Utils.reverse_object(close)

    for(const timestamp in close) {
        const price = close[timestamp]
        const date = moment.unix(timestamp / 1000)

        let row = '<tr>'

        row += `<td data-title="Date">${date.format("MMM D, YYYY")}</td>`
        row += `<td data-title="Price">${numeral(price).format('0,0.00')}</td>`

        let changeString = '-'
        let afterString = '-'
        const index = Object.keys(close).indexOf(timestamp)
        if(index < Object.keys(close).length - 1) {
            const previousTimestamp = Object.keys(close)[index + 1]
            const previousPrice = close[previousTimestamp]
            const percentage = (price / previousPrice) - 1
            const previousDate = moment.unix(previousTimestamp / 1000)
            changeString = numeral(percentage).format('%0,0.0')
            const diff = date.diff(previousDate)
            const days = moment.duration(diff).asDays()
            afterString = `${numeral(days).format(',')} ${days > 1 ? 'days' : 'day'}`
        }

        row += `<td data-title="Change">${changeString}</td>`
        row += `<td data-title="After">${afterString}</td>`
        row += '</tr>'

        $('#table > tbody:last-child').append(row)
    }

    const pointsString = numeral(Object.keys(close).length).format('0,0')
    $("#points").text(`${pointsString} data points`)
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