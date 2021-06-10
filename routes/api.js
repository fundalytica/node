const router = require('express').Router()

router.get('/', (req, res, next) => {
    res.render('api', {
        text: 'Fundalytica API',

        urls: [
            '/v1/crypto/futures/tickers/symbols/kraken',

            '/v1/options/portfolio',

            '/v1/historical/:symbol',
            '/v1/historical/ath/:symbol',
            '/v1/historical/dip/:symbol-:dip',

            '/v1/quote/:symbol',
        ]
    })
})

module.exports = router