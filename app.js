require('dotenv').config()

const express = require('express')
const path = require('path')

const session = require('express-session')          // http://expressjs.com/en/resources/middleware/session.html
const MemoryStore = require('memorystore')(session) // https://www.npmjs.com/package/memorystore
const flash = require('connect-flash')

const vhost = require('vhost')                      // https://expressjs.com/en/resources/middleware/vhost.html
const cors = require('cors')                        // https://expressjs.com/en/resources/middleware/cors.html

const app = express()

app.set('view engine', 'pug')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
    cookie: { sameSite: 'strict', maxAge: 86400000 },
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false
}))
app.use(flash())

app.use(vhost('www.fundalytica.com', require('./routes/www')))
app.use(cors({ origin: 'https://www.fundalytica.com' }))
app.use(vhost('api.fundalytica.com', require('./routes/api')))

// 404 handler
app.use((req, res, next) => {
    const errors = require('http-errors')
    next(errors(404))
})

// error handler
app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.locals.message = error.message
    res.locals.error = (process.env.NODE_ENV === 'development') ? error : {}
    res.render('error')
})

app.locals.description = 'Searching for the best performing assets and building great investing tools.'
app.locals.subscribed_key = 'subscribed'

module.exports = app