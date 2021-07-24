export default class UIUtils {
    static ready(fn) {
        if (document.readyState != 'loading') {
            fn()
        }
        else {
            document.addEventListener('DOMContentLoaded', fn)
        }
    }

    static scriptAttribute(scriptId, attr) {
        return document.querySelector(scriptId).getAttribute(attr)
    }

    static addClass(selector, className) {
        document.querySelectorAll(selector).forEach(el => el.classList.add(className))
    }

    static removeClass(selector, className) {
        document.querySelectorAll(selector).forEach(el => el.classList.remove(className))
    }

    static addListener(selector, event, handler) {
        document.querySelectorAll(selector).forEach(el => el.addEventListener(event, handler))
    }

    static removeListener(selector, event, handler) {
        document.querySelectorAll(selector).forEach(el => el.removeEventListener(event, handler))
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

    static empty(selector) {
        const el = document.querySelector(selector)
        while (el.firstChild) el.removeChild(el.firstChild)
    }

    static isHidden(selector) {
        const className = 'd-none'
        return document.querySelector(selector).classList.contains(className)
    }

    static populateDropdown(selector, values) {
        UIUtils.empty(selector)

        const dropdown = document.querySelector(selector)

        for (const value of values) {
            const li = document.createElement('li')
            const button = document.createElement('button')
            const text = document.createTextNode(value)

            button.setAttribute('type', 'button')
            button.classList.add('dropdown-item')

            dropdown.appendChild(li)
            li.appendChild(button)
            button.appendChild(text)
        }
    }
}