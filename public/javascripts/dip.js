const script_tag = document.getElementById('dipjs')

let data = null

const fetch = (symbol, dip) => {
    const url = `https://api.fundalytica.com/v1/dip/${symbol}-${dip}`

    if(DEBUG) console.log(url)

    $('#title').text(`$${symbol} Dips`)
    $('#subtitle').text(`-${dip}% or worse`)
    $.ajax({
        url: url,
        success: result => {
            if(DEBUG) console.log(result)

            data = result

            // [ [x,y], ..., [x,y] ]
            const dataToSeries = data => Object.keys(data).map(key => [parseInt(key), data[key]])

            // series options
            let seriesOptions, tooltip
            const states = { hover: { lineWidthPlus: 0 } }
            const marker = { enabled: true, radius: 4, symbol: 'circle' }

            // all ticks, if available from py-dip
            // seriesOptions = { color: '#3F51B5', marker: { lineColor: '#555555', fillColor: '#FFFFFF' } }
            // seriesOptions.data = dataToSeries(result.all.close)
            // chart.addSeries(seriesOptions)

            // ath series
            tooltip = { valueDecimals: 2, pointFormat: '<b>{point.y}</b>' }
            seriesOptions =  { name: 'all time high', color: '#43A047', lineWidth: 0, marker: marker, states: states, tooltip: tooltip }
            seriesOptions.data = dataToSeries(result.ath.close)
            chart.addSeries(seriesOptions)

            // dip series
            tooltip = { pointFormatter: function () { return `<b>${Highcharts.numberFormat(this.y, 2)}</b><br/>${Highcharts.numberFormat(data.dip.dip[this.x] * 100, 1)}%` }}
            seriesOptions =  { name: `dip from all time high`, color: '#E53935', lineWidth: 0, marker: marker, states: states, tooltip: tooltip }
            seriesOptions.data = dataToSeries(result.dip.close)
            chart.addSeries(seriesOptions)

            // chart.setTitle( { text: '', style: { color: '#B71C1C' } } )

            $('.slider').change(event => {
                const value = event.target.value
                $('#subtitle').text(`-${value}% or worse`)
            });
        }
    })
}

const DEBUG = true

const defaultSymbol = 'SNAP'
const defaultDip = 5
$(fetch(defaultSymbol, defaultDip))

$('.slider').val(defaultDip)

Highcharts.setOptions({
    lang: {
        decimalPoint: '.',
        thousandsSep: ','
    }
})

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

    xAxis: {
        type: 'datetime'
    },

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
        /*
        header: xDateFormat
        */
        // xDateFormat: '%A, %b %e, %Y',

        /*
        header: headerFormat
        */
        // headerFormat: '<span style="font-size: 10px">{point.key}</span>',

        /*
        point: valueDecimals + pointFormat
        */
        // valueDecimals: 2,
        // pointFormat: '<b>{point.y}</b>',

        /*
        point: pointFormatter
        */
        // pointFormatter: function () { return `<b>${numeral(this.y).format('0,0.00')}</b>` },
        // pointFormatter: function () {
        //     const close = numeral(this.y).format('0,0.00')
        //     const dip = numeral(data.dip.dip[this.x]).format('%0,0.0')
        //     return `<b>${close}</b><br/>${dip}`
        // },

        /*
        header + point: formatter
        */
        // formatter: function () {
        //     const header = `<span style="font-size: 10px">${Highcharts.dateFormat('%A, %b %e, %Y', new Date(parseInt(this.x)))}</span>`
        //     const pointFunction = function (point) {
        //         const close = numeral(point.y).format('0,0.00')
        //         const dip = numeral(data.dip.dip[point.x]).format('%0,0.0')
        //         return `<b>${close}</b><br/>${dip}`
        //     }
        //     const points = this.points ? this.points.map(pointFunction) : []
        //     return [header, points]
        // }
    }
}

const chart = Highcharts.stockChart('chart', chartOptions)