const router = require('express').Router()
const colors = require('colors')

const utils = require('../utils.js')

router.get('/v1/historical/:symbol', async (req, res) => {
    const symbol = req.params.symbol
    const provider = 'yahoo'

    console.log(`/v1/historical/${symbol} (${provider})`)

    // utils.shellHandler(`${process.env.SCRIPTS_PATH}/yahoo/yahoo-historical.py`, ['-s', symbol], res)
    utils.shellHandler(`${process.env.SCRIPTS_PATH}/py-historical/historical.py`, ['-s', symbol, '-p', provider], res)
})

router.get('/v1/historical/ath/:symbol', async (req, res) => {
    const symbol = req.params.symbol
    const provider = 'yahoo'

    console.log(`/v1/ath/${symbol} (${provider})`)

    utils.shellHandler(`${process.env.SCRIPTS_PATH}/py-historical/historical.py`, ['-s', symbol, '-p', provider, '--ath'], res)
})

router.get('/v1/historical/dip/:symbol-:dip', async (req, res) => {
    const symbol = req.params.symbol
    const dip = req.params.dip
    const provider = 'yahoo'

    console.log(`/v1/dip/${symbol}-${dip} (${provider})`)

    utils.shellHandler(`${process.env.SCRIPTS_PATH}/py-historical/historical.py`, ['-s', symbol, '-p', provider, '--dip', dip], res)
})

module.exports = router