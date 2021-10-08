const express = require('express')
const router = express.Router()
const passport = require('passport')
const colors = require('colors')

const topics = [
    {
        id: 'crypto',
        hashtag: 'portfolio',
        image: 'crypto.svg',
        color: 'bg-deep-purple-a100',
        title: 'The Crypto Fund',
        description: 'BTC, ETH, DOT, Altcoins. Check out our diversified digital assets portfolio and create your own.',
        button: 'To The Moon',
        lottie: 'https://assets6.lottiefiles.com/packages/lf20_ZUd5j6.json',
        action: 'route'
    },

    {
        id: 'futures',
        hashtag: 'data',
        image: 'crypto.svg',
        color: 'bg-light-blue-400',
        title: 'Crypto Futures',
        description: 'Contango or backwardation? Go long or go short? We track futures premiums on Kraken.',
        button: 'Show Premiums',
        action: 'route'
    },

    {
        id: 'options',
        hashtag: 'portfolio',
        image: 'options.svg',
        color: 'bg-deep-purple-a100',
        title: 'Option Writing',
        description: 'When volatility goes up, we will sell options to capture the higher premium. We share our open positions.',
        button: 'See Portfolio',
        lottie: 'https://assets10.lottiefiles.com/datafiles/lwjM2vQf6cSbmAu/data.json',
        action: 'route'
    },

    {
        id: 'ath',
        hashtag: 'analytics',
        color: 'bg-green-400',
        image: 'ath.svg',
        title: 'All Time Highs',
        description: 'We analyze the historical data of any stock and show you the all time high prices throughout its history.',
        button: 'Charts',
        action: 'route'
    },

    {
        id: 'dip',
        hashtag: 'analytics',
        color: 'bg-red-300',
        image: 'dip.svg',
        title: 'Buy The Dip',
        description: 'We are looking out for the next stock price dips because we love investing at low prices. Do not miss the opportunity!',
        button: 'Charts',
        action: 'route'
    },

    {
        id: 'ipodata',
        hashtag: 'data',
        image: 'ipodata.svg',
        color: 'bg-light-blue-400',
        title: 'IPO Datastore',
        description: 'We collected and enriched all the IPO data of the last 10 years so you can use it too.',
        button: 'Preview Data',
        action: 'wip'
    },

    {
        id: 'reports',
        hashtag: 'tool',
        color: 'bg-orange-300',
        image: 'reports.svg',
        title: 'Brokerage Reports',
        description: 'Brokerage reports are not always easy to read, try out a richer experience.',
        button: 'Upload Report',
        action: 'wip'
    },

    {
        id: 'benchmark',
        hashtag: 'tool',
        color: 'bg-orange-300',
        image: 'benchmark.svg',
        title: 'The Benchmark',
        description: 'Every investment should be compared to the broader market. Do you know what your alpha is?',
        button: 'Find Out',
        action: 'wip'
    },

    // {
    //     id: 'qqq',
    //     hashtag: 'data',
    //     color: 'bg-light-blue-400',
    //     image: 'invesco.svg',
    //     title: 'QQQ ETF Holdings',
    //     description: 'All the great companies included in the Invesco QQQ ETF (NASDAQ 100).',
    //     button: 'View Stocks 🔍',
    //     action: 'wip'
    // },
    //
    // {
    //     // id: 'norway',
    //     id: 'wip',
    //     hashtag: 'fund',
    //     color: 'bg-purple-200',
    //     image: 'norges.png',
    //     title: 'Norway Pension Fund',
    //     description: 'We dive into annual reports to find out how one of the largest pension funds invests.',
    //     button: 'View Results 🕵️‍♂️',
    //     action: 'route'
    // },
    // {
    //     // id: 'spacs',
    //     id: 'wip',
    //     hashtag: 'portfolio',
    //     image: 'spacs.svg',
    //     color: 'bg-deep-purple-a100',
    //     title: 'SPACs Portfolio',
    //     description: 'We love investing in SPACs and Chamath Palihapitiya is our SPAC king. Check out our picks so far.',
    //     button: 'Our SPACs 🤴',
    //     action: 'route'
    // },
    // {
    // {
    // comic book
    // }
]

// add user info to all requests
const auth = (req, res, next) => {
    passport.authenticate('jwt', (err, user, info) => {
        req.user = user
        next()
    })(req, res, next)
}
router.use(auth)

router.get('/', (req, res, next) => {
    console.log(`[ email: ${req.user.email ? req.user.email : 'x'} ] [ token: ${req.cookies.token ? req.cookies.token : 'x'} ]`.green)

    const user = req.user
    const subscription = req.flash(req.app.locals.flash_subscription_key)[0] // get single value
    // const description = req.app.locals.description

    const subscribed_key = 'subscribed'

    const just_logged = req.flash('logged')[0]

    res.render('index', { topics, subscription, user, just_logged, subscribed_key })
})

const flashSubscriptionURL = (req, res) => {
    const key = req.app.locals.flash_subscription_key
    const value = req.url.split('-').pop().replace('/','')
    req.flash(key, value)
    res.redirect('/')
}

router.get('/subscription-pending', flashSubscriptionURL)
router.get('/subscription-success', flashSubscriptionURL)

const topicRoute = topic => {
    const id = topic['id']
    const title = topic['title']
    const description = topic['description']

    router.get(`/${id}`, (req, res) => {
        const parameters = { title: title, description: description, user: req.user }
        res.render(id, parameters)
    })
}
topics.forEach(t => topicRoute(t))

const authRoutes = ['login','signup']
authRoutes.forEach(route => {
    router.get(`/${route}`, (req, res) => {
        if(req.isAuthenticated()) res.redirect('/')
        res.render(route)
    })
})

router.get('/wip', (req, res) => res.render('wip', { user: req.user}))

router.get('/test', (req, res) => res.render('test'))

module.exports = router