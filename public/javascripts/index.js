import Subscription from './modules/Subscription.js'

const run = () => {
    $('.topic').show()

    const subscription = new Subscription('#indexjs', '#welcome')
    // subscription.hide()
    subscription.success()

    // if(! $('#welcome').is(":hidden")) {
    //     typewrite('Do not miss any updates. Join now!', 'join')
    // }
}

const typewrite = (text, id) => {
    const textElement = document.getElementById(id)

    if(textElement) {
        const typewriter = new Typewriter(textElement, { delay: 0.05 * 1000, cursor: null })
        typewriter.typeString(text).start()
    }
}

$(run())