import UIManager from './modules/UI/UIManager.js'
import UIUtils from './modules/UI/UIUtils.js'
import UITextUtils from './modules/UI/UITextUtils.js'
import UITableUtils from './modules/UI/UITableUtils.js'

import StringUtils from './modules/StringUtils.js'

import CryptoPortfolio from './modules/CryptoPortfolio.js'
import CryptoBinance from './modules/Crypto/CryptoBinance.js'

const UI = new UIManager("#spinner", "#error")

const crypto = new CryptoPortfolio(window.api_origin)
const binance = new CryptoBinance()

const demoTextSelector = '#demoText'
const messageSelector = "#message"

const createButtonSelector = "#createButton"
const updateButtonSelector = "#updateButton"
const updateFormSelector = "#updateForm"

const positionsSelector = '#positions'
const tradesSelector = '#trades'

const data = { positions: null, trades: null, ticker: null }

const state = {
    loading: false,

    user: false,
    demo: false,

    message: null,

    input: false,
    trades: false,

    delete: null,
}

let autoCompleteJS = null

const initDateInput = () => {
    const htmlFormat = date => date.toISOString().slice(0, 10)

    const past = '2009-01-03' // Bitcoin
    const today = htmlFormat(new Date())

    const id = "dateInput"
    document.getElementById(id).setAttribute("min", past)
    document.getElementById(id).setAttribute("max", today)
    document.getElementById(id).setAttribute("value", today)
}

const initAutoComplete = () => {
    autoCompleteJS = new autoComplete({
        selector: "#symbolInput",
        placeHolder: "symbol",
        data: {
            cache: true
        },
        resultItem: {
            highlight: true
        },
        events: {
            input: {
                selection: (event) => {
                    const selection = event.detail.selection.value
                    autoCompleteJS.input.value = selection
                }
            }
        }
    })
}

const symbolName = symbol => {
    const symbolNames = { 'btc': 'Bitcoin', 'eth': 'Ethereum', 'dot': 'Polkadot', 'doge': 'Dogecoin' }
    const name = symbolNames[symbol.toLowerCase()]
    return name ? name : symbol.toUpperCase()
}

const updateUI = () => {
    UIUtils.hide(messageSelector)

    if(state.loading) {
        UIUtils.hide(demoTextSelector)
        UIUtils.hide(createButtonSelector)
        UIUtils.hide(updateButtonSelector)
        UIUtils.hide(updateFormSelector)
        UIUtils.hide(positionsSelector)
        UIUtils.hide(tradesSelector)
    }

    if(! state.loading) {
        if(state.demo) {
            UIUtils.show(demoTextSelector)
            UIUtils.show(createButtonSelector)
        }

        if(! state.demo) {
            UIUtils.show(updateButtonSelector)
        }

        UIUtils.show(positionsSelector)

        if(state.input) {
            UIUtils.show(updateFormSelector)

            UIUtils.hide(demoTextSelector)
            UIUtils.hide(createButtonSelector)
            UIUtils.hide(updateButtonSelector)

            if(state.demo) {
                UIUtils.hide(positionsSelector)
            }
        }
        else {
            UIUtils.hide(updateFormSelector)
        }

        if(state.trades) {
            UIUtils.show(tradesSelector)
        }
        else {
            UIUtils.hide(tradesSelector)
        }

        // reset all position controls
        UIUtils.show(`.positionControls`)
        UIUtils.hide(`.positionDelete`)

        if(state.delete) { // position selected for deletion
            UIUtils.hide(`#S-${state.delete}Controls`)
            UIUtils.show(`#S-${state.delete}Delete`)
        }

        if(state.message) {
            // consume message
            UIUtils.show(messageSelector)
            UITextUtils.text(messageSelector, state.message)
            state.message = null
        }

        // if(state.error) {
        //     state.error = false
        // }
    }
}

UIUtils.addListener(createButtonSelector, 'click', e => {
    if(state.demo) {
        if(! state.user) { // user not logged in
            location.href = "/login?redirect=crypto"
        }

        if(state.user) { // user logged in
            state.input = true
            updateUI()
        }
    }
})

UIUtils.addListener(updateButtonSelector, 'click', e => {
    document.querySelector(updateFormSelector).reset()

    state.input = true
    updateUI()
})

UIUtils.addListener("#formSubmitButton", 'click', e => {
    e.preventDefault()

    document.querySelector(updateFormSelector).reportValidity()

    const valid = document.querySelector(updateFormSelector).checkValidity()
    if(! valid) return

    const action = UIUtils.selectedRadioButtonValue('action')
    const date = document.querySelector("#dateInput").value
    const amount = document.querySelector("#amountInput").value
    const symbol = document.querySelector("#symbolInput").value
    const cost = document.querySelector("#costInput").value
    const currency = document.querySelector("#currencyInput").value

    state.loading = true
    updateUI()

    state.message = `✓ Portfolio Updated: ${StringUtils.capitalize(action)} ${numeral(amount).format('0,0.[0]')} ${symbol.toUpperCase()} Total: ${numeral(cost).format('$0,0.[0]')}`
    crypto.update(action, date, symbol, amount, cost, currency, callback)
})

UIUtils.addListener("#formCloseButton", 'click', e => {
    e.preventDefault()

    state.input = false
    updateUI()
})

UIUtils.addListener("#tradesCloseButton", 'click', e => {
    state.trades = false
    updateUI()
})

const getPrice = (symbol, ticker) => {
    for(const row of ticker) {
        if(row['symbol'] == symbol.toUpperCase() + 'USDT') { // BUSD, USDC
            // console.log(row)
            return row['price']
        }
    }
}

const addPosition = (position, list, ticker) => {
    // properties
    const symbol = position['symbol']
    const amount = position['amount']
    const cost = position['cost']

    // div
    const div = document.createElement('div')
    div.classList.add('position')
    div.classList.add('px-4', 'pb-4')

    // header - symbol
    const h4 = document.createElement('h4')
    h4.appendChild(document.createTextNode(symbolName(symbol)))
    div.appendChild(h4)

    // img - logo
    const logoFile = (symbol, extension = 'svg') => `/images/logos/crypto/${symbol.toLowerCase()}.${extension}`
    const img = document.createElement('img')
    img.classList.add('logo')
    img.classList.add('p-1', 'mb-2')
    img.setAttribute('onerror', `this.onerror=null;this.src="${logoFile('blank', 'svg')}";`)
    img.setAttribute('src', logoFile(symbol))
    img.setAttribute('alt', `${symbol} logo`)
    div.appendChild(img)

    // ticker price
    const price = getPrice(symbol, ticker)

    // p - percentage
    const pPercentage = document.createElement('p')
    const smallPercentage = document.createElement('small')

    // icon & text - percentage
    const icon = document.createElement('i')
    icon.classList.add('p-1', 'px-1')

    if(! price ) { // no ticker price, can not have a percentage, show ghost
        icon.classList.add('fa', 'fa-ghost', 'text-secondary')
    }
    else {
        if(cost <= 0) { // cost 0 or negative, show infinity
            icon.classList.add('fa', 'fa-infinity', 'text-primary')
        }
        else { // ticker price available
                const basis = cost / amount
                const percentage = price / basis - 1

                smallPercentage.appendChild(document.createTextNode(`${numeral(percentage).format('%,')}`))
                smallPercentage.classList.add((percentage > 0 ? 'text-success' : 'text-danger'))

                icon.classList.add('fa', (percentage > 0 ? 'fa-arrow-up' : 'fa-arrow-down'))
        }
    }
    smallPercentage.appendChild(icon)
    pPercentage.appendChild(smallPercentage)
    div.appendChild(pPercentage)

    const createPElement = (from, to, classes) => {
        // p
        const p = document.createElement('p')
        p.classList.add(...classes)
        p.classList.add('text-nowrap')

        // small
        const smallUnit = document.createElement('small')

        if(from > 0) {
            // spanFrom
            const spanFrom = document.createElement('span')
            spanFrom.classList.add('p-1')
            spanFrom.appendChild(document.createTextNode(`${numeral(from).format(from > 1 ? '$0,0' : '$0,0.[0]')}`))
            smallUnit.appendChild(spanFrom)

            // i - arrow
            const iArrow = document.createElement('i')
            iArrow.classList.add('fas', 'fa-arrow-right', 'p-1')
            smallUnit.appendChild(iArrow)
        }

        // spanTo
        const spanTo = document.createElement('span')
        spanTo.classList.add('p-1')
        const text = to ? `${numeral(to).format(to > 1 ? '$0,0' : '$0,0.[0]')}` : '?'
        spanTo.appendChild(document.createTextNode(text))
        smallUnit.appendChild(spanTo)

        p.appendChild(smallUnit)

        return p
    }

    // p - unit
    const basis = cost / amount
    const pUnit = createPElement(basis, (price ? price : null), ['text-muted'])
    div.appendChild(pUnit)

    // p - amount
    const pAmount = document.createElement('p')
    pAmount.appendChild(document.createTextNode(`x ${numeral(amount).format('0,0.[0]')} ${symbol.toUpperCase()}`))
    div.appendChild(pAmount)

    // p - total
    const pTotal = createPElement(cost, (price ? price * amount : null), ['text-dark', 'fw-bolder'])
    div.appendChild(pTotal)

    if(! state.demo) {
        // controls
        const divControls = document.createElement('div')
        divControls.classList.add('mt-2', 'positionControls')
        divControls.setAttribute('id', `S-${symbol}Controls`) // prepend character, css id can not start with number

        // trades
        const btnTrades = document.createElement('button')
        btnTrades.classList.add('btn', 'btn-sm', 'mx-1', 'btn-outline-secondary', 'position-trades')
        btnTrades.appendChild(document.createTextNode(`Details`))
        btnTrades.setAttribute('symbol', symbol)

        // delete
        const iconDelete = document.createElement('i')
        iconDelete.classList.add('fas', 'fa-trash-alt')
        iconDelete.style.pointerEvents = 'none'
        const btnDelete = document.createElement('button')
        btnDelete.classList.add('btn', 'btn-sm', 'mx-1', 'btn-outline-secondary', 'position-delete')
        btnDelete.appendChild(iconDelete)
        btnDelete.setAttribute('symbol', symbol)

        divControls.appendChild(btnTrades)
        divControls.appendChild(btnDelete)

        div.appendChild(divControls)

        // delete
        const divDelete = document.createElement('div')
        divDelete.classList.add('d-none', 'mt-2', 'positionDelete')
        divDelete.setAttribute('id', `S-${symbol}Delete`)

        // btn - delete submit
        const btnDeleteSubmit = document.createElement('button')
        btnDeleteSubmit.classList.add('btn', 'btn-sm', 'btn-outline-danger', 'position-delete-submit')
        btnDeleteSubmit.appendChild(document.createTextNode(`Delete ${symbol.toUpperCase()}`))
        btnDeleteSubmit.setAttribute('symbol', symbol)
        // btn - delete cancel
        const btnDeleteCancel = document.createElement('button')
        btnDeleteCancel.classList.add('btn', 'btn-sm', 'btn-outline-secondary', 'position-delete-cancel', 'mx-2')
        btnDeleteCancel.setAttribute('symbol', symbol)
        btnDeleteCancel.appendChild(document.createTextNode('Back'))

        divDelete.appendChild(btnDeleteCancel)
        divDelete.appendChild(btnDeleteSubmit)
        div.appendChild(divDelete)
    }

    list.appendChild(div)
}

const addPositionsListeners = () => {
    UIUtils.addListener('.position-trades', 'click', e => { // position trades
        const symbol = e.target.getAttribute('symbol')

        populateTrades(data.trades, symbol)
        state.trades = true
        updateUI()

        UITextUtils.text(`${tradesSelector} > h3`, `${symbolName(symbol)} Details`)
    })

    UIUtils.addListener('.position-delete', 'click', e => { // position delete
        const symbol = e.target.getAttribute('symbol')

        state.delete = symbol
        updateUI()
    })

    UIUtils.addListener('.position-delete-cancel', 'click', e => { // position delete cancel
        state.delete = null
        updateUI()
    })

    UIUtils.addListener('.position-delete-submit', 'click', e => { // position delete submit
        const symbol = e.target.getAttribute('symbol')

        state.loading = true
        updateUI()

        state.message = `✓ ${symbol.toUpperCase()} position deleted`
        crypto.delete(symbol, callback)
    })
}

const populateTrades = (trades, symbol) => {
    const tableTradesSelector = `${tradesSelector} table`

    UITableUtils.clearTable(tableTradesSelector)

    UITableUtils.addHeader(tableTradesSelector, ['Date', 'Action', 'Amount', 'Total', 'Currency'])

    trades = trades.filter(t => t.symbol == symbol)
    for(const trade of trades) {
        const actionString = StringUtils.capitalize(trade.action)
        const dateString = moment(trade.date, 'YYYY-MM-DD').format("DD MMM YYYY")
        const amountString = `${numeral(trade.amount).format('0,0.[0]')} ${symbol.toUpperCase()}`
        const totalString = numeral(trade.cost).format('$0,0.[0]')
        const currencyString = trade.currency.toUpperCase()

        UITableUtils.addRow(tableTradesSelector, [dateString, actionString, amountString, totalString, currencyString])
    }

    const totalAmount = trades.reduce((acc, trade) => {
        return acc += trade.amount * ((trade.action == 'buy') ? 1 : -1)
    }, 0)
    const totalCost = trades.reduce((acc, trade) => {
        return acc += trade.cost * ((trade.action == 'buy') ? 1 : -1)
    }, 0)

    UITableUtils.addFooter(tableTradesSelector, ['', '', `${numeral(totalAmount).format('0,0.[0]')} ${symbol.toUpperCase()}`, numeral(totalCost).format('$0,0.[0]'), ''])

    state.trades = true
    updateUI()
}

const populatePositions = (positions, ticker) => {
    UIUtils.clearList(positionsSelector)

    const order = ['btc', 'eth', 'dot', 'doge']
    positions.sort((a,b) => order.indexOf(a['symbol']) - order.indexOf(b['symbol']))

    const list = document.querySelector(positionsSelector)

    for (let i = 0; i < positions.length; i++) {
        addPosition(positions[i], list, ticker)
    }

    addPositionsListeners()
}

const callback = data => {
    if(data.error) {
        if(data.error.code == 'no_user') {
            location.href = "/login?redirect=crypto"
        }
        else {
            state.loading = false
            state.message = `✋ ${data.error.message}`
            updateUI()
        }
    }
    else {
        fetch()
    }
}

const fetch = () => {
    state.loading = true
    updateUI()

    UI.loading()

    const fail = error => UI.error(error)

    const done = result => {
        state.demo = result.demo
        state.user = result.user

        data.positions = result.positions
        data.trades = result.trades

        const done = result => {
            data.ticker = result

            autoCompleteJS.data.src = binance.symbols()
            populatePositions(data.positions, data.ticker)

            UI.ready()

            state.loading = false
            updateUI()
        }
        binance.init(done, fail)
    }
    crypto.init(done, fail)
}

UIUtils.ready(() => {
    initDateInput()
    initAutoComplete()
    fetch()
})