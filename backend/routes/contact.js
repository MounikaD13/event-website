const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const authMiddleware = require("../middleware/middleware");

// POST /api/contact - Submit a new contact form (Logged-in users only)
router.post("/contact", authMiddleware(["user", "admin"]), async (req, res) => {
    try {
        const { fullName, email, phone, eventDate, eventType, guestCount, referredBy, message } = req.body;

        // Simple validation
        if (!fullName || !email || !phone || !eventDate || !eventType || !guestCount || !message) {
            return res.status(400).json({ success: false, message: "Please fill all required fields" });
        }

        const newContact = new Contact({
            fullName,
            email,
            phone,
            eventDate,
            eventType,
            guestCount,
            referredBy,
            message
        });

        await newContact.save();

        res.status(201).json({ 
            success: true, 
            message: "Contact form submitted successfully! We will get back to you soon." 
        });
    } catch (err) {
        console.error("Error in contact route:", err);
        res.status(500).json({ success: false, message: "Server error, please try again later." });
    }
});

// GET /api/contact/all - View all messages (Admin only)
router.get("/contact/all", authMiddleware(["admin"]), async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, contacts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
