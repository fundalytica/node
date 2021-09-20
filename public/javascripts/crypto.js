import UIManager from './modules/UI/UIManager.js'
import UIUtils from './modules/UI/UIUtils.js'

import CryptoData from './modules/CryptoData.js'

const UI = new UIManager("#spinner", "#error")
const crypto = new CryptoData(window.api_origin)

const listSelector = '#list'

const run = () => {
    UI.loading()

    UIUtils.hide(listSelector)

    const done = () => {
        UI.ready()
        UIUtils.show(listSelector)
    }

    const fail = error => UI.error(error)

    crypto.init(done, fail)
}

UIUtils.ready(run)

