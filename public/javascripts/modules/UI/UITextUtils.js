export default class UITextUtils {
    static updateText(element, text, blink = false) {
        const change = element.textContent != text

        if (change) {
            element.textContent = text
        }

        return change
    }

    static blinkText(element, text) {
        const change = UITextUtils.updateText(element, text, true)

        if (change) {
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