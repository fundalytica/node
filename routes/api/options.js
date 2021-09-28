const router = require('express').Router()
const colors = require('colors')

const utils = require('../utils.js')

router.get(`${process.env.API_PATH}/v1/options/portfolio`, async (req, res) => {
    console.log(`path: ${req.path}`.cyan)

    const callback = json => res.json(json)
    utils.shellHandler(`${process.env.SCRIPTS_PATH}/ib-summary/ib-summary.py`, ['--options', '--json'], callback)
})

module.exports = router