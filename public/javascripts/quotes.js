const iex_token = document.getElementById('quotes.js').getAttribute('data-iex-token')

import IEX from './modules/IEX.js'

const fetch = () => {
    const symbols = ['SPY','QQQ','AAPL','TSLA']
    const urls = {
        SPY: 'https://www.ssga.com/us/en/individual/etfs/funds/spdr-sp-500-etf-trust-spy',
        QQQ: 'https://www.invesco.com/us/qqq-etf/',
        AAPL: 'https://www.apple.com/',
        TSLA: 'https://www.tesla.com/'
    }

    const done = result => {
        $("#quotes").empty()

        const symbols = Object.keys(result)

        for(const symbol of symbols) {
            const latestPrice = result[symbol].quote.latestPrice
            const changePercent = result[symbol].quote.changePercent
            const colorClass = changePercent < 0 ? 'quote-red' : (changePercent > 0 ? 'quote-green' : 'quote-white')
            
            let HTML = ''
            HTML += '<li class="quote ' + colorClass + '">'
            HTML += '<a href="' + urls[symbol] + '" target="_blank">'
            HTML += '<span class="symbol">' + symbol + '</span>'
            HTML += '<span class="price">' + numeral(latestPrice).format('$0,0.0') + '</span>'
            HTML += '<span class="change">' + numeral(changePercent).format('%0.0') + '</span>'
            HTML += '</a>'
            HTML += '</li>'

            $("#quotes").append(HTML)
        }        
    }

    const iex = new IEX(iex_token)
    iex.getQuotes(symbols, done)

    setTimeout(fetch, 20000)
}

$(fetch())