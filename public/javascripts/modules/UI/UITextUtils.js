export default class UITextUtils {
    static text(selector, string) {
        document.querySelector(selector).textContent = string
    }

    static blinkText(selector, string) {
        const element = document.querySelector(selector)
        const change = element.textContent != string

        if (change) {
            element.textContent = string
            UITextUtils.blink(element)
        }
    }

    static blink(element, done) {
        const blinkClass = 'blink'
        const attribute = 'animating'

        if (element.getAttribute(attribute)) return

        element.classList.add(blinkClass)
        element.setAttribute(attribute, '...')

        const clearAnimation = () => {
            element.classList.remove(blinkClass)
            element.removeAttribute(attribute)
            element.style.opacity = 1
        }

        setTimeout(clearAnimation, 500)
    }
}