import UIManager from './modules/UI/UIManager.js'
import UIUtils from './modules/UI/UIUtils.js'
import Utils from './modules/Utils.js'

import CryptoPortfolio from './modules/CryptoPortfolio.js'
import CryptoBinance from './modules/Crypto/CryptoBinance.js'

const UI = new UIManager("#spinner", "#error")
const crypto = new CryptoPortfolio(window.api_origin)
const binance = new CryptoBinance()

let assetsData = null
let tickerData = null

const listSelector = '#list'

const updateButtonSelector = "#updateButton"
const updateFormSelector = "#updateForm"

UIUtils.addListener(updateButtonSelector, 'click', e => {
    document.querySelector("#updateForm").reset()
    UIUtils.hide(updateButtonSelector)
    UIUtils.show(updateFormSelector)
})

UIUtils.addListener("#submitButton", 'click', e => {
    const symbol = document.querySelector("#symbolInput").value
    const amount = document.querySelector("#amountInput").value
    const cost = document.querySelector("#costInput").value

    // const url = `${window.api_origin}/v1/crypto/update/${options.symbol}-${options.minimumDip}`
    // const done = data => UISuccess(options, data)
    // const fail = error => UI.error(error)
    // Utils.request(url, null, done, fail)

    console.log(`${symbol} ${amount} ${cost}`)
})

UIUtils.addListener("#cancelButton", 'click', e => {
    UIUtils.show(updateButtonSelector)
    UIUtils.hide(updateFormSelector)
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

const run = () => {
    UI.loading()

    UIUtils.hide(listSelector)

    const fail = error => UI.error(error)

    const done = data => {
        assetsData = data.assets
        console.log(assetsData)

        if(data.demo) {
            UIUtils.show('#demoText')
            UIUtils.show('#createButton')
        }

        const done = data => {
            tickerData = data
            console.log(tickerData)

            populate(assetsData, tickerData)

            UI.ready()
            UIUtils.show(updateButtonSelector)
            UIUtils.show(listSelector)
        }
        binance.init(done, fail)
    }
    crypto.init(done, fail)
}

UIUtils.ready(run)

