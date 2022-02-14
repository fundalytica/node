import Chart from './modules/Chart.js'

import UIManager from './modules/UI/UIManager.js'
import UIUtils from './modules/UI/UIUtils.js'
import UITextUtils from './modules/UI/UITextUtils.js'

import Utils from './modules/Utils.js'
import StringUtils from './modules/StringUtils.js'

const chart = new Chart('chart')
const UI = new UIManager('#spinner', '#error')

const run = () => {
    fetch({ symbol: 'SNAP', dip: 10 })

    const form = document.querySelector('#symbol-form')

    form.addEventListener('submit', event => {
        event.preventDefault()
        const symbol = document.querySelector('#symbol-input').value.toUpperCase()
        const dip = document.querySelector('#slider').value
        fetch({ symbol: symbol, dip: dip })
    })
}

const fetch = options => {
    const minimumDip = 5
    const url = `${window.api_origin}/v1/historical/dip/${options.symbol}-${minimumDip}`
    console.log(url)

    UI.loading()
    chart.show(false)
    UIUtils.hide('#symbol-form')
    UIUtils.hide('#slider')
    UIUtils.hide('#dates')

    UITextUtils.text('#title', `${options.symbol} - Dips`)
    UITextUtils.text('#subtitle', `-${options.dip}% or worse`)

    const fail = error => UI.error(error)
    const done = data => {
        UI.ready()

        if (data.error) {
            UITextUtils.text('#error', `${options.symbol} market data is currently not available`)
            UIUtils.show('#error')

            UIUtils.hide('#title')
            UIUtils.hide('#subtitle')

            UIUtils.show('#symbol-form')
        }
        else {
            UITextUtils.text('#dates', StringUtils.range(data.dates.from, data.dates.to, "D MMM 'YY"))

            chart.addATHSeries(data.ath.close, true)
            const dip = -(document.querySelector('#slider').value / 100)
            chart.addDipSeries(data.dip.close, data.dip.dip, true)
            chart.updateDipPercentage(data.dip.close, data.dip.dip, dip)
            chart.show()

            const sliderInputChanged = event => {
                const value = event.target.value
                UITextUtils.text('#subtitle', `-${value}% or worse`)

                const dip = -(value / 100)
                console.log(dip)

                chart.updateDipPercentage(data.dip.close, data.dip.dip, dip)
            }

            document.querySelector('#slider').value = options.dip
            UIUtils.addListener('#slider', "change", sliderInputChanged)

            UIUtils.show('#symbol-form')
            UIUtils.show("#slider")
            UIUtils.show("#dates")

            UIUtils.show('#title')
            UIUtils.show('#subtitle')
        }
    }

    Utils.request(url, null, done, fail)
}

UIUtils.ready(run)