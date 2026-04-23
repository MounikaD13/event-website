const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const authMiddleware = require("../middleware/middleware");
const transporter = require("../utils/mail");
const { emitToAdmins, emitToUser, getIo } = require("../utils/socket");

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
        const createdInquiry = user.inquiries[user.inquiries.length - 1];

        emitToAdmins("dashboard:inquiry-created", {
            userId: user._id.toString(),
            userName: user.name,
            userEmail: user.email,
            inquiry: createdInquiry,
            timestamp: new Date()
        });

        emitToUser(user._id.toString(), "dashboard:inquiry-created", {
            inquiry: createdInquiry,
            timestamp: new Date()
        });

        res.status(201).json({ success: true, message: "Inquiry added to dashboard", inquiries: user.inquiries });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error submitting inquiry" });
    }
});

// 2.5 DIRECT BOOKING (Simplified)
router.post("/dashboard/book-event", authMiddleware(["user"]), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        user.bookings.push(req.body); // Pushes eventType, eventDate, venue
        await user.save();

        const createdBooking = user.bookings[user.bookings.length - 1];

        emitToAdmins("dashboard:booking-created", {
            userId: user._id.toString(),
            userName: user.name,
            userEmail: user.email,
            booking: createdBooking,
            timestamp: new Date()
        });

        emitToUser(user._id.toString(), "dashboard:booking-created", {
            booking: createdBooking,
            timestamp: new Date()
        });

        // Simple text email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Booking Confirmed",
            text: `Hi ${user.name}, your booking for ${req.body.eventType} is confirmed!`
        });

        res.status(201).json({ success: true, message: "Event booked successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Booking failed" });
    }
});

// 3. SEND CHAT MESSAGE
router.post("/dashboard/chat", authMiddleware(["user"]), async (req, res) => {
    try {
        const { message } = req.body;
        const user = await User.findById(req.user.id);

        user.chats.push({ sender: "User", message });
        await user.save();
        const chat = user.chats[user.chats.length - 1];

        // --- REAL-TIME NOTIFICATION FOR ADMIN ---
        const io = getIo();
        const payload = {
            userId: user._id.toString(),
            userName: user.name,
            userEmail: user.email,
            chat,
            timestamp: new Date()
        };

        io.to("admins").emit("dashboard:chat-message", payload);
        emitToUser(user._id.toString(), "dashboard:chat-message", payload);
        io.emit("admin_receive_message", {
            userId: user._id,
            userName: user.name,
            message,
            timestamp: new Date()
        });

        res.status(200).json({ success: true, chats: user.chats });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error sending message" });
    }
});

// 4. CANCEL INQUIRY
router.delete("/dashboard/inquiry/:id", authMiddleware(["user"]), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const removedInquiry = user.inquiries.find(inq => inq._id.toString() === req.params.id);

        // Remove the inquiry from the array
        user.inquiries = user.inquiries.filter(inq => inq._id.toString() !== req.params.id);
        await user.save();

        emitToAdmins("dashboard:inquiry-cancelled", {
            userId: user._id.toString(),
            userName: user.name,
            inquiryId: req.params.id,
            inquiry: removedInquiry || null,
            timestamp: new Date()
        });

        emitToUser(user._id.toString(), "dashboard:inquiry-cancelled", {
            inquiryId: req.params.id,
            inquiry: removedInquiry || null,
            timestamp: new Date()
        });

        res.status(200).json({ success: true, message: "Inquiry cancelled successfully", inquiries: user.inquiries });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error cancelling inquiry" });
    }
});

module.exports = router;