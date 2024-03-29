import ChartData from './ChartData.js'
import ChartStrings from './ChartStrings.js'

import UIUtils from './UI/UIUtils.js'

export default class Chart {
    constructor(id, options = null, tag = null) {
        this.id = id

        if (!options) options = { legend: true }

        // Highcharts.setOptions({ lang: { decimalPoint: '.', thousandsSep: ',' } })

        const chartOptions = {
            chart: { backgroundColor: null, pinchType: null },

            rangeSelector: { enabled: false },
            scrollbar: { enabled: false },
            navigator: { enabled: false },
            credits: { enabled: false },

            legend: { enabled: options.legend }
        }

        if (tag == 'ath') chartOptions.tooltip = this.athTooltip

        this.chart = Highcharts.stockChart(this.id, chartOptions)

        this.chartData = new ChartData()
    }

    get athTooltip() {
        return {
            formatter() {
                const header = `<span style="font-size: 10px">${Highcharts.dateFormat('%A, %b %e, %Y', new Date(parseInt(this.x)))}</span>`

                const data = this.points[0].series.data

                // { x: xval, y: yval } => { xval: yval }
                const dataObj = {}
                for (const index in data) {
                    const timestamp = data[index].x
                    const price = data[index].y
                    dataObj[timestamp] = price
                }

                const pointFunction = function (point) {
                    return `<b>${Highcharts.numberFormat(point.y, 2)}</b><br/>Change: ${ChartStrings.priceChangeString(dataObj, point.x)}<br/>After: ${ChartStrings.afterDaysString(dataObj, point.x)}`
                }

                const points = this.points ? this.points.map(pointFunction) : []
                return [header, points]
            }
        }
    }

    show(flag = true) {
        const selector = `#${this.id}`

        if (flag) {
            UIUtils.show(selector)
        }
        else {
            UIUtils.hide(selector)
        }
    }

    addSeries(closeData, replace = false) {
        const seriesId = 'all'
        if (replace && this.chart.get(seriesId)) this.chart.get(seriesId).remove()

        const marker = { radius: 4 }
        const states = { hover: { lineWidthPlus: 0 }, inactive: { opacity: 1 } }
        const tooltip = { valueDecimals: 2, pointFormat: '<b>{point.y}</b>' }

        const seriesOptions = { id: seriesId, name: 'price', color: '#3F51B5', lineWidth: 1, marker: marker, states: states, tooltip: tooltip }
        seriesOptions.data = this.chartData.dataToSeries(closeData)

        this.chart.addSeries(seriesOptions)
    }

    addATHSeries(ATHCloseData, replace = false) {
        const seriesId = 'ath'
        if (replace && this.chart.get(seriesId)) this.chart.get(seriesId).remove()

        const marker = { enabled: true, radius: 4, symbol: 'circle' }
        const states = { hover: { lineWidthPlus: 0 }, inactive: { opacity: 1 } }

        const tooltip = { valueDecimals: 2, pointFormat: '<b>{point.y}</b>' }

        const seriesOptions = { id: seriesId, name: 'all time high', color: '#43A047', lineWidth: 0, marker: marker, states: states, tooltip: tooltip }
        seriesOptions.data = this.chartData.dataToSeries(ATHCloseData)

        this.chart.addSeries(seriesOptions)
    }

    addDipSeries(dipCloseData, dipPercentageData, replace = false) {
        const seriesId = 'dip'
        if (replace && this.chart.get(seriesId)) this.chart.get(seriesId).remove()

        const marker = { enabled: true, radius: 4, symbol: 'circle' }
        const states = { hover: { lineWidthPlus: 0 }, inactive: { opacity: 1 } }
        const tooltip = { pointFormatter: function () { return `<b>${Highcharts.numberFormat(this.y, 2)}</b><br/>${Highcharts.numberFormat(dipPercentageData[this.x] * 100, 1)}%` } }

        const seriesOptions = { id: seriesId, name: 'dip', color: '#E53935', lineWidth: 0, marker: marker, states: states, tooltip: tooltip }
        seriesOptions.data = this.chartData.dataToSeries(dipCloseData)

        this.chart.addSeries(seriesOptions)
    }

    updateDipPercentage(dipCloseData, dipPercentageData, percentage) {
        dipCloseData = this.chartData.dipDataFilter(dipCloseData, dipPercentageData, percentage)
        this.addDipSeries(dipCloseData, dipPercentageData, true)
    }
}