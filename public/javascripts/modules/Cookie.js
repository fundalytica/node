// https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie

export default class Cookie {
    constructor() { }

    static get SEPARATOR() { return '; ' }
    static get DEFAULT_VALUE() { return 'yes' }

    static set(key, value) {
        // https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
        // Intelligent Tracking Prevention (ITP), 7 days
        const expiration = new Date('2100-01-01T00:00:00') // 2100
        document.cookie = `${key}=${value}${Cookie.SEPARATOR}samesite=strict${Cookie.SEPARATOR}expires=${expiration.toUTCString()}${Cookie.SEPARATOR}`
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
        document.cookie = `${key}=${value}${Cookie.SEPARATOR}samesite=strict${Cookie.SEPARATOR}max-age=0${Cookie.SEPARATOR}`
    }

    static show() {
        console.log(document.cookie)
    }
}
