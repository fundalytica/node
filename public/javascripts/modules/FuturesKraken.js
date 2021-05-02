export default class FuturesKraken {
    constructor(token) {
        this.baseURL = 'https://futures.kraken.com/derivatives/api/v3'
        this.tickersURL = `${this.baseURL}/tickers`
    }

    futures(symbols, callback) {
        // const url = this.url

        const success = result => {
            console.log(result)
        }

        $.ajax({
            url: this.tickersURL,
            dataType: 'jsonp',
            success: success
        })
    }
}