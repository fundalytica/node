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

// api.fundalytica.com/v1/quote/SPY
router.get('/v1/quote/:symbol', async (req, res) => {
    const symbol = req.params.symbol
    console.log('/v1/quote/' + symbol)
    // const args = ['/scripts/iex/iex-quote.py', '-s', symbol]
    const args = ['/scripts/yahoo/yahoo-quote.py', '-s', symbol]
    spawnHandler(args, res)
})

// api.fundalytica.com/v1/historical/QQQ
router.get('/v1/historical/:symbol', async (req, res) => {
    const symbol = req.params.symbol
    console.log('/v1/historical/' + symbol)
    const args = ['/scripts/yahoo/yahoo-historical.py', '-s', symbol]
    spawnHandler(args, res)
})

// api.fundalytica.com/v1/dip/TSLA-20
router.get('/v1/dip/:symbol-:dip', async (req, res) => {
    const symbol = req.params.symbol
    const dip = req.params.dip
    const provider = 'yahoo'
    console.log(`/v1/dip/${symbol}-${dip} (${provider})`)
    const args = ['/scripts/py-dip/dip.py', '-s', symbol, '-d', dip, '-p', provider]
    spawnHandler(args, res)
})

const spawnHandler = (args, res) => {
    const command = spawn('python3', args)

    stdout = ''
    command.stdout.on('data', data => {
        stdout += data
        // console.log(`[ stdout ] ${data}`)
    })

    stderr = ''
    command.stderr.on('data', data => {
        stderr += data
        console.error(`[ stderr ] ${data}`)
    })

    command.on('close', code => {
        if(stdout != '') {
            res.json(pythonScriptBufferToJSON(stdout))
        }
        else if(stderr != '') {
            res.send(stderr)
        }
    })

    command.on('error', error => {
        console.error(`[ error ] ${error}`)
        res.json({ error: error })
    })
}

module.exports = router