const express = require('express')
const router = express.Router()

const passport = require('passport')

const authorizedOnly = passport.authenticate('jwt', { session: false })

router.get('/profile', authorizedOnly, (req, res, next) => {
    res.json({
        message: 'You made it to the secure route',
        // user: req.user,
        token: req.query[process.env.JWT_TOKEN_QUERY_PARAMETER]
    })
})

module.exports = router