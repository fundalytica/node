const mongoose = require('mongoose')

const { Schema } = mongoose

const cryptoPortfolioSchema = new Schema({
    email:  { type: String, required: true, unique: true },
    assets: [{
        symbol: String,
        amount: Number,
        cost: Number
    }]
})

const CryptoPortfolioModel = mongoose.model('crypto_portfolio', cryptoPortfolioSchema)

module.exports = CryptoPortfolioModel
