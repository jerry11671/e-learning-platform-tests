const mongoose = require('mongoose');


const otpSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "please provide the user"]
    },
    code: {
        type: Number,
        required: [true, "Otp code is required"]
    }
}, { timestamps: true })




module.exports = mongoose.model('Otp', otpSchema);