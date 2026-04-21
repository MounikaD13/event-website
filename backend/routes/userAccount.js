const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const User = require("../models/Users");
const authMiddleware = require("../middleware/middleware");

// 1. GET FULL DASHBOARD DATA 
router.get("/dashboard", authMiddleware(["user"]), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.status(200).json({
            success: true,
            dashboard: {
                inquiries: user.inquiries,
                bookings: user.bookings,
                chats: user.chats
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error loading dashboard" });
    }
});

router.post("/dashboard/inquiry", authMiddleware(["user"]), async (req, res) => {
    try {
        const {
            eventType, eventDate, guestCount, phone, referredBy,
            budgetRange, location, estimatedDuration, specificServices,
            isFlexibleDate, message
        } = req.body;
        const user = await User.findById(req.user.id);

        user.inquiries.push({
            eventType, eventDate, guestCount, phone, referredBy,
            budgetRange, location, estimatedDuration, specificServices,
            isFlexibleDate, message
        });
        await user.save();

        res.status(201).json({ success: true, message: "Inquiry added to dashboard", inquiries: user.inquiries });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error submitting inquiry" });
    }
});

// 3. SEND CHAT MESSAGE
router.post("/dashboard/chat", authMiddleware(["user"]), async (req, res) => {
    try {
        const { message } = req.body;
        const user = await User.findById(req.user.id);

        user.chats.push({ sender: "User", message });
        await user.save();

        res.status(200).json({ success: true, chats: user.chats });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error sending message" });
    }
});

// 4. CANCEL INQUIRY
router.delete("/dashboard/inquiry/:id", authMiddleware(["user"]), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // Remove the inquiry from the array
        user.inquiries = user.inquiries.filter(inq => inq._id.toString() !== req.params.id);
        await user.save();

        res.status(200).json({ success: true, message: "Inquiry cancelled successfully", inquiries: user.inquiries });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error cancelling inquiry" });
    }
});

module.exports = router;