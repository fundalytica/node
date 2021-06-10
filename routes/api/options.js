const router = require('express').Router()
const colors = require('colors')

const utils = require('../utils.js')

router.get('/v1/options/portfolio', async (req, res) => {
    console.log(`path: ${req.path}`.cyan)

    utils.shellHandler(`${process.env.SCRIPTS_PATH}/ib-summary/ib-summary.py`, ['--options', '--json'], res)
})

module.exports = router