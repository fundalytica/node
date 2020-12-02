import Storage from './Storage.js'

export default class Subscription {
    constructor(script, element) {
        this.subscription = $(script).attr('data-subscription')
        this.subscribed_key = $(script).attr('data-subscribed-key')
        this.element = element
    }

    isSubscribed() {
        return (Storage.get(this.subscribed_key) !== undefined)
    }

    hide() {
        if(this.isSubscribed()) {
            $(this.element).hide()
        }
    }

    success() {
        if(! $(this.element).is(":hidden")) {
            if(this.subscription == 'success') {
                Storage.set(this.subscribed_key, Storage.DEFAULT_VALUE)
                $(this.element).delay(1000 * 2).slideUp(1000 * 3)
            }
        }
    }
}