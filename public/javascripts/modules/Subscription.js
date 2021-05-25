import UIUtils from './UI/UIUtils.js'
import UIAnimationUtils from './UI/UIAnimationUtils.js'

import Storage from './Storage.js'

export default class Subscription {
    constructor(scriptId, elementId) {
        this.subscription = UIUtils.scriptAttribute(scriptId, 'data-subscription')
        this.subscribed_key = UIUtils.scriptAttribute(scriptId, 'data-subscribed-key')

        this.elementId = elementId
    }

    isSubscribed() {
        return (Storage.get(this.subscribed_key) !== undefined)
    }

    success() {
        if (!UIUtils.isHidden(this.elementId)) {
            if (this.subscription == 'success') {
                Storage.set(this.subscribed_key, Storage.DEFAULT_VALUE)

                setTimeout(() => {
                    UIAnimationUtils.slideUp(document.querySelector(this.elementId), 1000 * 3)
                }, 1000 * 2)
            }
        }
    }

    hide() {
        if (this.isSubscribed()) {
            UIUtils.hide(this.elementId)
        }
    }
}