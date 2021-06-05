const express = require('express')
const router = express.Router()

const passport = require('passport')

const authorizedOnly = passport.authenticate('jwt', { session: false })

router.get('/profile', authorizedOnly, (req, res, next) => {
    // console.log(process.env.JWT_TOKEN_QUERY_PARAMETER)
    // console.log(req.cookies.token)
    const response = {
        message: 'You made it to the secure route'
        // token: req.cookies.token
        // user: req.user,
        // token: req.query[process.env.JWT_TOKEN_QUERY_PARAMETER]
    }

    res.json(response)
})

module.exports = router