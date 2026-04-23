const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const authMiddleware = require("../middleware/middleware");
const transporter = require("../utils/mail");
const { emitToAdmins } = require("../utils/socket");

router.post("/contact", async (req, res) => {
    try {
        const { fullName, email, message } = req.body;

        if (!fullName || !email || !message) {
            return res.status(400).json({ success: false, message: "Please fill all required fields" });
        }

        const newContact = new Contact({
            fullName,
            email,
            message
        });

        await newContact.save();

        emitToAdmins("contact:created", {
            contact: newContact,
            timestamp: new Date()
        });

        res.status(201).json({ 
            success: true, 
            message: "Contact form submitted successfully! We will get back to you soon." 
        });
    } catch (err) {
        console.error("Error in contact route:", err);
        res.status(500).json({ success: false, message: "Server error, please try again later." });
    }
});

router.get("/contact/all", authMiddleware(["admin"]), async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, contacts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// Update contact status and send email notification
router.put("/contact/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        
        const updatedContact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status, adminResponse },
            { new: true }
        );

        if (!updatedContact) {
            return res.status(404).json({ success: false, message: "Contact not found" });
        }

        emitToAdmins("contact:updated", {
            contact: updatedContact,
            timestamp: new Date()
        });

        // --- SEND STYLED EMAIL NOTIFICATION ---
        try {
            await transporter.sendMail({
                from: `"Event Team" <${process.env.EMAIL_USER}>`,
                to: updatedContact.email,
                subject: `Update on your Inquiry: ${status}`,
                html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">Hello, ${updatedContact.fullName}!</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">We have an update regarding your inquiry.</p>
                    </div>
                    
                    <div style="padding: 30px; background-color: #ffffff;">
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">
                            ${adminResponse || "Thank you for reaching out to us. We have reviewed your request and updated its status."}
                        </p>
                        
                        <div style="margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #6a11cb; border-radius: 4px;">
                            <h3 style="margin-top: 0; color: #6a11cb; font-size: 14px; text-transform: uppercase;">Current Status</h3>
                            <p style="margin-bottom: 0; font-weight: bold; color: #2c3e50; font-size: 18px;">${status}</p>
                        </div>

                        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <h4 style="color: #777; margin-bottom: 10px;">Your Original Inquiry:</h4>
                        <p style="font-style: italic; color: #666; background: #fffaf0; padding: 15px; border-radius: 8px; border: 1px dashed #ffd700;">
                            "${updatedContact.message}"
                        </p>

                        <div style="text-align: center; margin-top: 40px;">
                            <p style="font-size: 14px; color: #888;">If you have any further questions, simply reply to this email.</p>
                            <p style="font-weight: bold; color: #333; margin-top: 20px;">We are glad you chose us!</p>
                        </div>
                    </div>
                    
                    <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                        &copy; ${new Date().getFullYear()} Event Website Team. All rights reserved.
                    </div>
                </div>
                `
            });
        } catch (mailErr) {
            console.error("Email notification failed for contact:", mailErr);
            // We don't return error here because the database update was successful
        }

        res.status(200).json({ success: true, message: "Contact updated and email sent successfully", contact: updatedContact });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete contact
router.delete("/contact/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const deletedContact = await Contact.findByIdAndDelete(req.params.id);

        if (!deletedContact) {
            return res.status(404).json({ success: false, message: "Contact not found" });
        }

        emitToAdmins("contact:deleted", {
            contactId: req.params.id,
            timestamp: new Date()
        });

        res.status(200).json({ success: true, message: "Contact deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


module.exports = router;