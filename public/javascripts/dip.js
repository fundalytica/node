const script_tag = document.getElementById('dipjs')

// TODO: stock and dip selection on page
// TODO: show more info in tooltip, all time high after X days, dip % from ath
// TODO: text summary under chart

// TODO: current price add

// TODO: data management, updates, cron
// TODO: data management, data unavailable
// TODO: data management, caching
// TODO: data management, IEX . . . 15Y max

const fetch = (symbol, dip) => {
    // const url = `https://api.fundalytica.com/v1/historical/${symbol}`
    const url = `https://api.fundalytica.com/v1/dip/${symbol}-${dip}`

    if(DEBUG) console.log(url)

    // $('#symbol').text(symbol)

    $.ajax({
        url: url,
        success: result => {
            if(DEBUG) console.log(result)

            // `https://api.fundalytica.com/v1/historical/${symbol}`
            // const data = Object.keys(result).map(key => [parseInt(key), result[key]['Close']])

            // [ [x,y], ..., [x,y] ]
            const dataToSeries = data => Object.keys(data).map(key => [parseInt(key), data[key]])

            let options =  {}

            // options = { color: '#3F51B5', marker: { lineColor: '#555555', fillColor: '#FFFFFF' } }
            // options.data = dataToSeries(result.all.close)
            // chart.addSeries(options)

            options =  { name: 'all time high', color: '#43A047', marker: { enabled: true, radius: 4, symbol: 'circle' }, lineWidth: 0, states: { hover: { lineWidthPlus: 0 } } }
            options.data = dataToSeries(result.ath.close)
            chart.addSeries(options)

            options =  { name: `dip from all time high`, color: '#E53935', marker: { enabled: true, radius: 4, symbol: 'circle' }, lineWidth: 0, states: { hover: { lineWidthPlus: 0 } } }
            options.data = dataToSeries(result.dip.close)
            chart.addSeries(options)

            chart.setTitle( { text: `$${symbol} Dips ( ${dip}% or worse )`, style: { color: '#B71C1C' } } )
        }
    })
}

// $('#fetch').click(fetch('SPY'))

const DEBUG = true

const defaultSymbol = 'SNAP'
const defaultDip = 70
$(fetch(defaultSymbol, defaultDip))

// $('.nav-link').click(e => fetch(e.target.id))

const options = {
    chart: {
        backgroundColor: null,
        animation: false
    },

    rangeSelector : { enabled: false },
    scrollbar: { enabled: false },
    navigator: { enabled: false },

    title: { text: null },

    legend: { enabled: true },

    credits: { enabled: false },

    xAxis: { type: 'datetime' },

    yAxis: {
        title: null,
        labels: { formatter: function () { return numeral(this.value).format('0,0') } }
        // opposite: false
    },

    // plotOptions: {
    //     series: {
    //     }
    // },

    tooltip: {
        borderColor: '#000000',
        valueDecimals: 2,
        pointFormat: '<b>{point.y}</b>'
        // headerFormat: 'point.x',
        // pointFormat + headerFormat
        // formatter: function () {
        //     const header = `<span style="font-size: 10px">${Highcharts.dateFormat('%A, %b %d, %Y', new Date(parseInt(this.x)))}</span>`
        //     const points = this.points ? this.points.map(function (point) { return `<b>${numeral(point.y).format('0,0.00')}</b>` }) : []
        //     return [header, points]
        // }
    }
}

const chart = Highcharts.stockChart('chart', options)