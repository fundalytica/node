const IDs = ['puts', 'calls']
const formats = {'strike': '0,0', 'basis': '$0,0'}

const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1)

const puts = data => data.filter(row => row.right == 'P')
const calls = data => data.filter(row => row.right == 'C')
const basis_sum = data => data.reduce((acc, val) => acc += parseFloat(val.basis), 0)
const expiration_format = expiration => `${expiration.substr(0,2)} ${capitalize(expiration.substr(2,3).toLowerCase())} '${expiration.substr(5,2)}`

const UILoading = options => {
    $('#date').addClass('d-none')

    $("#spinner").removeClass('d-none')
    $("#error").addClass('d-none')

    for(const id of IDs) {
        $(`#toggle-${id}`).addClass('d-none')
    }

    for(const id of IDs) {
        $(`#table-${id}`).addClass('d-none')
        $(`#table-${id} tbody`).empty()
    }

    $('#error').text('')
}

const UISuccess = (options, data) => {
    console.log(data.generated)
    console.log(data.positions)

    if(data.error) { return UIError(data.error) }
    $("#spinner").addClass('d-none')

    for(const id of IDs) {
        $(`#toggle-${id}`).removeClass('d-none')
    }

    for(const id of IDs) {
        $(`#table-${id}`).removeClass('d-none')
    }

    let date = data.generated.split(',')[0]
    let days = moment().diff(moment(date), 'days')
    date = moment(date).format('D MMM YYYY')

    $('#date').text(`Last Update: ${date}`)
    $('#date').removeClass('d-none')

    const css = days >= 7 ? 'text-danger' : 'text-secondary'
    $('#date').addClass(css)

    updateTables(data.positions)
}

const UIError = error => {
    $("#spinner").addClass('d-none')
    $('#error').text(`😭 ${error}`)
    $("#error").removeClass('d-none')
}

const updateTables = data => {
    const keys = Object.keys(data[0])
    keys.unshift('logo')

    const ignore = ['right']

    // header row
    let row = '<tr>'
    for(const key of keys) {
        if(! ignore.includes(key)) {
            row += `<th class="center-align align-middle">${key}</th>`
        }
    }
    row += '</tr>'
    // append
    for(const id of IDs) {
        $(`#table-${id} > thead`).append(row)
    }

    // count, sum text
    for(const id of IDs) {
        const right = (id == 'puts') ? 'P' : 'C'

        const count = ((id == 'puts') ? puts(data) : calls(data)).length
        const sum = basis_sum((id == 'puts') ? puts(data) : calls(data))

        const text = `${count} ${capitalize(id)} ${numeral(sum).format(formats['basis'])}`
        $(`#count-${id}`).text(text)
    }

    // for each position
    for(const item of data) {
        // put or call
        const id = (item.right == 'P') ? IDs[0] : IDs[1]

        // body row
        let row = '<tr>'
        for(const key of keys) {
            if(! ignore.includes(key)) {
                let value = item[key]

                if(formats[key]) value = numeral(value).format(formats[key])

                // if(key == 'logo') value = `<img onerror="this.style.display='none'" src="https://www.fundalytica.com/images/logos/stocks/${item.symbol.toLowerCase()}.svg" />`
                if(key == 'logo') value = `<img onerror="this.src='https://www.fundalytica.com/images/logos/stocks/${item.symbol.toLowerCase()}.png'" src="https://www.fundalytica.com/images/logos/stocks/${item.symbol.toLowerCase()}.svg" />`

                if(key == 'symbol') value = `<a href='https://www.tradingview.com/symbols/${value}' target='_blank'>\$${value}</a>`
                if(key == 'expiration') value = expiration_format(value)
                row += `<td class="center-align align-middle" data-title="${key}">${value}</td>`
            }
        }
        row += '</tr>'
        // append
        $(`#table-${id} > tbody:last-child`).append(row)
    }
}

const fetch = options => {
    UILoading(options)

    const url = 'https://api.fundalytica.com/v1/options/portfolio'

    $.ajax({ url: url })
        .done(data => UISuccess(options, data))
        .fail(() => UIError(`${url} fail`))
}

const run = () => {
    fetch({})
}

$(run)