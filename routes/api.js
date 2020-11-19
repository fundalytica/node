const express = require('express')
const router = express.Router()

const { spawn } = require('child_process')

const pythonScriptBufferToJSON = data => {
    // convert buffer to string
    data = data.toString()

    // remove new lines
    data = data.replace(/\n/g, '')

    // replace single quotes with double quotes
    data = data.replace(/\'/g, '\"')

    // replace None/True/False with null/true/false
    data = data.replace(/None/g, 'null')
    data = data.replace(/True/g, 'true')
    data = data.replace(/False/g, 'false')

    try {
        data = JSON.parse(data)
    }
    catch (e) {
        console.log(e)
    }

    return data
}

router.get('/', (req, res, next) => {
    res.render('index', { title: 'Fundalytica API' })
})

// v1/quote/SPY
router.get('/v1/quote/:symbol', async (req, res) => {
    const symbol = req.params.symbol
    console.log('/v1/quote/' + symbol)
    // const args = ['/scripts/iex/iex-quote.py', '-s', symbol]
    const args = ['/scripts/yahoo/yahoo-quote.py', '-s', symbol]
    spawnHandler(args, res)
})

// v1/historical/QQQ
router.get('/v1/historical/:symbol', async (req, res) => {
    const symbol = req.params.symbol
    console.log('/v1/historical/' + symbol)
    const args = ['/scripts/yahoo/yahoo-historical.py', '-s', symbol]
    spawnHandler(args, res)
})

// v1/dips/TSLA-20
router.get('/v1/dips/:symbol-:percentage', async (req, res) => {
    const symbol = req.params.symbol
    const percentage = req.params.percentage
    console.log(`/v1/dips/${symbol}-${percentage}`)

    const args = ['/scripts/stocks/dips.py', '-s', symbol, '-p', percentage]
    spawnHandler(args, res)
})

const spawnHandler = (args, res) => {
    const command = spawn('python3', args)

    stdout = ''

    command.stdout.on('data', data => {
        // console.log(`[ stdout ] ${data}`)
        stdout += data
    })
    command.on('close', code => {
        res.json(pythonScriptBufferToJSON(stdout))
    })

    command.stderr.on('data', data => {
        console.error(`[ stderr ] ${data}`)
    })
    command.on('error', error => {
        console.error(`[ error ] ${error}`)
        res.json({ error: error })
    })
}

module.exports = router