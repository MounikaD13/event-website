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
    phone: {
        type: String,
        required: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    eventType: {
        type: String,
        required: true,
        enum: ["Wedding", "Birthday", "Corporate", "Graduation", "Anniversary", "Other"]
    },
    guestCount: {
        type: Number,
        required: true
    },
    referredBy: {
        type: String,
        enum: ["Instagram", "Facebook", "Google", "Friend", "Other"],
        default: "Other"
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Contact", contactSchema);
