const router = require('express').Router()
const colors = require('colors')

const utils = require('../utils.js')

router.get(`${process.env.API_PATH}/v1/quote/:symbol`, async (req, res) => {
    console.log(`path: ${req.path}`.cyan)

    const symbol = req.params.symbol
    const callback = json => res.json(json)
    utils.shellHandler(`${process.env.SCRIPTS_PATH}/yahoo/yahoo-quote.py`, ['-s', symbol], callback)
})

module.exports = router