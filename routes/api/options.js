const router = require('express').Router()
const colors = require('colors')

const utils = require('../utils.js')

router.get(`${process.env.API_PATH}/v1/options/portfolio`, async (req, res) => {
    console.log(`path: ${req.path}`.cyan)
    console.log(`data: ${process.env.IB_DATA}`.green)

    const callback = json => res.json(json)
    utils.shellHandler(`${process.env.SCRIPTS_PATH}/ib-summary/ib-summary.py`, ['-data', process.env.IB_DATA, '--options', '--json'], callback)
})

module.exports = router