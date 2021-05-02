const express = require('express')
const router = express.Router()

const { PythonShell } = require('python-shell')

router.get('/', (req, res, next) => {
    res.render('api', {
        text: 'Fundalytica API',
        urls: [
            '/v1/options/portfolio',

            '/v1/quote/:symbol',

            '/v1/historical/:symbol',
            '/v1/historical/ath/:symbol',
            '/v1/historical/dip/:symbol-:dip'
        ]
    })
})

router.get('/v1/options/portfolio', async (req, res) => {
    console.log('/v1/options/portfolio')

    shellHandler('/scripts/ib-summary/ib-summary.py', ['--options', '--json'], res)
})

router.get('/v1/quote/:symbol', async (req, res) => {
    const symbol = req.params.symbol

    console.log('/v1/quote/' + symbol)

    // shellHandler('/scripts/iex/iex-quote.py', ['-s', symbol], res)
    shellHandler('/scripts/yahoo/yahoo-quote.py', ['-s', symbol], res)
})

router.get('/v1/historical/:symbol', async (req, res) => {
    const symbol = req.params.symbol
    const provider = 'yahoo'

    console.log(`/v1/historical/${symbol} (${provider})`)

    // shellHandler('/scripts/yahoo/yahoo-historical.py', ['-s', symbol], res)
    shellHandler('/scripts/py-historical/historical.py', ['-s', symbol, '-p', provider], res)
})
router.get('/v1/historical/ath/:symbol', async (req, res) => {
    const symbol = req.params.symbol
    const provider = 'yahoo'

    console.log(`/v1/ath/${symbol} (${provider})`)

    shellHandler('/scripts/py-historical/historical.py', ['-s', symbol, '-p', provider, '--ath'], res)
})
router.get('/v1/historical/dip/:symbol-:dip', async (req, res) => {
    const symbol = req.params.symbol
    const dip = req.params.dip
    const provider = 'yahoo'

    console.log(`/v1/dip/${symbol}-${dip} (${provider})`)

    shellHandler('/scripts/py-historical/historical.py', ['-s', symbol, '-p', provider, '--dip', dip], res)
})

const shellHandler = (script, args, res) => {
    const options = { args: args, mode: 'json' }

    PythonShell.run(script, options, (error, results) => {
        if (error) {
            res.json({ error: error })
            console.error(`error: %j`, error)
        }
        else {
            res.json(results)
            console.log(`results: %j`, results)
        }
    })
}

module.exports = router