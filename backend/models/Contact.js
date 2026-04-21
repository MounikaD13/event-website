const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["New", "Read", "Replied"],
        default: "New"
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
        status: { type: String, default: "Pending" },
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
        sender: { type: String, enum: ["User"] },
        message: String,
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Contact", contactSchema);
