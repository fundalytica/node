const router = require('express').Router()
const colors = require('colors')

const utils = require('../utils.js')

router.get(`${process.env.API_PATH}/v1/crypto/portfolio`, async (req, res) => {
    console.log(`path: ${req.path}`.cyan)
    utils.shellHandler(`${process.env.SCRIPTS_PATH}/crypto/portfolio.py`, ['-db', `fundalytica_${process.env.NODE_ENV}`], res)
})

router.get(`${process.env.API_PATH}/v1/crypto/futures/tickers/symbols/kraken`, async (req, res) => {
    console.log(`path: ${req.path}`.cyan)
    utils.shellHandler(`${process.env.SCRIPTS_PATH}/crypto/futures.py`, ['-p', 'kraken', '--tickers', '--symbols'], res)
})

module.exports = router