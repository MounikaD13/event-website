const mongoose = require("mongoose")
const userSchema = mongoose.Schema({
    name: {
        type: String
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"]
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String
    },
    mobileNumber: Number,
    address: {
        type: String
    },
    resetOtp: String,
    resetOtpExpire: Date,
    verificationOtp: String,
    otpExpires: Date,
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("User", userSchema)


