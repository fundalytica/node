require('dotenv').config()

const fs = require('fs')

const express = require('express')
const path = require('path')

const session = require('express-session')              // http://expressjs.com/en/resources/middleware/session.html
// const MemoryStore = require('memorystore')(session)  // https://www.npmjs.com/package/memorystore
const MongoStore = require('connect-mongo')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

const vhost = require('vhost')                      // https://expressjs.com/en/resources/middleware/vhost.html
const cors = require('cors')                        // https://expressjs.com/en/resources/middleware/cors.html

const app = express()

const mongoose = require('mongoose')
const UserModel = require('./models/user')

const passport = require('passport')
require('./auth/auth')

const database = 'mongodb://localhost/fundalytica'
mongoose.connect(database, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
mongoose.connection.on('error', error => console.log(error))

app.set('view engine', 'pug')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')))

app.enable('trust proxy')
const cookie = { httpOnly: true, secure: (process.env.SCHEME != 'http'), sameSite: 'strict' }
// const store = new MemoryStore()
const store = MongoStore.create({ mongoUrl: database })
app.use(session({ secret: process.env.SESSION_SECRET, cookie: cookie, store: store, resave: false, saveUninitialized: false }))
app.use(cookieParser())
app.use(flash())

const origin = `${process.env.SCHEME}://${process.env.DOMAIN}${process.env.PROXY ? ':' + process.env.PORT : ''}`
app.use(cors({ origin: origin }))

// use routes
const domain = process.env.DOMAIN
const wwwRoutes = ['www', 'user', 'secure']
const apiRoutes = ['api']
// add all routes in api subfolder
fs.readdirSync('./routes/api').forEach(f => apiRoutes.push(`api/${f.replace('.js', '')}`))

// accept both naked domain and www
wwwRoutes.forEach(route => app.use(vhost(`${domain}`, require(`./routes/${route}`))))
wwwRoutes.forEach(route => app.use(vhost(`www.${domain}`, require(`./routes/${route}`))))
apiRoutes.forEach(route => app.use(vhost(`api.${domain}`, require(`./routes/${route}`))))

// 404 handler
app.use((req, res, next) => next(require('http-errors')(404)))

// error handler
app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.locals.message = error.message
    res.locals.error = (process.env.NODE_ENV == 'development') ? error : {}
    res.render('error')
})

// app locals
app.locals.flash_subscription_key = 'subscription'
app.locals.description = 'Searching for the best performing assets and building great investing tools.'
app.locals.api_origin = `${process.env.SCHEME}://${process.env.API_DOMAIN}${process.env.PROXY ? ':' + process.env.PORT : ''}`

module.exports = app
