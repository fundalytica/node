export default class UIUtils {
    static ready(fn) {
        if (document.readyState != 'loading') {
            fn()
        }
        else {
            document.addEventListener('DOMContentLoaded', fn)
        }
    }

    static show(selector) {
        UIUtils.hide(selector, false)
    }

    static hide(selector, hide = true) {
        const elements = document.querySelectorAll(selector)
        elements.forEach(el => UIUtils.hideElement(el, hide))
    }

    static hideElement(el, hide) {
        const className = 'd-none'

        if (hide) {
            el.classList.add(className)
        }
        else {
            el.classList.remove(className)
        }
    }

    static showMany() {

    }

    static hideMany() {

    }

    static isHidden(selector) {
        const className = 'd-none'
        return document.querySelector(selector).classList.contains(className)
    }

    static populateDropdown(dropdown, values) {
        $(dropdown).empty()

        for (const value of values) {
            const button = `<li><button class='dropdown-item' type='button'>${value}</button></li>`
            $(dropdown).append(button)
        }
    }
}