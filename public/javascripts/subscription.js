const subscription = document.getElementById('subscriptionjs').getAttribute('data-subscription')
const subscribed_key = document.getElementById('subscriptionjs').getAttribute('data-subscribed-key')

import Cookie from './modules/Cookie.js'

const run = () => {
    if(! Cookie.get(subscribed_key) && subscription == 'success') {
        Cookie.set(subscribed_key)
        $('#welcome').delay(1000 * 2).slideUp(1000 * 3)
    }
}

// const test = () => {
//     Cookie.reset(subscribed_key)
//     Cookie.set(subscribed_key)
//     console.log(document.cookie)
// }

$(run())