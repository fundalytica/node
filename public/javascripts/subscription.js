const subscription_url = document.getElementById('subscriptionjs').getAttribute('data-subscription-url')
const subscribed_key = document.getElementById('subscriptionjs').getAttribute('data-subscribed-key')

import Cookie from './modules/Cookie.js'

const run = () => {
    if(! Cookie.get(subscribed_key) && subscription_url == 'success') {
        Cookie.set(subscribed_key)
        $('#welcome').delay(1000 * 2).slideUp(1000 * 3)
    }
}

const test = () => {
    Cookie.reset(subscribed_key)
    Cookie.set(subscribed_key)
    console.log(document.cookie)
}

$(run())