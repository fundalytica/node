const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')

const router = express.Router()

// A. Custom Callback: router.post('/abc', async (req, res, next) => { passport.authenticate('abc', async (err, user, info) => { ... })(req, res, next) })
// B. No Custom Callback: router.post('/abc', passport.authenticate('abc', { session: false }), async (req, res, next) => { res.json({ ... }) })

const authenticated = (req, res, user) => {
    // create token (contains all user values)
    const body = { _id: user._id, email: user.email, name: user.name }
    const token = jwt.sign({ user: body }, process.env.TOKEN_SIGN_SECRET)

    req.flash('logged', 'in')

    const age = 1000 * 60 * 10 // 10m
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: true, maxAge: age })
    res.json( { success: { code: 'LOGIN_SUCCESS', message: 'Logged In' } } )
}

router.post('/signup', async (req, res, next) => {
    passport.authenticate('signup', async (error, user, info) => {
        if(error) return res.json({ error: { code: 'SIGNUP_FAIL', message: error.message } } )
        if(! user) return res.json({ error: { code: 'SIGNUP_FAIL', message: info.message } } )

        authenticated(req, res, user)
    })(req, res, next)
})

router.post('/login', async (req, res, next) => {
    console.log('[ POST - /login ]')
    console.log(req.body)

    passport.authenticate('login', async (error, user, info) => {
        console.log('[ authenticate - info ]') // from localStrategy
        console.log(info)

        const handleError = error => {
            console.log('[ authenticate - error ]')
            console.log(error)
            return res.json( { error: { code: 'LOGIN_FAIL', message: 'Login Error' } } )
        }

        try {
            if (error) return handleError(error)
            if (!user) return res.json( { error: { code: 'CREDENTIALS_FAIL', message: 'Incorrect Login' } } ) // do not use info.message ("User not found", "Wrong Password", ...)

            req.login(user, { session: false }, async error => {
                if (error) return handleError(error)
                authenticated(req, res, user)
            })
        } catch (error) {
            return res.json( { error: { message: error.message } } )
        }
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.flash('logged', 'out')

    res.clearCookie('token')
    res.redirect('/')
})

module.exports = router