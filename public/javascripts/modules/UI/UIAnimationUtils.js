export default class UIAnimationUtils {
    // https://dev.to/bmsvieira/vanilla-js-slidedown-up-4dkn
    static slideUp(target, duration) {
        target.style.transitionDuration = duration + 'ms'
        target.style.transitionProperty = 'height, margin, padding'
        target.style.height = target.offsetHeight + 'px'
        target.offsetHeight

        target.style.boxSizing = 'border-box'
        target.style.overflow = 'hidden'

        const properties = ['height', 'padding-top', 'padding-bottom', 'margin-top', 'margin-bottom']
        properties.forEach(p => target.style[p] = 0)

        window.setTimeout(() => {
            target.style.display = 'none'

            const properties = ['height', 'padding-top', 'padding-bottom', 'margin-top', 'margin-bottom', 'overflow', 'transition-duration', 'transition-property']
            properties.forEach(p => target.style.removeProperty(p))

        }, duration)
    }
}