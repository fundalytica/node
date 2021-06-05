const passport = require('passport')
const localStrategy = require('passport-local').Strategy

const JWTstrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt

const UserModel = require('../models/user')

passport.use('signup',
    new localStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true }, async (req, email, password, done) => {
        try {
            const user = await UserModel.create({ email: email, password: password, name: req.body.name })
            return done(null, user)
        } catch (error) {
            // { MongoError: E11000 duplicate key error collection: fundalytica.users index: email_1 dup key: { email: "abc@xyz.com" }
            if (error.name == 'MongoError' && error.code == 11000) {
                error = { message: 'Email Not Available' }
            }
            // when user name is not privated but required
            else if(error.name == 'ValidationError') {
                error = { message: 'User Validation Failed' }
            }
            else {
                console.log(error)
            }

            done(error)
        }
    })
)

passport.use('login',
    new localStrategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {
        try {
            const user = await UserModel.findOne({ email })

            if (!user) return done(null, false, { message: 'User Not found' })

            const validate = await user.isValidPassword(password)

            if (!validate) return done(null, false, { message: 'Wrong Password' })

            return done(null, user, { message: 'Logged In' })
        } catch (error) {
            done(error)
        }
    })
)

const extractJWT = req => req.cookies.token

// passport.use(new JWTstrategy({ secretOrKey: process.env.TOKEN_SIGN_SECRET, jwtFromRequest: ExtractJWT.fromUrlQueryParameter(process.env.JWT_TOKEN_QUERY_PARAMETER) },
passport.use(new JWTstrategy({ secretOrKey: process.env.TOKEN_SIGN_SECRET, jwtFromRequest: extractJWT },
    async (token, done) => {
        try {
            return done(null, token.user)
        } catch (error) {
            done(error)
        }
    }
))