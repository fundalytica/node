import Utils from './Utils.js'

export default class CryptoData {
    constructor(api_origin) {
        this.api_origin = api_origin
    }

    init(done, fail) {
        const url = `${this.api_origin}/v1/crypto/portfolio`

        const doneCallback = data => {
            if (data.error) return fail(data.error)

            console.log(data)
            done()
        }

        Utils.request(url, null, doneCallback, fail)
    }
}