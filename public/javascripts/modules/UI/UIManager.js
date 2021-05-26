import UIUtils from './UIUtils.js'

export default class UIManager {
    constructor(spinnerId, errorId) {
        this.spinnerId = spinnerId
        this.errorId = errorId
    }

    loading() {
        UIUtils.show(this.spinnerId)
        UIUtils.hide(this.errorId)

        document.querySelector(this.errorId).textContent = ''
    }

    error(error) {
        UIUtils.hide(this.spinnerId)
        UIUtils.show(this.errorId)
        document.querySelector(this.errorId).textContent = `😭 ${error}`
    }

    ready() {
        UIUtils.hide(this.spinnerId)
    }
}
