var express = require('express')
var router = express.Router()

const topics = [
    {
        id: 'dip',
        hashtag: 'tool',
        color: 'bg-red-300',
        image: 'dip.svg',
        title: 'S&P 500 Dip',
        description: 'We are looking out for the next S&P 500 dip because we love investing at low prices. Do not miss it!',
        button: 'Buy The Dip 📉',
        action: 'wip'
    },

    {
        id: 'ipodata',
        hashtag: 'data',
        image: 'options.svg',
        color: 'bg-blue-300',
        title: 'IPO Datastore',
        description: 'We collected and enriched all the IPO data of the last 10 years so you can use it too.',
        button: 'Preview Data 👾',
        action: 'wip'
    },

    {
        id: 'reports',
        hashtag: 'tool',
        color: 'bg-brown-300',
        image: 'benchmark.svg',
        title: 'Brokerage Reports',
        description: 'Brokerage reports are not always easy to read, try out a richer experience.', 
        button: 'Upload Report 📋',
        action: 'wip'
    },

    {
        id: 'benchmark',
        hashtag: 'tool',
        color: 'bg-green-300',
        image: 'benchmark.svg',
        title: 'The Benchmark',
        description: 'Every investment should be compared to the broader market. Do you know what your alpha is?',
        button: 'Find Out 🔬',
        action: 'wip'
    },

    {
        id: 'qqq',
        hashtag: 'data',
        color: 'bg-purple-200 ',
        image: 'invesco.svg',
        title: 'QQQ ETF Holdings',
        description: 'All the great companies included in the Invesco QQQ ETF (NASDAQ 100).',
        button: 'View Stocks 🔍',
        action: 'wip'
    },
]

router.get('/', (req, res) => res.render('index', { topics }))
router.get('/subscription-pending', (req, res) => res.render('index', { topics: topics, subscribe: 'pending' })) // subscription pending
router.get('/subscription-success', (req, res) => res.render('index', { topics: topics, subscribe: 'success' })) // subscription success

router.get('/wip', (req, res) => res.render('wip'))

module.exports = router
