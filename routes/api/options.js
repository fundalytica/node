const express = require('express')
const router = express.Router()

const utils = require('./utils.js')

router.get('/v1/options/portfolio', async (req, res) => {
    console.log('/v1/options/portfolio')

    utils.shellHandler('/scripts/ib-summary/ib-summary.py', ['--options', '--json'], res)
})

module.exports = router