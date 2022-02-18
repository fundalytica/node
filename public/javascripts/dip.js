import Chart from './modules/Chart.js'

import UIManager from './modules/UI/UIManager.js'
import UIUtils from './modules/UI/UIUtils.js'
import UITextUtils from './modules/UI/UITextUtils.js'

import Utils from './modules/Utils.js'
import StringUtils from './modules/StringUtils.js'

const chart = new Chart('chart')
const UI = new UIManager('#spinner', '#error')

let symbol = 'SNAP'
let dip = 10

let data = {}

const run = () => {
    if(window.p1) symbol = p1

    if(window.p2) dip = p2

    document.querySelector('#slider').value = dip

    fetch()

    const form = document.querySelector('#symbol-form')

    form.addEventListener('submit', event => {
        event.preventDefault()

        symbol = document.querySelector('#symbol-input').value.toUpperCase()
        dip = document.querySelector('#slider').value

        fetch()
    })

    UIUtils.addListener('#slider', 'change', event => {
        dip = event.target.value

        UITextUtils.text('#subtitle', `-${dip}% or worse`)

        updateURL()

        chart.updateDipPercentage(data.dip.close, data.dip.dip, -(dip / 100))
    })
}

const updateURL = () => window.history.pushState({}, '', `/dip/${symbol}/${dip}`)

const fetch = () => {
    updateURL()

    const url = `${window.api_origin}/v1/historical/dip/${symbol}-${5}` // -5% will fetch most dip data points, then we filter
    console.log(url)

    UI.loading()
    chart.show(false)
    UIUtils.hide('#symbol-form')
    UIUtils.hide('#slider')
    UIUtils.hide('#dates')

    document.querySelector('#symbol-input').value = ''

    UITextUtils.text('#title', `${symbol} - Dips`)
    UITextUtils.text('#subtitle', `-${dip}% or worse`)

    const fail = error => UI.error(error)
    const done = d => {
        data = d

        UI.ready()

        if (data.error) {
            UITextUtils.text('#error', `${symbol} market data is currently not available`)
            UIUtils.show('#error')

            UIUtils.hide('#title')
            UIUtils.hide('#subtitle')

            UIUtils.show('#symbol-form')
        }
        else {
            UITextUtils.text('#dates', StringUtils.range(data.dates.from, data.dates.to, "D MMM 'YY"))

            dip = document.querySelector('#slider').value

            chart.addATHSeries(data.ath.close, true)
            chart.addDipSeries(data.dip.close, data.dip.dip, true)
            chart.updateDipPercentage(data.dip.close, data.dip.dip, -(dip / 100))
            chart.show()

            document.querySelector('#slider').value = dip

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