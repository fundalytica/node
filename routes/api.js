const express = require('express')
const router = express.Router()

const utils = require('./api/utils.js')

router.get('/', (req, res, next) => {
    res.render('api', {
        text: 'Fundalytica API',

        urls: [
            '/v1/options/portfolio',

            '/v1/quote/:symbol',

            '/v1/historical/:symbol',
            '/v1/historical/ath/:symbol',
            '/v1/historical/dip/:symbol-:dip',

            '/v1/crypto/futures/tickers/symbols/kraken',
        ]
    })
})

router.get('/v1/quote/:symbol', async (req, res) => {
    const symbol = req.params.symbol

    console.log('/v1/quote/' + symbol)

    // utils.shellHandler('/scripts/iex/iex-quote.py', ['-s', symbol], res)
    utils.shellHandler('/scripts/yahoo/yahoo-quote.py', ['-s', symbol], res)
})

router.get('/v1/historical/:symbol', async (req, res) => {
    const symbol = req.params.symbol
    const provider = 'yahoo'

    console.log(`/v1/historical/${symbol} (${provider})`)

    // utils.shellHandler('/scripts/yahoo/yahoo-historical.py', ['-s', symbol], res)
    utils.shellHandler('/scripts/py-historical/historical.py', ['-s', symbol, '-p', provider], res)
})
router.get('/v1/historical/ath/:symbol', async (req, res) => {
    const symbol = req.params.symbol
    const provider = 'yahoo'

    console.log(`/v1/ath/${symbol} (${provider})`)

    utils.shellHandler('/scripts/py-historical/historical.py', ['-s', symbol, '-p', provider, '--ath'], res)
})
router.get('/v1/historical/dip/:symbol-:dip', async (req, res) => {
    const symbol = req.params.symbol
    const dip = req.params.dip
    const provider = 'yahoo'

    console.log(`/v1/dip/${symbol}-${dip} (${provider})`)

    utils.shellHandler('/scripts/py-historical/historical.py', ['-s', symbol, '-p', provider, '--dip', dip], res)
})

module.exports = router