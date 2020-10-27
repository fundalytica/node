var express = require('express')
var router = express.Router()

const iex_token = require('/secret/iex.js').live

const description = 'Searching for the best performing assets and building investment and trading tools.'

const topics = [
    {
        id: 'dip',
        hashtag: 'tool',
        color: 'bg-green-300',
        image: 'dip.svg',
        title: 'S&P 500 Dip',
        description: 'We are looking out for the next S&P 500 dip because we love investing at low prices. Do not miss it!',
        button: 'Buy The Dip 📉',
        action: 'route'
    },

    {
        id: 'ipodata',
        hashtag: 'data',
        image: 'options.svg',
        color: 'bg-blue-300',
        title: 'IPO Datastore',
        description: 'We collected and enriched all IPO data of the last 10 years so you can use it too.',
        button: 'Preview Data 👾'
    },

    {
        id: 'qqq',
        hashtag: 'etf',
        color: 'bg-purple-200 ',
        image: 'invesco.svg',
        title: 'QQQ ETF Holdings',
        description: 'All the great companies included in the Invesco QQQ ETF (NASDAQ 100).',
        button: 'Coming Soon',
        // button: 'View Stocks 🔍',
        // action: 'route'
    },
]

router.get('/', (req, res) => res.render('index', { topics, description, iex_token }))

router.get('/subscription-pending', (req, res) => res.render('index', { topics: topics, subscribe: 'pending' })) // subscription pending
router.get('/subscription-success', (req, res) => res.render('index', { topics: topics, subscribe: 'success' })) // subscription success

module.exports = router