const router = require('express').Router()
const colors = require('colors')

const utils = require('../utils.js')

router.get(`${process.env.API_PATH}/v1/quote/:symbol`, async (req, res) => {
    const symbol = req.params.symbol

    console.log('/v1/quote/' + symbol)

    const callback = json => res.json(json)
    utils.shellHandler('/scripts/yahoo/yahoo-quote.py', ['-s', symbol], callback)
})

module.exports = router