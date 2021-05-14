const { PythonShell } = require('python-shell')

const shellHandler = (script, args, res) => {
    const options = { args: args, mode: 'json' }

    PythonShell.run(script, options, (error, results) => {
        if (results.length > 1) {
            error = `results length: ${results.length}`
        }

        if (error) {
            res.json({ error: error })
            console.error(`error: %j`, error)
        }
        else {
            res.json(results[0])
            console.log(`results: %j`, results)
        }
    })
}

module.exports = { shellHandler }