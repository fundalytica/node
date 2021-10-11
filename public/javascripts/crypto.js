import UIManager from './modules/UI/UIManager.js'
import UIUtils from './modules/UI/UIUtils.js'
import UITextUtils from './modules/UI/UITextUtils.js'

import CryptoPortfolio from './modules/CryptoPortfolio.js'
import CryptoBinance from './modules/Crypto/CryptoBinance.js'

const UI = new UIManager("#spinner", "#error")
const crypto = new CryptoPortfolio(window.api_origin)
const binance = new CryptoBinance()

let positionsData = null
let tickerData = null

const listSelector = '#list'

const messageSelector = "#message"
const updateButtonSelector = "#updateButton"
const updateFormSelector = "#updateForm"
const demoTextSelector = '#demoText'
const createButtonSelector = "#createButton"

const demoElements = [demoTextSelector, createButtonSelector, listSelector]

let demo = false
let empty = false

let cryptoCallbackMessage = null

const cryptoCallback = data => {
    if(data.error) {
        const message = (data.error.code == 'no_user') ? 'Please login first' : data.error.message
        UITextUtils.text(messageSelector, `✋ ${message}`)
        UIUtils.show(messageSelector)
        return
    }

    demo = false
    empty = false

    UIUtils.hide(updateButtonSelector)
    UIUtils.hide(updateFormSelector)
    UIUtils.hide(messageSelector)

    fetch(() => {
        if(cryptoCallbackMessage) {
            UIUtils.show(messageSelector)
            UITextUtils.text(messageSelector, cryptoCallbackMessage)
            cryptoCallbackMessage = null
        }
    })
}

UIUtils.addListener(createButtonSelector, 'click', e => {
    UIUtils.hide(messageSelector)

    if(demo && ! empty) {
        location.href = "/login"
    }

    if(demo && empty) {
        demoElements.forEach(el => UIUtils.hide(el))

        UIUtils.show(updateFormSelector)
    }
})

UIUtils.addListener(updateButtonSelector, 'click', e => {
    UIUtils.hide(messageSelector)

    document.querySelector("#updateForm").reset()
    UIUtils.hide(updateButtonSelector)
    UIUtils.show(updateFormSelector)
})

UIUtils.addListener("#submitButton", 'click', e => {
    e.preventDefault()

    document.querySelector(updateFormSelector).reportValidity()

    const valid = document.querySelector(updateFormSelector).checkValidity()
    if(! valid) return

    const action = UIUtils.selectedRadioButtonValue('action')
    const symbol = document.querySelector("#symbolInput").value
    const amount = document.querySelector("#amountInput").value
    const cost = document.querySelector("#costInput").value

    cryptoCallbackMessage = `✓ Portfolio updated: ${action} ${numeral(amount).format('0,0.[0])')} ${symbol.toUpperCase()} @ ${numeral(cost).format('$0,0.[0])')}`
    crypto.update(action, symbol, amount, cost, cryptoCallback)
})

UIUtils.addListener("#cancelButton", 'click', e => {
    UIUtils.hide(updateFormSelector)
    UIUtils.hide(messageSelector)

    if(demo) {
        demoElements.forEach(el => UIUtils.show(el))
    }
    else {
        UIUtils.show(updateButtonSelector)
    }

    e.preventDefault()
})

const getPrice = (symbol, tickerData) => {
    for(const row of tickerData) {
        if(row['symbol'] == symbol.toUpperCase() + 'USDT') { // BUSD, USDC
            // console.log(row)
            return row['price']
        }

        // if(row['symbol'].includes(symbol.toUpperCase())) {
        //     console.log(row)
        // }
    }
}

const clear = () => {
    const list = document.querySelector(listSelector)
    while (list.firstChild) {
        list.removeChild(list.firstChild)
    }
}

const populate = (positionsData, tickerData) => {
    const names = { 'btc': 'Bitcoin', 'eth': 'Ethereum', 'dot': 'Polkadot', 'doge': 'Dogecoin' }

    const order = ['btc', 'eth', 'dot', 'doge']
    positionsData.sort((a,b) => order.indexOf(a['symbol']) - order.indexOf(b['symbol']))

    const addPosition = (position, list) => {
        // properties
        const symbol = position['symbol']
        const amount = position['amount']
        const cost = position['cost']

        // ticker
        const price = getPrice(symbol, tickerData)

        // calculate
        const basis = cost / amount

        // div
        const div = document.createElement('div')
        div.classList.add('position')
        div.classList.add('m-4')
        div.classList.add('p-2')

        const header = document.createElement('div')

        // header - symbol
        const h4 = document.createElement('h4')
        h4.appendChild(document.createTextNode(names[symbol]))
        header.appendChild(h4)

        // img - logo
        const logoFile = (symbol, extension = 'svg') => `/images/logos/crypto/${symbol.toLowerCase()}.${extension}`
        const img = document.createElement('img')
        img.classList.add('logo')
        img.classList.add('p-1')
        img.setAttribute('onerror', `this.onerror=null;this.src="${logoFile(symbol, 'png')}";`)
        img.setAttribute('src', logoFile(symbol))
        img.setAttribute('alt', `${symbol} logo`)
        img.classList.add('mb-2')

        // p - percentage
        const percentage = price / basis - 1
        const pPercentage = document.createElement('p')
        const smallPercentage = document.createElement('small')
        pPercentage.appendChild(smallPercentage)
        smallPercentage.classList.add(percentage > 0 ? 'text-success' : 'text-danger')
        smallPercentage.appendChild(document.createTextNode(`${numeral(percentage).format('%,')}`))

        const iArrow = document.createElement('i')
        iArrow.classList.add('px-1')
        iArrow.classList.add('fas', percentage > 0 ? 'fa-arrow-up' : 'fa-arrow-down', 'p-1')
        smallPercentage.appendChild(iArrow)

        // p - amount
        const pAmount = document.createElement('p')
        pAmount.appendChild(document.createTextNode(`x ${numeral(amount).format('0,0.[0])')} ${symbol.toUpperCase()}`))

        const createPElement = (a, b, colorClass) => {
            // p
            const p = document.createElement('p')
            p.classList.add(colorClass)
            p.classList.add('text-nowrap')

            // small
            const smallUnit = document.createElement('small')

            // spanA
            const spanBasis = document.createElement('span')
            spanBasis.classList.add('p-1')
            spanBasis.appendChild(document.createTextNode(`${numeral(a).format(a > 1 ? '$0,0' : '$0,0.[0]')}`))
            smallUnit.appendChild(spanBasis)

            // i - arrow
            const iArrow = document.createElement('i')
            iArrow.classList.add('fas', 'fa-arrow-right', 'p-1')
            smallUnit.appendChild(iArrow)

            // spanB
            const spanPrice = document.createElement('span')
            spanPrice.classList.add('p-1')
            spanPrice.appendChild(document.createTextNode(`${numeral(b).format(a > 1 ? '$0,0' : '$0,0.[0]')}`))
            smallUnit.appendChild(spanPrice)

            p.appendChild(smallUnit)
            return p
        }

        const pUnit = createPElement(basis, price, 'text-muted')
        const pTotal = createPElement(basis * amount, price * amount, 'text-dark')

        div.appendChild(header)
        div.appendChild(img)
        div.appendChild(pPercentage)
        div.appendChild(pUnit)
        div.appendChild(pAmount)
        div.appendChild(pTotal)

        if(! demo) {
            // controls
            const divControls = document.createElement('div')
            divControls.classList.add('mt-2')
            divControls.setAttribute('id', `${symbol}Controls`)
            //  details, delete icons
            const createIcon = (classes, symbol) => {
                const i = document.createElement('i')
                i.classList.add('bi', 'fs-5', 'mx-1', 'text-secondary')
                i.classList.add(...classes)
                i.setAttribute('symbol', symbol)
                return i
            }
            divControls.appendChild(createIcon(['bi-info-square', 'position-details'], symbol))
            divControls.appendChild(createIcon(['bi-x-square', 'position-delete'], symbol))
            div.appendChild(divControls)

            // delete confirm
            const divDeleteConfirm = document.createElement('div')
            divDeleteConfirm.classList.add('d-none', 'mt-2')
            divDeleteConfirm.setAttribute('id', `${symbol}DeleteConfirm`)
            // btn - delete
            const btnDelete = document.createElement('button')
            btnDelete.classList.add('btn', 'btn-outline-danger', 'position-delete-confirm')
            btnDelete.appendChild(document.createTextNode(`Delete ${symbol.toUpperCase()}`))
            btnDelete.setAttribute('symbol', symbol)
            // btn - delete cancel
            const btnDeleteCancel = document.createElement('button')
            btnDeleteCancel.classList.add('btn', 'btn-outline-secondary', 'position-delete-cancel', 'mx-2')
            btnDeleteCancel.setAttribute('symbol', symbol)
            // cancel icon
            // const iCancel = document.createElement('i')
            // iCancel.classList.add('fas', 'fa-undo')
            // iCancel.style.pointerEvents = 'none'
            // btnDeleteCancel.appendChild(iCancel)
            // cancel text
            btnDeleteCancel.appendChild(document.createTextNode('Back'))
            // append
            divDeleteConfirm.appendChild(btnDeleteCancel)
            divDeleteConfirm.appendChild(btnDelete)
            div.appendChild(divDeleteConfirm)
        }

        list.appendChild(div)
    }

    const list = document.querySelector(listSelector)
    for (let i = 0; i < positionsData.length; i++) {
        addPosition(positionsData[i], list)
    }

    UIUtils.addListener('.position-details', 'click', e => {
        const symbol = e.target.getAttribute('symbol')
        console.log(`details ${symbol}`)
    })

    UIUtils.addListener('.position-delete', 'click', e => {
        const symbol = e.target.getAttribute('symbol')
        UIUtils.hide(`#${symbol}Controls`)
        UIUtils.show(`#${symbol}DeleteConfirm`)
        console.log(`confirm delete ${symbol}`)
    })

    UIUtils.addListener('.position-delete-confirm', 'click', e => {
        const symbol = e.target.getAttribute('symbol')
        console.log(`final delete ${symbol}`)

        UIUtils.show(`#${symbol}Controls`)
        UIUtils.hide(`#${symbol}DeleteConfirm`)

        cryptoCallbackMessage = `✓ ${symbol.toUpperCase()} position deleted`
        crypto.delete(symbol, cryptoCallback)
    })

    UIUtils.addListener('.position-delete-cancel', 'click', e => {
        const symbol = e.target.getAttribute('symbol')
        UIUtils.show(`#${symbol}Controls`)
        UIUtils.hide(`#${symbol}DeleteConfirm`)
        console.log(`cancel delete ${symbol}`)
    })
}

const fetch = (callback = null) => {
    clear()

    UI.loading()

    UIUtils.hide(listSelector)

    const fail = error => UI.error(error)

    const done = data => {
        demo = data.demo
        empty = data.empty

        positionsData = data.positions
        console.log(data)

        const done = data => {
            tickerData = data
            console.log(tickerData)

            populate(positionsData, tickerData)

            if(demo) {
                UIUtils.show(demoTextSelector)
                UIUtils.show(createButtonSelector)
            }
            else {
                UIUtils.show(updateButtonSelector)
            }

            UIUtils.show(listSelector)
            UI.ready()

            if(callback) callback()
        }
        binance.init(done, fail)
    }
    crypto.init(done, fail)
}

UIUtils.ready(fetch)
