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
    // Dashboard Data - Inquiries, Bookings, and Chats
    inquiries: [{
        eventType: String,
        eventDate: Date,
        guestCount: Number,
        phone: String,
        referredBy: String,
        budgetRange: String,
        location: String,
        estimatedDuration: String,
        specificServices: [String],
        isFlexibleDate: { type: Boolean, default: false },
        message: String,
        status: {
            type: String,
            enum: ["Pending", "Checked", "Confirmed", "Rejected"],
            default: "Pending"
        },
        createdAt: { type: Date, default: Date.now }
    }],
    bookings: [{
        eventType: String,
        eventDate: Date,
        venue: String,
        status: { type: String, default: "Upcoming" },
        createdAt: { type: Date, default: Date.now }
    }],
    chats: [{
        sender: { type: String, enum: ["User", "Admin"] },
        message: String,
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("User", userSchema)


