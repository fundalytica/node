require('dotenv').config()

const express = require('express')
const path = require('path')

const session = require('express-session')          // http://expressjs.com/en/resources/middleware/session.html
const MemoryStore = require('memorystore')(session) // https://www.npmjs.com/package/memorystore
const flash = require('express-flash')

const vhost = require('vhost')                      // https://expressjs.com/en/resources/middleware/vhost.html
const cors = require('cors')                        // https://expressjs.com/en/resources/middleware/cors.html

const app = express()

const mongoose = require('mongoose')
const UserModel = require('./models/user')

const passport = require('passport')
require('./auth/auth')

mongoose.connect('mongodb://localhost/fundalytica', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
mongoose.connection.on('error', error => console.log(error))

app.set('view engine', 'pug')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')))

app.use(session({ cookie: { sameSite: 'strict', maxAge: 86400000 }, store: new MemoryStore({ checkPeriod: 86400000 }), secret: process.env.SESSION_SECRET, saveUninitialized: false, resave: false }))
app.use(flash())

app.use(cors({ origin: 'https://www.fundalytica.com' }))

app.use(vhost('www.fundalytica.com', require('./routes/www')))
app.use(vhost('www.fundalytica.com', require('./routes/user')))
app.use(vhost('www.fundalytica.com', require('./routes/secure')))

app.use(vhost('api.fundalytica.com', require('./routes/api')))
app.use(vhost('api.fundalytica.com', require('./routes/api/options')))
app.use(vhost('api.fundalytica.com', require('./routes/api/crypto')))

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

// universal description
app.locals.description = 'Searching for the best performing assets and building great investing tools.'

module.exports = app