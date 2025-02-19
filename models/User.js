const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name.']
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please provide valid email',]
    },
    password: {
        type: String,
        required: [true, 'Please provide password.']
    },
    role: {
        type: String,
        enum: ['admin', 'student', 'instructor'],
    }
}, { timesatamps: true });


userSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

userSchema.methods.createJWT = function () {
    return jwt.sign({
        name: this.name,
        id: this._id,
        email: this.email,
        role: this.role,
    }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME })
}


userSchema.methods.comparePasswords = async function (userPassword) {
    const isPasswordCorrect = await bcrypt.compare(userPassword, this.password);
    return isPasswordCorrect
}







module.exports = mongoose.model('User', userSchema);