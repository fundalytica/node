import Utils from './modules/Utils.js'
import UIUtils from './modules/UI/UIUtils.js'
import UITextUtils from './modules/UI/UITextUtils.js'

const run = () => {
    const requestBody = params => {
        const data = new FormData(document.querySelector('form'))

        const body = {}
        params.forEach(p => body[p] = data.get(p))

        return JSON.stringify(body)
    }

    const initAuth = (id, params) => {
        UIUtils.addListener(`#${id}-form`, 'submit', e => {
            const url = `/${id}`

            const fail = error => {
                UIUtils.show('#error')
                UITextUtils.text('#error', error.message)
            }

            const done = res => {
                if(res.error) return fail(res.error)
                location.href = '/'
            }

            const options = {}
            options.headers = {'Content-Type': 'application/json'}
            options.method = 'POST'
            options.body = requestBody(params)

            Utils.request(url, options, done, fail)

            e.preventDefault()
        })
    }

    initAuth('login', ['email', 'password'])
    initAuth('signup', ['email', 'password', 'name'])
}

UIUtils.ready(run)