// https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

export default class Storage {
    constructor() { }

    static get DEFAULT_VALUE() { return 'yes' }

    static set(key, value) {
        localStorage.setItem(key, value)
    }

    static get(key) {
        return localStorage.getItem(key)
    }

    static reset(key) {
        localStorage.removeItem(key)
    }

    static show() {
        console.log(localStorage)
    }

    static test() {
        Storage.reset('test')
        Storage.set('test', Storage.DEFAULT_VALUE)
        Storage.show()
    }
}
