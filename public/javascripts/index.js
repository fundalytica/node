const text = ' Do not miss any updates. Join us!'

const run = () => {
    const element = document.getElementById('join-us')

    if(element) {
        const typewriter = new Typewriter(element, {
            delay: 0.05 * 1000,
            cursor: null
        })

        typewriter.typeString(text).start()
    }
}

$(run())