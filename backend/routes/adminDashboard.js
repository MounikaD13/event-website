const express = require("express");
const router = express.Router();
const User = require("../models/Users")
const authMiddleware = require("../middleware/middleware");

const transporter = require("../utils/mail");

// 1. GET ALL USER DATA (With simple search/filter)
router.get("/admin/all-data", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { status, eventType, search } = req.query;
        let query = {};
        
        if (search) {
            query = { $or: [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }] };
        }

        let users = await User.find(query).select("-password");

        // Simple filtering in JS if query params provided 
        if (status || eventType) {
            users = users.filter(user => {
                const hasMatchingInquiry = user.inquiries.some(inq => 
                    (!status || inq.status === status) && 
                    (!eventType || inq.eventType === eventType)
                );
                return hasMatchingInquiry;
            });
        }

        res.status(200).json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching management data" });
    }
});

// 2. UPDATE INQUIRY STATUS & CONVERT TO BOOKING
router.put("/admin/update-inquiry-status", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { userId, inquiryId, newStatus } = req.body;
        const user = await User.findById(userId);
        
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const inquiry = user.inquiries.id(inquiryId);
        if (inquiry) {
            inquiry.status = newStatus;

            // #1: CONVERT TO BOOKING if status is "Confirmed"
            if (newStatus === "Confirmed") {
                user.bookings.push({
                    eventType: inquiry.eventType,
                    eventDate: inquiry.eventDate,
                    venue: inquiry.location || "To be decided",
                    status: "Upcoming"
                });
            }

            await user.save();

            // #3: SEND STATUS EMAIL NOTIFICATION
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: `Inquiry Status Update: ${newStatus}`,
                    html: `<h3>Hello ${user.name},</h3>
                           <p>Your inquiry for <strong>${inquiry.eventType}</strong> on <strong>${newStatus === "Confirmed" ? inquiry.eventDate : inquiry.eventDate}</strong> has been updated to: <strong>${newStatus}</strong>.</p>
                           <p>Login to your dashboard for more details.</p>`
                });
            } catch (mailErr) {
                console.error("Email notification failed:", mailErr);
            }

            return res.status(200).json({ success: true, message: `Status updated to ${newStatus}`, user });
        }
        res.status(404).json({ success: false, message: "Inquiry not found" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. ADMIN CHAT REPLY
router.post("/admin/chat-reply", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { userId, message } = req.body;
        const user = await User.findById(userId);
        
        user.chats.push({ sender: "Admin", message });
        await user.save();

        res.status(200).json({ success: true, message: "Reply sent", chats: user.chats });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error sending reply" });
    }
});

// 4. ADMIN USER MANAGEMENT: DELETE USER
router.delete("/admin/user/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
