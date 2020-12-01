const script_tag = document.getElementById('dipjs')

const fetch = (symbol, dip) => {
    const url = `https://api.fundalytica.com/v1/dip/${symbol}-${dip}`

    if(DEBUG) console.log(url)

    $.ajax({
        url: url,
        success: result => {
            if(DEBUG) console.log(result)

            // [ [x,y], ..., [x,y] ]
            const dataToSeries = data => Object.keys(data).map(key => [parseInt(key), data[key]])

            let seriesOptions =  {}

            // seriesOptions = { color: '#3F51B5', marker: { lineColor: '#555555', fillColor: '#FFFFFF' } }
            // seriesOptions.data = dataToSeries(result.all.close)
            // chart.addSeries(seriesOptions)

            const marker = { enabled: true, radius: 4, symbol: 'circle' }
            const states = { hover: { lineWidthPlus: 0 } }

            seriesOptions =  { name: 'all time high', color: '#43A047', marker: marker, lineWidth: 0, states: states }
            seriesOptions.data = dataToSeries(result.ath.close)
            chart.addSeries(seriesOptions)

            seriesOptions =  { name: `dip from all time high`, color: '#E53935', marker: marker, lineWidth: 0, states: states }
            seriesOptions.data = dataToSeries(result.dip.close)
            chart.addSeries(seriesOptions)

            chart.setTitle( { text: `$${symbol} Dips ( ${dip}% or worse )`, style: { color: '#B71C1C' } } )
        }
    })
}

const DEBUG = true

const defaultSymbol = 'SNAP'
const defaultDip = 70
$(fetch(defaultSymbol, defaultDip))

const chartOptions = {
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

const chart = Highcharts.stockChart('chart', chartOptions)