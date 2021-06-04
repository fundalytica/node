import UIUtils from './modules/UI/UIUtils.js'
import UITextUtils from './modules/UI/UITextUtils.js'

const run = () => {
    const toggleLink = () => {
        document.querySelector('#show-signup').classList.toggle('d-none')
        document.querySelector('#show-login').classList.toggle('d-none')
    }

    UIUtils.addListener('#show-signup', 'click', () => {
        toggleLink()

        UITextUtils.text('#submit', 'Sign Up')
        document.querySelector('#form').setAttribute("action", "/signup")
    })

    UIUtils.addListener('#show-login', 'click', () => {
        toggleLink()
        UITextUtils.text('#submit', 'Log In')
        document.querySelector('#form').setAttribute("action", "/login")
    })
}

UIUtils.ready(run)