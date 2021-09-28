const router = require('express').Router()
const passport = require('passport')
const colors = require('colors')

const utils = require('../utils.js')

const CryptoPortfolioModel = require('../../models/crypto_portfolio')

const authenticate = (req, res, next) => passport.authenticate('jwt', { session: false }, next)(req, res)

router.get(`${process.env.API_PATH}/v1/crypto/portfolio`, authenticate, async (req, res) => {
    console.log(`path: ${req.path}`.cyan)

    let email = req.user.email
    let demo = false

    if(! email) {
        email = 'dummy@fundalytica.com'
        demo = true
    }

    const callback = json => {
        const empty = (json['assets'].length == 0)
        demo = demo || empty
        if(demo) json['demo'] = true

        res.json(json)
    }

    utils.shellHandler(`${process.env.SCRIPTS_PATH}/crypto/portfolio.py`, ['-db', `fundalytica_${process.env.NODE_ENV}`, '-user', email], callback)
})

router.post(`${process.env.API_PATH}/v1/crypto/portfolio/update`, authenticate, async (req, res) => {
    console.log(`path: ${req.path}`.cyan)

    const email = req.user.email
    if(! email) {
        return res.json({ 'error': 'no_user' })
    }

    const symbol = (req.body.symbol).toLowerCase()
    const amount = parseFloat(req.body.amount)
    const cost = parseFloat(req.body.cost)

    let portfolio = await CryptoPortfolioModel.findOne({ email }).exec()

    if(! portfolio) { // portfolio does not exist, create
        portfolio = new CryptoPortfolioModel()
        portfolio.email = email
        portfolio.assets = [{ symbol, amount, cost }]

        await portfolio.save()
        return res.json({ 'status': 'new_portfolio', 'assets': portfolio.assets })
    }

    if(portfolio) { // portfolio exists
        const index = portfolio.assets.findIndex(asset => asset.symbol == symbol)

        if(index == -1) { // position does not exist, create
            portfolio.assets.push({ symbol, amount, cost })

            await portfolio.save()
            return res.json({ 'status': 'new_position', 'assets': portfolio.assets })
        }

        if(index >= 0) { // position exists, increment
            portfolio.assets[index].amount += amount
            portfolio.assets[index].cost += cost

            await portfolio.save()
            return res.json({ 'status': 'updated_position', 'assets': portfolio.assets })
        }
    }
})

router.get(`${process.env.API_PATH}/v1/crypto/futures/tickers/symbols/kraken`, async (req, res) => {
    console.log(`path: ${req.path}`.cyan)

    const callback = json => res.json(json)
    utils.shellHandler(`${process.env.SCRIPTS_PATH}/crypto/futures.py`, ['-p', 'kraken', '--tickers', '--symbols'], callback)
})

module.exports = router