const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const authMiddleware = require("../middleware/middleware");
const transporter = require("../utils/mail");
const { getIo, emitToAdmins, emitToUser } = require("../utils/socket");

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
            const latestBooking = user.bookings[user.bookings.length - 1];

            // #3: SEND PREMIUM STATUS EMAIL NOTIFICATION (ASYNC)
            transporter.sendMail({
                from: `"Event Team" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `Inquiry Status Update: ${newStatus}`,
                html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(135deg, #FF512F 0%, #DD2476 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">Hello, ${user.name}!</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Good news about your event inquiry!</p>
                    </div>
                    
                    <div style="padding: 30px; background-color: #ffffff;">
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">
                            Your inquiry for <strong>${inquiry.eventType}</strong> scheduled for <strong>${inquiry.eventDate}</strong> has been reviewed.
                        </p>
                        
                        <div style="margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #DD2476; border-radius: 4px;">
                            <h3 style="margin-top: 0; color: #DD2476; font-size: 14px; text-transform: uppercase;">Updated Status</h3>
                            <p style="margin-bottom: 0; font-weight: bold; color: #2c3e50; font-size: 18px;">${newStatus}</p>
                        </div>

                        <div style="background: #fff5f7; padding: 15px; border-radius: 8px; border: 1px solid #ffebeb; margin-top: 20px; text-align: center;">
                            <p style="margin: 0; color: #555;">You can now view more details and chat with us directly from your dashboard.</p>
                            <a href="#" style="display: inline-block; margin-top: 15px; padding: 12px 25px; background: #DD2476; color: white; text-decoration: none; border-radius: 25px; font-weight: bold; box-shadow: 0 4px 10px rgba(221, 36, 118, 0.3);">Go to Dashboard</a>
                        </div>

                        <div style="text-align: center; margin-top: 40px;">
                            <p style="font-size: 14px; color: #888;">Questions? We're here to help. Just reply to this email.</p>
                            <p style="font-weight: bold; color: #333; margin-top: 20px;">We are thrilled to be part of your journey!</p>
                        </div>
                    </div>
                    
                    <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                        &copy; ${new Date().getFullYear()} Event Website Team. All rights reserved.
                    </div>
                </div>
                `
            }).catch(mailErr => {
                console.error("Email notification failed (update-inquiry-status):", mailErr);
            });

            emitToAdmins("dashboard:inquiry-updated", {
                userId: user._id.toString(),
                userName: user.name,
                inquiry,
                booking: newStatus === "Confirmed" ? latestBooking : null,
                timestamp: new Date()
            });

            emitToUser(user._id.toString(), "dashboard:inquiry-updated", {
                inquiry,
                booking: newStatus === "Confirmed" ? latestBooking : null,
                timestamp: new Date()
            });

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

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.chats.push({ sender: "Admin", message });
        await user.save();
        const chat = user.chats[user.chats.length - 1];

        // --- REAL-TIME NOTIFICATION ---
        const io = getIo();
        const payload = {
            userId: user._id.toString(),
            userName: user.name,
            chat,
            timestamp: new Date()
        };

        io.to(`user:${userId}`).emit("receive_message", { sender: "Admin", message, timestamp: new Date() });
        emitToUser(userId, "dashboard:chat-message", payload);
        emitToAdmins("dashboard:chat-message", payload);

        res.status(200).json({ success: true, message: "Reply sent", chats: user.chats });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error sending reply chatttt" });
        // console.log(err.message)
    }
});

// 4. ADMIN USER MANAGEMENT: DELETE USER
router.delete("/admin/user/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        emitToAdmins("dashboard:user-deleted", {
            userId: req.params.id,
            userName: user.name,
            timestamp: new Date()
        });
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;