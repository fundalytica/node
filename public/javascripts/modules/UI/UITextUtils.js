export default class UITextUtils {
    static updateText(element, text, blink = false) {
        const change = element.text() != text

        if (change) {
            element.text(text)
        }

        return change
    }

    static blinkText(element, text) {
        const change = UITextUtils.updateText(element, text, true)

        if(change) {
            UITextUtils.blink(element)
        }
    }

    static blink(element) {
        element.finish()
        element.animate({ opacity: .5 }, 100, "linear", function () {
            $(this).animate({ opacity: 1 }, 100)
        })
    }
}