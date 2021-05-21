const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')

const router = express.Router()

// Custom Callback Template
// router.post('/abc', async (req, res, next) => {
//     passport.authenticate('abc', async (err, user, info) => {
//     })(req, res, next)
// })

router.post('/signup', async (req, res, next) => {
    passport.authenticate('signup', async (err, user, info) => {
        if (err || !user) {
            // { MongoError: E11000 duplicate key error collection: fundalytica.users index: email_1 dup key: { email: "abc@xyz.com" }
            if (err && err.name == 'MongoError' && err.code == 11000) {
                return res.json({ error: 'Email already taken' })
            }

            // { message: 'Missing credentials' }
            if (info) {
                console.log(info)
                return res.json({ error: info.message })
            }
        }

        return res.json({
            message: 'Signup successful',
            email: user.email
        })
    })(req, res, next)
})

// No Custom Callback
// router.post('/signup', passport.authenticate('signup', { session: false }), async (req, res, next) => {
//     res.json({
//         message: 'Signup successful',
//         email: req.user.email
//         // user: req.user,
//     })
// })

router.post('/login', async (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
        try {
            if (err || !user) {
                const error = new Error('Incorrect login')
                return res.json({ error: error.message })
            }

            req.login(user, { session: false }, async error => {
                if (error) {
                    return res.json({ error: error.message })
                }

                const body = { _id: user._id, email: user.email }
                const token = jwt.sign({ user: body }, process.env.TOKEN_SIGN_SECRET)

                return res.json({ token })
            })
        } catch (error) {
            return res.json({ error: error.message })
        }
    })(req, res, next)
})

module.exports = router