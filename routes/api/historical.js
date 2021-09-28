const router = require('express').Router()
const colors = require('colors')

const utils = require('../utils.js')

router.get(`${process.env.API_PATH}/v1/historical/:symbol`, async (req, res) => {
    const symbol = req.params.symbol
    const provider = 'yahoo'

    console.log(`/v1/historical/${symbol} (${provider})`)

    // utils.shellHandler(`${process.env.SCRIPTS_PATH}/yahoo/yahoo-historical.py`, ['-s', symbol], res)
    const callback = json => res.json(json)
    utils.shellHandler(`${process.env.SCRIPTS_PATH}/py-historical/historical.py`, ['-s', symbol, '-p', provider], callback)
})

router.get(`${process.env.API_PATH}/v1/historical/ath/:symbol`, async (req, res) => {
    const symbol = req.params.symbol
    const provider = 'yahoo'

    console.log(`/v1/ath/${symbol} (${provider})`)

    const callback = json => res.json(json)
    utils.shellHandler(`${process.env.SCRIPTS_PATH}/py-historical/historical.py`, ['-s', symbol, '-p', provider, '--ath'], callback)
})

router.get(`${process.env.API_PATH}/v1/historical/dip/:symbol-:dip`, async (req, res) => {
    const symbol = req.params.symbol
    const dip = req.params.dip
    const provider = 'yahoo'

    console.log(`/v1/dip/${symbol}-${dip} (${provider})`)

    const callback = json => res.json(json)
    utils.shellHandler(`${process.env.SCRIPTS_PATH}/py-historical/historical.py`, ['-s', symbol, '-p', provider, '--dip', dip], callback)
})

module.exports = router