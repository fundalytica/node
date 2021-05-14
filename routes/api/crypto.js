const express = require('express')
const router = express.Router()

const utils = require('./utils.js')

router.get('/v1/crypto/futures/tickers/symbols/kraken', async (req, res) => {
    console.log('/v1/crypto/futures/tickers/symbols/kraken')

    utils.shellHandler('/scripts/futures/futures.py', ['-p', 'kraken', '--tickers', '--symbols'], res)
})

module.exports = router