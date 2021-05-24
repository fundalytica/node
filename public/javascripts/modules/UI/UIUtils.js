export default class UIUtils {
    static show(ids) {
        UIUtils.hide(ids, false)
    }

    static hide(ids, hide = true) {
        if (Array.isArray(ids)) {
            for (const id of ids) {
                UIUtils.hideId(id, hide)
            }
        }
        else {
            const id = ids
            UIUtils.hideId(id, hide)
        }
    }

    static hideId(id, hide) {
        if (hide) {
            $(`${id}`).addClass('d-none')
        }
        else {
            $(`${id}`).removeClass('d-none')
        }
    }

    static populateDropdown(dropdown, values) {
        $(dropdown).empty()

        for (const value of values) {
            const button = `<li><button class='dropdown-item' type='button'>${value}</button></li>`
            $(dropdown).append(button)
        }
    }
}