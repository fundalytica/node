export default class UIUtils {
    static show(id) {
        UIUtils.hide(id, false)
    }

    static hide(id, hide = true) {
        if(hide) {
            $(`${id}`).addClass('d-none')
        }
        else {
            $(`${id}`).removeClass('d-none')
        }
    }
}