export default class UIManager {
    constructor(spinner, error) {
        this.spinner = spinner
        this.error = error
    }

    loading() {
        $(this.spinner).removeClass('d-none')

        $(this.error).addClass('d-none')
        $(this.error).text('')
    }

    error(error) {
        $(this.spinner).addClass('d-none')

        $(this.error).text(`😭 ${error}`)
        $(this.error).removeClass('d-none')
    }

    ready() {
        $(this.spinner).addClass('d-none')
    }
}
