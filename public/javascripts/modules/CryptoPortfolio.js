import Utils from './Utils.js'

export default class CryptoData {
    constructor(api_origin) {
        this.api_origin = api_origin
    }

    init(done, fail) {
        const url = `${this.api_origin}/v1/crypto/portfolio`

        const requestCallback = data => {
            if (data.error) {
                console.log(`${url} [𝗑]`)
                return fail(data.error)
            }

            console.log(`${url} [✓]`)
            done(data)
        }

        Utils.request(url, null, requestCallback, fail)
    }
}