// https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie

export default class Cookie {
    constructor() {     }

    static get SEPARATOR() { return '; ' }
    static get DEFAULT_VALUE() { return 'y' }

    static set(key, value) {
        document.cookie = `${key}=${Cookie.DEFAULT_VALUE}${Cookie.SEPARATOR}samesite=strict${Cookie.SEPARATOR}`
    }

    static get(key) {
        try {
            return document.cookie.split(Cookie.SEPARATOR).find(row => row.startsWith(key)).split('=')[1]
        }
        catch(err) {
            return null
        }
    }

    static reset(key, value) {
        document.cookie = `${key}=${Cookie.DEFAULT_VALUE}${Cookie.SEPARATOR}samesite=strict${Cookie.SEPARATOR}max-age=0${Cookie.SEPARATOR}`
    }
}