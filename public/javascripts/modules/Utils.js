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

    // Object Utils

    static reverse_object(obj) {
        const newObj = {}
        Object.keys(obj).reverse().forEach(x => { newObj[x] = obj[x] })
        return newObj
    }
}