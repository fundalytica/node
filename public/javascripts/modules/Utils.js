export default class Utils {
    constructor() { }

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

    // Common Elements

    static intersection(a,b) {
        return a.filter(x => b.includes(x))
    }

    // Not Common Elements

    static difference(a,b) {
        return a.filter(x => ! b.includes(x))
    }

    // Object Utils

    static reverse_object(obj) {
        const newObj = {}
        Object.keys(obj).reverse().forEach(x => { newObj[x] = obj[x] })
        return newObj
    }
}