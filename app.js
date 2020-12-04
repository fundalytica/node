const express = require('express')
const path = require('path')
const createError = require('http-errors')

const session = require('express-session')
const MemoryStore = require('memorystore')(session)

const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(express.static(path.join(__dirname, 'public')))

// http://expressjs.com/en/resources/middleware/session.html
// https://www.npmjs.com/package/memorystore
app.use(session({
    cookie: { maxAge: 86400000 },                       // 24h
    store: new MemoryStore({ checkPeriod: 86400000 }),  // 24h check period
    secret: 'Ph3nrta6W4BfDp7MRkhR',                     // random secret
    saveUninitialized: false,
    resave: false,
    cookie: { sameSite: 'strict' }
}))
app.use(flash())

// https://expressjs.com/en/resources/middleware/cors.html
const cors = require('cors')
const corsOptions = { origin: 'https://www.fundalytica.com' }
app.use(cors(corsOptions))

// https://expressjs.com/en/resources/middleware/vhost.html
const vhost = require('vhost')
app.use(vhost('www.fundalytica.com', require('./routes/www')))
app.use(vhost('api.fundalytica.com', require('./routes/api')))

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.locals.message = err.message
    // error details only in development
    res.locals.error = req.app.get('env') === 'development' ? err : {}
    res.render('error')
})

module.exports = app