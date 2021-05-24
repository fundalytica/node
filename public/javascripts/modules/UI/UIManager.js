export default class UIManager {
    constructor(spinnerId, errorId) {
        this.spinnerId = spinnerId
        this.errorId = errorId
    }

    loading() {
        $(this.spinnerId).removeClass('d-none')

        $(this.errorId).addClass('d-none')
        $(this.errorId).text('')
    }

    error(error) {
        $(this.spinnerId).addClass('d-none')

        $(this.errorId).text(`😭 ${error}`)
        $(this.errorId).removeClass('d-none')
    }

    ready() {
        $(this.spinnerId).addClass('d-none')
    }
}
