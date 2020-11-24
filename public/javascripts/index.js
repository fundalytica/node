const description = document.getElementById('indexjs').getAttribute('data-description')

const run = () => {
    const element = document.getElementById('description')

    const typewriter = new Typewriter(element, {
        delay: 0.05 * 1000,
        cursor: null
    })

    typewriter.typeString(description).start()
}

$(run())