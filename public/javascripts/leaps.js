const IDs = ['puts', 'calls', 'warrants']
const currency_fmt = '$0,0'
const formats = { strike: '0,0.0', basis: currency_fmt, value: currency_fmt, profit: currency_fmt }

const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1)
const expiration_format = expiration => `${expiration.substr(0,2)} ${capitalize(expiration.substr(2,3).toLowerCase())} '${expiration.substr(5,2)}`
const moment_expiration_format = "DD MMM 'YY"

const puts = data => data.filter(row => row.right == 'P')
const calls = data => data.filter(row => row.right == 'C')
const total = (data, prop) => data.reduce((acc, val) => acc += parseFloat(val[prop]), 0)
const assign_total = data => data.reduce((acc, val) => acc += parseFloat(val.strike * val.quantity * 100), 0)
const current_value = data => data.price * data.quantity * 100

let globalData = null

let currentSort = null
let currentOrder = null
const sortOptions = ['symbol','expiration','basis','value','profit']

const hideIDElements = (id, hide = true) => {
    if(hide) {
        $(`#toggle-${id}`).addClass('d-none')
        $(`#info-${id}`).removeClass('d-flex')
        $(`#info-${id}`).addClass('d-none')
        $(`#table-${id}`).addClass('d-none')
    }
    else {
        $(`#toggle-${id}`).removeClass('d-none')
        $(`#info-${id}`).addClass('d-flex')
        $(`#info-${id}`).removeClass('d-none')
        $(`#table-${id}`).removeClass('d-none')
    }
}

const UILoading = options => {
    $('#date').addClass('d-none')
    $(`#dropdown-sort`).addClass('d-none')
    $(`#btn-group-order`).addClass('d-none')

    $("#spinner").removeClass('d-none')

    $("#error").addClass('d-none')
    $('#error').text('')

    clearTables()

    for(const id of IDs) {
        hideIDElements(id)
    }
}

const UISuccess = (options, data) => {
    console.log(data)

    if(data.error) { return UIError(data.error) }

    $("#spinner").addClass('d-none')
    $(`#btn-group-order`).removeClass('d-none')

    updateDate(data.generated)

    currentSort = sortOptions[0]
    currentOrder = 'asc'
    updateDropdown()

    manipulateData(data.positions)

    updateTables(data.positions)
}

const UIError = error => {
    $("#spinner").addClass('d-none')

    $('#error').text(`😭 ${error}`)
    $("#error").removeClass('d-none')
}

const manipulateData = data => {
    for(const item of data) {
        // calculate value
        item.value = current_value(item)
        // delete price
        delete item.price
        item.profit = item.value - item.basis
    }
}

const updateDate = generated => {
    let date = generated.split(',')[0]

    const days = moment().diff(moment(date), 'days')
    const css = days >= 7 ? 'text-danger' : 'text-secondary'
    $('#date').addClass(css)

    date = moment(date).format('D MMM YYYY')
    $('#date').text(`Last Update: ${date} (${days}d ago)`)

    $('#date').removeClass('d-none')
}

const updateDropdown = () => {
    $('#dropdown-sort').text(`Sorted by ${currentSort}`)

    $('#dropdown-menu-sort').empty()
    for(const option of sortOptions) {
        const button = `<li><button class='btn-sm dropdown-item' type='button'>${option}</button></li>`
        $('#dropdown-menu-sort').append(button)
    }

    $(`#dropdown-sort`).removeClass('d-none')

    $(".dropdown-menu button").off()
    $(".dropdown-menu button").click(e => {
        currentSort = $(e.currentTarget).text()
        updateDropdown()
        clearTables()
        updateTables(globalData.positions)
    })
}

const clearTables = () => {
    for(const id of IDs) {
        $(`#table-${id} thead`).empty()
        $(`#table-${id} tbody`).empty()
    }
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

    for(const id of IDs) {
        if(['puts','calls'].includes(id)) {
            const options_data = (id == 'puts') ? puts(data) : calls(data)

            // info text
            const count = options_data.length
            if(count) {
                let text = `${count} ${capitalize(id)}`
                $(`#count-${id}`).text(text)

                text = `Basis ${numeral(total(options_data, 'basis')).format(currency_fmt)}`
                $(`#basis-${id}`).text(text)

                text = `Value ${numeral(total(options_data, 'value')).format(currency_fmt)}`
                $(`#value-${id}`).text(text)

                text = `Profit ${numeral(total(options_data, 'profit')).format(currency_fmt)}`
                $(`#profit-${id}`).text(text)

                text = `Assignment ${numeral(assign_total(options_data)).format(currency_fmt)}`
                $(`#assignment-${id}`).text(text)
            }

            sortData(options_data)

            // for each position
            for(const item of options_data) {
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

            hideIDElements(id, (count == 0))
        }

        // if(id == 'warrants') {
        //     const count = 0

        //     if(count) {
        //         let text = `${count} ${capitalize(id)}`
        //         $(`#count-${id}`).text(text)
        //     }

        //     hideIDElements(id, (count == 0))
        // }
    }
}

const sortData = (data, asc = true) => {
    asc = (currentOrder == 'asc') ? 1 : -1

    if(currentSort == 'symbol') {
        data.sort((a,b) => {
            return String(a[currentSort]).localeCompare(String(b[currentSort])) * asc
        })
    }
    else if(currentSort == 'expiration') {
        data.sort((a,b) => {
            return (moment(a[currentSort], moment_expiration_format) - moment(b[currentSort], moment_expiration_format)) * asc
        })
    }
    else if(['basis','value'].includes(currentSort)) {
        data.sort((a,b) => {
            return (parseFloat(a[currentSort]) - parseFloat(b[currentSort])) * asc
        })
    }
    else {
        data.sort((a,b) => {
            return (parseFloat(a[currentSort]) - parseFloat(b[currentSort])) * asc
        })
    }
}

const fetch = options => {
    UILoading(options)

    const url = 'https://api.fundalytica.com/v1/options/portfolio'

    $.ajax({ url: url })
        .done(data => {
            globalData = data
            UISuccess(options, data)
        })
        .fail(() => UIError(`${url} fail`))
}

const setupEvents = () => {
    $("#btn-group-order .btn-check").click(e => {
        currentOrder = (e.currentTarget.id == 'btn-radio-asc') ? 'asc' : 'desc'
        console.log(currentOrder)
        clearTables()
        updateTables(globalData.positions)
    })
}

const run = () => {
    setupEvents()
    fetch({})
}

$(run)