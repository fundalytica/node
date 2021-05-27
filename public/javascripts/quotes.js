const api_token = document.getElementById('quotesjs').getAttribute('data-api-token')

import API from './modules/API.js'

import UIUtils from './modules/UI/UIUtils.js'

const run = () => {
    const symbols = ['SPY', 'QQQ', 'AAPL', 'TSLA']

    const responsive_md = ['QQQ', 'AAPL'] // show only on medium+ screen

    const urls = {
        SPY: 'https://www.ssga.com/us/en/individual/etfs/funds/spdr-sp-500-etf-trust-spy',
        QQQ: 'https://www.invesco.com/us/qqq-etf/',
        AAPL: 'https://www.apple.com/',
        TSLA: 'https://www.tesla.com/'
    }

    const done = result => {
        UIUtils.empty("#quotes")

        const symbols = Object.keys(result)
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i]

            const latestPrice = result[symbol].price
            const changePercent = result[symbol].change

            const colorClass = changePercent < 0 ? 'red-300' : (changePercent > 0 ? 'green-300' : 'grey-100')
            let CSSClasses = `quote ${colorClass}`
            if (responsive_md.includes(symbol)) CSSClasses = `${CSSClasses} d-none d-md-block`

            const element = document.querySelector("#quotes")

            let HTML = ''
            HTML += '<li class="' + CSSClasses + '">'
            HTML += '<a href="' + urls[symbol] + '" target="_blank">'
            HTML += '<span class="symbol">' + symbol + '</span>'
            HTML += '<span class="price">' + numeral(latestPrice).format('$0,0.0') + '</span>'
            HTML += '<span class="change">' + numeral(changePercent).format('%0.0') + '</span>'
            HTML += '</a>'
            HTML += '</li>'

            element.innerHTML = HTML
        }
    }

    const api = new API(api_token)
    api.getPrices(symbols, done)

    setTimeout(fetch, 1000 * 20)
}

UIUtils.ready(run)