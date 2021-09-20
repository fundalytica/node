export default class Utils {
    constructor() { }

    // Network

    static request(url, options, done, fail = console.log) {
        const errorHandling = response => {
            if (! response.ok) {
                throw Error(`${url} - ${response.status} (${response.statusText})`)
            }

            return response
        }

        fetch(url, options)
            .then(errorHandling)
            .then(response => response.json().then(done))
            .catch(fail)
    }

    // Array Utils

    static chunk(array, size) {
        const chunked_arr = []
        let copied = [...array]

        const numOfChild = Math.ceil(copied.length / size)
        for (let i = 0; i < numOfChild; i++) {
            chunked_arr.push(copied.splice(0, size))
        }

        return chunked_arr
    }

    static propertyTotal(array, key) {
        return array.reduce((acc, val) => acc += parseFloat(val[key]), 0)
    }

    // Common Elements

    static intersection(a, b) {
        return a.filter(x => b.includes(x))
    }

    // Not Common Elements

    static difference(a, b) {
        return a.filter(x => !b.includes(x))
    }

    // Object Utils

    static reverse_object(obj) {
        const newObj = {}
        Object.keys(obj).reverse().forEach(x => { newObj[x] = obj[x] })
        return newObj
    }
}