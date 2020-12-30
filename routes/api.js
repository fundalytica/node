const express = require('express')
const router = express.Router()

const { spawn } = require('child_process')

router.get('/', (req, res, next) => {
    res.render('api', {
        text: 'Fundalytica API',
        urls: [
            '/v1/quote/:symbol',
            '/v1/historical/:symbol',
            '/v1/historical/ath/:symbol',
            '/v1/historical/dip/:symbol-:dip'
        ]
    })
})

const provider = 'yahoo'

router.get('/v1/quote/:symbol', async (req, res) => {
    const symbol = req.params.symbol
    console.log('/v1/quote/' + symbol)
    // const args = ['/scripts/iex/iex-quote.py', '-s', symbol]
    const args = ['/scripts/yahoo/yahoo-quote.py', '-s', symbol]
    spawnHandler(args, res)
})

router.get('/v1/historical/:symbol', async (req, res) => {
    const symbol = req.params.symbol
    console.log('/v1/historical/' + symbol)
    // const args = ['/scripts/yahoo/yahoo-historical.py', '-s', symbol]
    const args = ['/scripts/py-historical/historical.py', '-s', symbol, '-p', provider]
    spawnHandler(args, res)
})
router.get('/v1/historical/ath/:symbol', async (req, res) => {
    const symbol = req.params.symbol
    console.log(`/v1/ath/${symbol} (${provider})`)
    const args = ['/scripts/py-historical/historical.py', '-s', symbol, '-p', provider, '--ath']
    spawnHandler(args, res)
})
router.get('/v1/historical/dip/:symbol-:dip', async (req, res) => {
    const symbol = req.params.symbol
    const dip = req.params.dip
    console.log(`/v1/dip/${symbol}-${dip} (${provider})`)
    const args = ['/scripts/py-historical/historical.py', '-s', symbol, '-p', provider, '--dip', dip]
    spawnHandler(args, res)
})

const spawnHandler = async (args, res) => {
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
            try {
                res.json(JSON.parse(stdout))
            }
            catch (e) {
                console.log(e)
            }
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