import Chart from './modules/Chart.js'

import UIManager from './modules/UI/UIManager.js'
import UIUtils from './modules/UI/UIUtils.js'
import UITextUtils from './modules/UI/UITextUtils.js'

import Utils from './modules/Utils.js'
import StringUtils from './modules/StringUtils.js'

const chart = new Chart('chart')
const UI = new UIManager('#spinner', '#error')

const run = () => {
    const options = { symbol: 'SNAP', minimumDip: 5, defaultDip: 10 }
    const url = `https://api.fundalytica.com/v1/historical/dip/${options.symbol}-${options.minimumDip}`

    UI.loading()
    UITextUtils.text('#title', `${options.symbol} - Dips`)
    UITextUtils.text('#subtitle', `-${options.defaultDip}% or worse`)

    const fail = error => UI.error(error)
    const done = data => {
        UI.ready()

        if (data.error) {
            UITextUtils.text('#error', `${options.symbol} market data is currently not available`)
            UIUtils.show('#error')
        }
        else {
            UITextUtils.text('#dates', StringUtils.range(data.dates.from, data.dates.to, "D MMM 'YY"))

            // chart.addSeries(data.all.close)
            chart.addATHSeries(data.ath.close)
            chart.addDipSeries(data.dip.close, data.dip.dip)
            chart.show()

            const sliderInputChanged = event => {
                const value = event.target.value
                const percentage = -(value / 100)
                UITextUtils.text('#subtitle', `-${value}% or worse`)
                chart.updateDipPercentage(data.dip.close, data.dip.dip, percentage)
            }

            document.querySelector('#slider').value = options.defaultDip
            UIUtils.addListener('#slider', "change", sliderInputChanged)

            UIUtils.show("#slider")
        }
    }

    Utils.request(url, null, done, fail)
}

UIUtils.ready(run)