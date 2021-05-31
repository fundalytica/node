import UIUtils from './modules/UI/UIUtils.js'
import UITextUtils from './modules/UI/UITextUtils.js'

const run = () => {
    console.log('hello')

    let count = 1

    const blinkIt = () => {
        UITextUtils.blinkText('p', count.toString())
        count++
    }

    setInterval(blinkIt, 100)
}

UIUtils.ready(run)