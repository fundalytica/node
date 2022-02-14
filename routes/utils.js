const { PythonShell } = require('python-shell')

const shellHandler = (script, args, callback) => {
    console.log(`script: ${script} ${args.toString().replaceAll(","," ")}`.cyan)

    const options = { args: args, mode: 'json', pythonPath: process.env.SCRIPTS_PYTHON_PATH }

    PythonShell.run(script, options, (error, results) => {
        if (results && results.length > 1) {
            error = `results length: ${results.length}`
        }

        const json = error ? { error: error.message } : results[0]

        callback(json)
    })
}

module.exports = { shellHandler }