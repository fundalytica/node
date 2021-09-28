const express = require('express')
const router = express.Router()

const handler = (req, res, next) => {
    res.render('api', {
        text: 'Fundalytica API',

        urls: [
            '/v1/crypto/portfolio',
            '/v1/crypto/portfolio/update',

            '/v1/crypto/futures/tickers/symbols/kraken',

            '/v1/options/portfolio',

            '/v1/historical/:symbol',
            '/v1/historical/ath/:symbol',
            '/v1/historical/dip/:symbol-:dip',

            '/v1/quote/:symbol',
        ]
    })
}

router.get(process.env.API_PATH, handler)

module.exports = router