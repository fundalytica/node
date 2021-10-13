const router = require('express').Router()
const passport = require('passport')
const colors = require('colors')

const utils = require('../utils.js')

const CryptoPortfolioModel = require('../../models/crypto_portfolio')

const error = (code, message = '') => { return { 'error': { 'code': code, 'message': message } } }

const authenticate = (req, res, next) => passport.authenticate('jwt', { session: false }, next)(req, res)
// const authenticate = (req, res, next) => {
//     passport.authenticate('jwt', { session: false }, (err, user, info) => {
//         if(! user) return res.json({ 'error': 'no_user' })
//         next()
//     })(req, res)
// }

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
                json['user'] = true
                res.json(json)
            }
            else { // empty
                utils.shellHandler(path, ['-db', db, '-user', DEMO_EMAIL], json => { // fetch demo portfolio
                    json['demo'] = true
                    json['user'] = true
                    res.json(json)
                })
            }
        })
    }
    else { // no user logged in
        utils.shellHandler(path, ['-db', db, '-user', DEMO_EMAIL], json => { // fetch demo portfolio
            json['demo'] = true
            json['user'] = false
            res.json(json)
        })
    }
})

router.post(`${process.env.API_PATH}/v1/crypto/portfolio/delete`, authenticate, async (req, res) => {
    console.log(`path: ${req.path}`.cyan)

    if(! req.body.symbol) return res.json(error('missing_symbol', `symbol is missing`))
    const symbol = (req.body.symbol).toLowerCase()

    const email = req.user.email
    if(! email) return res.json(error('no_user'))

    let portfolio = await CryptoPortfolioModel.findOne({ email }).exec()
    if(! portfolio) return res.json(error('no_portfolio', `portfolio not found`))

    portfolio.positions = portfolio.positions.filter(p => p['symbol'] != symbol)
    portfolio.trades = portfolio.trades.filter(t => t['symbol'] != symbol)

    await portfolio.save()
    return res.json({ 'status': 'ok', 'trades': portfolio.trades, 'positions': portfolio.positions })
})

router.post(`${process.env.API_PATH}/v1/crypto/portfolio/update`, authenticate, async (req, res) => {
    console.log(`path: ${req.path}`.cyan)

    const email = req.user.email
    if(! email) return res.json(error('no_user'))

    // properties received check
    if(! req.body.symbol)   return res.json(error('missing_symbol', `symbol is missing`))
    if(! req.body.action)   return res.json(error('missing_action', `action is missing`))
    if(! req.body.amount)   return res.json(error('missing_amount', `amount is missing`))
    if(! req.body.cost)     return res.json(error('missing_cost', `cost is missing`))

    const symbol = (req.body.symbol).toLowerCase()
    const action = req.body.action.toLowerCase()
    const amount = parseFloat(req.body.amount)
    const cost = parseFloat(req.body.cost)

    // error handling
    const supportedSymbols = ['btc', 'eth', 'dot', 'doge']
    const validActions = ['buy', 'sell']
    if(! supportedSymbols.includes(symbol)) return res.json(error('invalid_symbol', `invalid symbol: ${symbol}, not supported`))
    if(! validActions.includes(action))     return res.json(error('invalid_action', `invalid action: ${action}, must be buy or sell`))
    if(amount <= 0)                         return res.json(error('invalid_amount', `invalid amount: ${amount}, must be positive`))
    if(cost <= 0)                           return res.json(error('invalid_cost', `invalid cost: ${cost}, must be positive`))

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

    if(data.error) return res.json({ 'error': { 'code': 'update_error', 'message': data.error } })
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