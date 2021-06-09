const { PythonShell } = require('python-shell')

const shellHandler = (script, args, res) => {
    console.log(`script: ${script}`.cyan)

    const options = { args: args, mode: 'json' }

    PythonShell.run(script, options, (error, results) => {
        if (results && results.length > 1) {
            error = `results length: ${results.length}`
        }

        if (error) {
            res.json({ error: error.message })
            console.error(error)
        }
        else {
            res.json(results[0])
            // console.log(results)
        }
    })
}

module.exports = { shellHandler }