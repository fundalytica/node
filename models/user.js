const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema

const UserSchema = new Schema({
    email:      { type: String, required: true, unique: true },
    password:   { type: String, required: true },
    name:       { type: String, required: true }
})

// no ES6 arrow function
UserSchema.pre('save', async function (next) {
    const user = this

    const saltRounds = 10
    const hash = await bcrypt.hash(user.password, saltRounds)
    this.password = hash

    next()
})

// no ES6 arrow function
UserSchema.methods.isValidPassword = async function (password) {
    const user = this

    const compare = await bcrypt.compare(password, user.password)

    return compare
}

const UserModel = mongoose.model('user', UserSchema)

module.exports = UserModel