const express = require('express')
const router = express.Router()

const colors = require('colors');

const utils = require('./utils.js')

router.get('/v1/crypto/futures/tickers/symbols/kraken', async (req, res) => {
    console.log(`path: ${req.path}`.cyan)

    utils.shellHandler(`${process.env.SCRIPTS_PATH}/futures/futures.py`, ['-p', 'kraken', '--tickers', '--symbols'], res)
})

module.exports = router