const fs = require('fs')

const dotenv = require('dotenv')
dotenv.config()
// output env
for(const key in dotenv.parse(fs.readFileSync('.env'))) {
    console.log(`${key}: ${process.env[key]}`)
}

const path = require('path')
const express = require('express')

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

const database = `mongodb://localhost/fundalytica_${process.env.NODE_ENV}`
mongoose.connect(database, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
mongoose.connection.on('error', error => console.log(error))

app.set('view engine', 'pug')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')))

// live reload
if(process.env.NODE_ENV == 'development') {
    // watches directory
    const livereload = require('livereload')
    const liveReloadServer = livereload.createServer( { delay: 100 } )
    liveReloadServer.watch(path.join(__dirname, 'public'))

    // injects reload js into every page
    const connectLivereload = require("connect-livereload")
    app.use(connectLivereload())

    // signal browser when the server just got up
    liveReloadServer.server.once('connection', () => {
        setTimeout(() => {
            liveReloadServer.refresh("/")
        }, 100)
    })
}

app.enable('trust proxy')
const cookie = { httpOnly: true, secure: (process.env.SCHEME != 'http'), sameSite: 'strict' }
// const store = new MemoryStore()
const store = MongoStore.create({ mongoUrl: database })
app.use(session({ secret: process.env.SESSION_SECRET, cookie: cookie, store: store, resave: false, saveUninitialized: false }))
app.use(cookieParser())
app.use(flash())

// port string
const PORT_STRING = (process.env.PROXY == 'false') ? (':' + process.env.PORT) : ''
console.log(`PORT_STRING ${PORT_STRING}`)

// api domain not provided, use domain
if(! process.env.API_DOMAIN) process.env.API_DOMAIN = process.env.DOMAIN
// api path not provided, use empty string
if(! process.env.API_PATH) process.env.API_PATH = ''

// cors
app.use(cors({ origin: `${process.env.SCHEME}://${process.env.DOMAIN}${PORT_STRING}` }))

// www routes
const wwwRoutes = ['www', 'user', 'secure']
// set www routes
wwwRoutes.forEach(route => app.use(vhost(process.env.DOMAIN, require(`./routes/${route}`))))

// api routes
const apiRoutes = ['api']
// add all routes in api subfolder
fs.readdirSync('./routes/api').forEach(f => apiRoutes.push(`api/${f.replace('.js', '')}`))
// set api routes
apiRoutes.forEach(route => app.use(vhost(process.env.API_DOMAIN, require(`./routes/${route}`))))

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
app.locals.api_origin = `${process.env.SCHEME}://${process.env.API_DOMAIN}${PORT_STRING}${process.env.API_PATH}`

module.exports = app