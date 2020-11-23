const script_tag = document.getElementById('dipjs')

const fetch = symbol => {
    $.ajax({
        url: `https://api.fundalytica.com/v1/historical/${symbol}`,
        success: result => {
            const property = 'Close'
            const data = Object.keys(result).map(key => [parseInt(key), result[key][property]])
            chart.addSeries({data: data})

            chart.setTitle( { text: symbol } )
        }
    })
}

const defaultSymbol = 'SNAP'
$(fetch(defaultSymbol))

const options = {
    chart: {
        backgroundColor: null,
        animation: false
    },

    rangeSelector : { enabled: false },
    scrollbar: { enabled: false },
    navigator: { enabled: false },

    title: { text: null },

    legend: { enabled: false },

    credits: { enabled: false },

    xAxis: { type: 'datetime' },

    yAxis: {
        title: null,
        labels: { formatter: function () { return numeral(this.value).format('0,0') } }
        // opposite: false
    },

    plotOptions: {
        series: {
            color: '#3f51b5',
            marker: { lineWidth: 2, lineColor: '#555555', fillColor: '#FFFFFF' }
        }
    },

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