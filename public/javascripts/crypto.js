import UIManager from './modules/UI/UIManager.js'
import UIUtils from './modules/UI/UIUtils.js'
import UITextUtils from './modules/UI/UITextUtils.js'

import CryptoPortfolio from './modules/CryptoPortfolio.js'
import CryptoBinance from './modules/Crypto/CryptoBinance.js'

const UI = new UIManager("#spinner", "#error")
const crypto = new CryptoPortfolio(window.api_origin)
const binance = new CryptoBinance()

let assetsData = null
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

UIUtils.addListener(createButtonSelector, 'click', e => {
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
    UIUtils.hide(messageSelector)

    const symbol = document.querySelector("#symbolInput").value
    const amount = document.querySelector("#amountInput").value
    const cost = document.querySelector("#costInput").value

    e.preventDefault()

    const callback = () => {
        demo = false
        empty = false

        UIUtils.hide(updateFormSelector)

        fetch(() => {
            UIUtils.show(updateButtonSelector)
            UIUtils.show(messageSelector)
            UITextUtils.text(messageSelector, `✓ Portfolio Updated: ${numeral(amount).format('0,0.[0])')} ${symbol} @ ${numeral(cost).format('$0,0.[0])')}`)
        })
    }

    crypto.update(symbol, amount, cost, callback)
})

UIUtils.addListener("#cancelButton", 'click', e => {
    UIUtils.hide(updateFormSelector)

    if(demo) {
        demoElements.forEach(el => UIUtils.show(el))
    }
    else {
        UIUtils.show(updateButtonSelector)
    }

    e.preventDefault()
})

document.querySelector('#symbolInput').oninvalid = e => {
	e.target.setCustomValidity('Please enter a valid cryptocurrency symbol (e.g. btc). No numbers allowed.');
}

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

const populate = (assetsData, tickerData) => {
    const names = { 'btc': 'Bitcoin', 'eth': 'Ethereum', 'dot': 'Polkadot', 'doge': 'Dogecoin' }

    const order = ['btc', 'eth', 'dot', 'doge']
    assetsData.sort((a,b) => order.indexOf(a['symbol']) - order.indexOf(b['symbol']))

    const addPosition = (position, list) => {
        // database
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

        // header - symbol
        const header = document.createElement('h4')
        header.appendChild(document.createTextNode(names[symbol]))

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
        const pTotal = createPElement(basis * amount, price * amount, 'text-muted')

        div.appendChild(header)
        div.appendChild(img)
        div.appendChild(pPercentage)
        div.appendChild(pUnit)
        div.appendChild(pAmount)
        div.appendChild(pTotal)

        list.appendChild(div)
    }

    const list = document.querySelector(listSelector)
    for (let i = 0; i < assetsData.length; i++) {
        addPosition(assetsData[i], list)
    }
}

const fetch = (callback = null) => {
    clear()

    UI.loading()

    UIUtils.hide(listSelector)

    const fail = error => UI.error(error)

    const done = data => {
        demo = data.demo
        empty = data.empty

        assetsData = data.assets
        console.log(data)

        const done = data => {
            tickerData = data
            console.log(tickerData)

            populate(assetsData, tickerData)

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
