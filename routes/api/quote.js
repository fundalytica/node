const router = require('express').Router()
const colors = require('colors')

const utils = require('../utils.js')

router.get('/v1/quote/:symbol', async (req, res) => {
    const symbol = req.params.symbol

    console.log('/v1/quote/' + symbol)

    // utils.shellHandler('/scripts/iex/iex-quote.py', ['-s', symbol], res)
    utils.shellHandler('/scripts/yahoo/yahoo-quote.py', ['-s', symbol], res)
})

module.exports = router