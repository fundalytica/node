const router = require('express').Router()
const passport = require('passport')
const colors = require('colors')

const utils = require('../utils.js')

const CryptoPortfolioModel = require('../../models/crypto_portfolio')

const authenticate = (req, res, next) => passport.authenticate('jwt', { session: false }, next)(req, res)

router.get(`${process.env.API_PATH}/v1/crypto/portfolio`, authenticate, async (req, res) => {
    console.log(`path: ${req.path}`.cyan)

    const path = `${process.env.SCRIPTS_PATH}/crypto/portfolio.py`
    const db = `fundalytica_${process.env.NODE_ENV}`

    const email = req.user.email
    const DEMO_EMAIL = 'dummy@fundalytica.com'

    if (email) { // user logged in
        utils.shellHandler(path, ['-db', db, '-user', email], json => {
            console.log(json)

            if(json['trades'].length && json['positions'].length) { // not empty
                res.json(json)
            }
            else { // empty, fetch demo portfolio
                utils.shellHandler(path, ['-db', db, '-user', DEMO_EMAIL], json => {
                    json['empty'] = true
                    json['demo'] = true
                    res.json(json)
                })
            }
        })
    }
    else { // no user logged in, fetch demo portfolio
        utils.shellHandler(path, ['-db', db, '-user', DEMO_EMAIL], json => {
            json['demo'] = true
            res.json(json)
        })
    }
})

router.post(`${process.env.API_PATH}/v1/crypto/portfolio/update`, authenticate, async (req, res) => {
    console.log(`path: ${req.path}`.cyan)

    const email = req.user.email
    if(! email) {
        return res.json({ 'error': 'no_user' })
    }

    const symbol = (req.body.symbol).toLowerCase()
    const action = req.body.action
    const amount = parseFloat(req.body.amount)
    const cost = parseFloat(req.body.cost)

    let portfolio = await CryptoPortfolioModel.findOne({ email }).exec()

    if(! portfolio) { // portfolio does not exist, create
        portfolio = new CryptoPortfolioModel()
        portfolio.email = email
        portfolio.trades = [{ symbol, action, amount, cost }]
    }
    else { // portfolio exists, create new trade
        const trades = portfolio.trades.find(trade => trade.symbol == symbol)
        portfolio.trades.push({ symbol, action, amount, cost })
    }

    const positionsFromTrades = trades => { // calculate positions from trades
        const groupBy = (array, key) => array.reduce((r, a) => { // group trades by symbol
            (r[a[key]] = r[a[key]] || []).push(a)
            return r
        }, {})
        const groupedTrades = groupBy(trades, 'symbol')

        const positions = [] // positions array to return
        const accumulate = (trades, property) => { // accumulation method to get total amount and cost
            const total = trades.reduce((r,a) => {
                if(a.action == 'buy') {
                    r += a[property]
                }
                if(a.action == 'sell') {
                    r -= a[property]
                }
                return r
            }, 0)
            return total
        }

        for(const symbol in groupedTrades) { // add symbol totals to positions
            const amount = accumulate(groupedTrades[symbol], 'amount')
            const cost = accumulate(groupedTrades[symbol], 'cost')
            positions.push({ symbol, amount, cost })
        }

        return { positions }
    }

    const data = positionsFromTrades(portfolio.trades)

    if(data.error) return res.json({ 'error': data.error })
    portfolio.positions = data.positions

    await portfolio.save()
    return res.json({ 'status': 'ok', 'trades': portfolio.trades, 'positions': portfolio.positions })
})

router.get(`${process.env.API_PATH}/v1/crypto/futures/tickers/symbols/kraken`, async (req, res) => {
    console.log(`path: ${req.path}`.cyan)

    const callback = json => res.json(json)
    utils.shellHandler(`${process.env.SCRIPTS_PATH}/crypto/futures.py`, ['-p', 'kraken', '--tickers', '--symbols'], callback)
})

module.exports = router