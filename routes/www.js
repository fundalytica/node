const express = require('express')
const router = express.Router()
const passport = require('passport')
const colors = require('colors')

const topics = [
    {
        id: 'option-yield',
        hashtag: 'options',
        image: 'options.svg',
        color: 'bg-deep-purple-300',
        title: 'Option Yield',
        description: 'Cash secured puts or covered calls? See how much those strategies yield right now on any given stock.',
        button: 'Yield Hunt',
        lottie: { src: '/lottie/lf30_rn1i0mvd.json' },
        action: 'route',
        state: 'live'
    },

    {
        id: 'futures',
        hashtag: 'data',
        image: 'crypto.svg',
        color: 'bg-light-blue-400',
        title: 'Crypto Futures',
        description: 'Contango or backwardation? Go long or go short? We track futures premiums on Kraken Futures.',
        button: 'Show Yields',
        lottie: { src: 'https://assets4.lottiefiles.com/packages/lf20_6q3x8d8e.json' },
        // lottie: { src: 'https://assets1.lottiefiles.com/private_files/lf30_9ivugi0v.json' },
        action: 'route',
        state: 'live'
    },

    {
        id: 'crypto_options',
        hashtag: 'data',
        image: 'crypto.svg',
        color: 'bg-light-blue-400',
        title: 'Crypto Options',
        description: 'Bitcoin & Ethereum options on Deribit. The higher the volatility the higher the option premium.',
        button: 'Check Premiums',
        // lottie: { src: 'https://assets4.lottiefiles.com/temp/lf20_UsL4RE.json' },
        lottie: { src: '/lottie/lf20_1zi49pcz.json' },
        action: 'route',
        state: 'live'
    },

    {
        id: 'crypto',
        hashtag: 'portfolio',
        image: 'crypto.svg',
        color: 'bg-deep-purple-a100',
        title: 'The Crypto Fund',
        description: 'BTC, ETH & Altcoins. Check out our diversified digital assets portfolio and create your own.',
        button: 'To The Moon',
        lottie: { src: '/lottie/lf20_xx7spau2.json' },
        action: 'route',
        state: 'beta'
    },


    {
        id: 'crypto',
        hashtag: 'portfolio',
        image: 'crypto.svg',
        color: 'bg-deep-purple-a100',
        title: 'The Crypto Fund',
        description: 'BTC, ETH & Altcoins. Check out our diversified digital assets portfolio and create your own.',
        button: 'To The Moon',
        lottie: { src: '/lottie/lf20_xx7spau2.json' },
        action: 'route',
        state: 'beta'
    },

    // {
    //     id: 'ipodata',
    //     hashtag: 'data',
    //     image: 'ipodata.svg',
    //     color: 'bg-light-blue-400',
    //     title: 'IPO Datastore',
    //     description: 'We collected and enriched all the IPO data of the last 10 years so you can use it too.',
    //     button: 'Preview Data',
    //     action: 'wip',
    //     state: 'wip'
    // },

    {
        id: 'ath',
        hashtag: 'analytics',
        color: 'bg-green-400',
        image: 'ath.svg',
        title: 'All Time Highs',
        description: 'We analyze the historical data of any stock and show you the all time high prices throughout its history.',
        button: 'Charts',
        lottie: { src: 'https://assets6.lottiefiles.com/packages/lf20_2p5ywtpt.json' },
        // lottie: { src: 'https://assets10.lottiefiles.com/private_files/lf30_cPwdH6.json' },
        action: 'route',
        state: 'beta'
    },

    {
        id: 'dip',
        hashtag: 'analytics',
        color: 'bg-red-300',
        image: 'dip.svg',
        title: 'Buy The Dip',
        description: 'We are looking out for the next stock price dips because we love investing at low prices. Do not miss the opportunity!',
        button: 'Charts',
        lottie: { src: 'https://assets4.lottiefiles.com/private_files/lf30_ubbJQt.json' },
        action: 'route',
        state: 'beta',
        params: 2
    },

    {
        id: 'alpha',
        hashtag: 'tool',
        color: 'bg-orange-300',
        image: 'alpha.svg',
        title: 'Beat The Market ',
        description: 'Every investment should be compared to performance of the broader market. Do you know what your alpha is?',
        lottie: { src: '/lottie/alpha.json' },
        button: 'Find Out',
        action: 'wip',
        state: 'wip'
    },

    {
        id: 'reports',
        hashtag: 'tool',
        color: 'bg-orange-300',
        image: 'reports.svg',
        title: 'Brokerage Reports',
        description: 'Brokerage reports are not always easy to read, try out a richer experience.',
        button: 'Upload Report',
        action: 'wip',
        state: 'wip'
    },

    {
        id: 'qqq',
        hashtag: 'data',
        color: 'bg-light-blue-400',
        image: 'invesco.svg',
        title: 'QQQ ETF Holdings',
        description: 'All the great companies included in the Invesco QQQ ETF (NASDAQ 100).',
        button: 'View Stocks 🔍',
        action: 'qqq',
        state: 'wip'
    },

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
    const value = req.url.split('-').pop().replace('/', '')
    req.flash(key, value)
    res.redirect('/')
}

router.get('/subscription-pending', flashSubscriptionURL)
router.get('/subscription-success', flashSubscriptionURL)

const validateParameters = (topic, parameters) => {
    if (topic['id'] == 'dip') {
        if (parameters['p1']) {
            let symbol = parameters['p1']
            const regex = /^[a-zA-Z]{1,5}((\.){1}[aA|bB]{1}){0,1}$/
            if (!symbol.match(regex)) symbol = 'SNAP'
            parameters['p1'] = symbol
        }

        if (parameters['p2']) {
            let dip = parameters['p2']
            if (isNaN(dip)) dip = 10
            dip = parseInt(dip)
            if (dip % 5 != 0) dip = dip - (dip % 5)
            if (dip < 10) dip = 10
            if (dip > 90) dip = 90
            parameters['p2'] = dip
        }
    }

    return parameters
}

const topicRoute = topic => {
    const id = topic['id']
    const title = topic['title']
    const description = topic['description']
    const params = topic['params']

    let path = `/${id}`
    if (params) {
        for (let i = 1; i <= params; i++) {
            path += `/:p${i}?`
        }
        console.log(path)
    }

    router.get(path, (req, res) => {
        const user = req.user
        const just_logged = req.flash('logged')[0]
        let parameters = { title, description, user, just_logged }

        for (const p in req.params) {
            if (req.params[p]) {
                parameters[p] = req.params[p]
            }
        }

        parameters = validateParameters(topic, parameters)

        res.render(id, parameters)
    })
}
topics.forEach(t => topicRoute(t))

const authRoutes = ['login', 'signup']
authRoutes.forEach(route => {
    router.get(`/${route}`, (req, res) => {
        if (req.isAuthenticated()) res.redirect('/')
        res.render(route)
    })
})

router.get('/wip', (req, res) => res.render('wip', { user: req.user }))

router.get('/test', (req, res) => res.render('test'))

module.exports = router