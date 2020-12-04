const script_tag = document.getElementById('dipjs')

let data

const fetch = (symbol, dip) => {
    const url = `https://api.fundalytica.com/v1/dip/${symbol}-${dip}`

    if(DEBUG) console.log(url)

    $('#title').text(`${symbol} Dips`)
    $('#subtitle').text(`-${dip}% or worse`)
    $("#spinner").removeClass('d-none')

    $.ajax({
        url: url,
        success: result => {
            if(DEBUG) console.log(result)

            $("#spinner").addClass('d-none')

            if(result.error) {
                $('#error').text(`${symbol} market data is not currently available`)
                return
            }

            data = result

            // dates
            const format = "D MMM 'YY"
            const fromDate = moment(data.dates.from)
            const toDate = moment(data.dates.to)
            const diff = toDate.diff(fromDate)
            const years = moment.duration(diff).asYears()
            $('#dates').text(`${fromDate.format(format)} to ${toDate.format(format)} (${years.toFixed(1)} Years)`)

            // [ [x,y], ..., [x,y] ]
            const dataToSeries = data => Object.keys(data).map(key => [parseInt(key), data[key]])

            // series options
            let seriesOptions, tooltip
            const states = { hover: { lineWidthPlus: 0 }, inactive: { opacity: 1 } }
            const markerRadius = 4
            const marker = { enabled: true, radius: markerRadius, symbol: 'circle' }

            // all ticks
            tooltip = { valueDecimals: 2, pointFormat: '<b>{point.y}</b>' }
            seriesOptions =  { id: 'all', name: 'price', color: '#3F51B5', lineWidth: 1, marker: { radius: markerRadius }, states: states, tooltip: tooltip }
            seriesOptions.data = dataToSeries(data.all.close)
            chart.addSeries(seriesOptions)

            // ath series
            tooltip = { valueDecimals: 2, pointFormat: '<b>{point.y}</b>' }
            seriesOptions =  { id: 'ath', name: 'all time high', color: '#43A047', lineWidth: 0, marker: marker, states: states, tooltip: tooltip }
            seriesOptions.data = dataToSeries(data.ath.close)
            chart.addSeries(seriesOptions)

            // dip series
            const addDipSeries = dipCloseData => {
                tooltip = { pointFormatter: function () { return `<b>${Highcharts.numberFormat(this.y, 2)}</b><br/>${Highcharts.numberFormat(data.dip.dip[this.x] * 100, 1)}%` }}
                seriesOptions =  { id: 'dip', name: 'dip', color: '#E53935', lineWidth: 0, marker: marker, states: states, tooltip: tooltip }
                seriesOptions.data = dataToSeries(dipCloseData)
                chart.addSeries(seriesOptions)
            }
            addDipSeries(data.dip.close)

            // chart.setTitle( { text: '', style: { color: '#B71C1C' } } )

            // show
            $("#slider").removeClass('d-none')
            $("#chart").removeClass('d-none')

            $('.slider').on("input change", (event) => {
                const value = event.target.value
                $('#subtitle').text(`-${value}% or worse`)

                const percentage = -(value / 100)
                const dip = {}
                dip.dip = Object.keys(data.dip.dip)
                    .filter(key => data.dip.dip[key] <= percentage )
                    .reduce((obj, key) => { obj[key] = data.dip.dip[key]; return obj }, {})
                dip.close = Object.keys(dip.dip)
                    .reduce((obj, key) => { obj[key] = data.dip.close[key]; return obj }, {})

                // console.log(percentage)
                // console.log(dip)
                // console.log(` length: ${Object.keys(dip.close).length} / ${Object.keys(dip.dip).length}`)

                chart.get('dip').remove()
                addDipSeries(dip.close)
            });
        }
    })
}

const DEBUG = true

const defaultSymbol = 'SPY'
const defaultDip = 5
$(fetch(defaultSymbol, defaultDip))

$('.slider').val(defaultDip)

Highcharts.setOptions({ lang: { decimalPoint: '.', thousandsSep: ',' } })

const chartOptions = {
    chart:          { backgroundColor: null, animation: false, pinchType: null },

    rangeSelector : { enabled: false },
    scrollbar:      { enabled: false },
    navigator:      { enabled: false },
    credits:        { enabled: false },
    title:          { text: null },

    legend:         { enabled: true },

    xAxis: {
        type: 'datetime'
    },

    yAxis: {
        title: null,
        opposite: true
    },

    // plotOptions: {
    //     series: {
    //     }
    // },

    // tooltip: {
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
    // }
}

const chart = Highcharts.chart('chart', chartOptions)