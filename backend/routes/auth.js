const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/Users")
const Admin = require("../models/Admin")
const transporter = require("../utils/mail")

//send otp
router.post("/send-otp", async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }
        let user = await User.findOne({ email })
        // If already verified → block
        if (user && user.isVerified) {
            return res.status(409).json({ message: "Email already registered" })
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        if (!user) {
            user = new User({ email })
        }
        user.verificationOtp = otp
        user.otpExpires = Date.now() + 10 * 60 * 1000
        await user.save()

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "OTP Verification",
            html: `<h2>Welcome to MERAKI EVENT PLANNER</h2>
                   <p>Your OTP for registration is: <strong>${otp}</strong></p>
                   <p>This OTP will expire in 10 minutes.</p>`
        })
        res.status(200).json({ message: "OTP sent successfully" })
    } catch (err) {
        console.log("Error in send-otp:", err)
        res.status(500).json({ message: "Error sending OTP" })
    }
})
//verify otp
router.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body
        if (!email || !otp) {
            return res.status(400).json({ "message": "Email, OTP are required" })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        if (user.verificationOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" })
        }
        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP expired" })
        }
        user.isVerified = true
        user.verificationOtp = null
        user.otpExpires = null
        await user.save()
        res.status(200).json({ message: "Email verified successfully" })
    } catch (err) {
        res.status(500).json({ message: "Error verifying OTP" })
    }
})
//register
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, mobileNumber, address, gender } = req.body
        if (!email || !password || !address || !name || !mobileNumber || !gender) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const user = await User.findOne({ email })
        if (!user || !user.isVerified) {
            return res.status(400).json({ message: "Email not verified" })
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)
        user.name = name
        user.password = hashedPassword
        user.mobileNumber = mobileNumber
        user.address = address
        user.gender = gender
        await user.save()
        res.status(201).json({ message: "User registered successfully" })
    } catch (err) {
        console.log("Error in register:", err)
        res.status(500).json({ message: "Registration failed" })
    }
})
//generate tokens
const generateTokens = (user, role) => {
    const accesssToken = jwt.sign(
        { id: user._id, email: user.email, role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    )
    const refreshToken = jwt.sign(
        { id: user._id, role },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    )
    return { accesssToken, refreshToken }
}

//login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "All fields required" });
        let user = null;
        let role = null;
        //user
        user = await User.findOne({ email })
        if (user) role = "user";
        //admin
        if (!user) {
            user = await Admin.findOne({ email });
            if (user) role = "admin";
        }
        if (!user)
            return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid email or password" });

        //token
        const { accesssToken, refreshToken } = generateTokens(user, role);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            path: "/",
            sameSite: "lax"
        });
        res.status(200).json({
            message: "User identified and login successful",
            token: accesssToken,
            role,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error });
    }
});

//LOGOUT PROCESS
router.post("/logout", (req, res) => {
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
});

// SEND FORGOT OTP / FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ message: "email required" });
        let user = await User.findOne({ email }) ||
            await Admin.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "No account found with this email" });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp
        user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
        await user.save()
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "OTP for password reset",
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                        <h2 style="color: #333;">Meraki Event Planner</h2>
                        <p style="font-size: 16px; color: #555;">Your OTP for reset passwordis:</p>
                        <h1 style="color: #8c4caf; font-size: 30px; letter-spacing: 5px;">${otp}</h1>
                        <p style="color: #777;">This OTP will expire in <strong>10 minutes</strong>.</p>
                        <p style="color: #777;">If you didn't request this, please ignore this email.</p>
                    </div>
                </div>`
        })
        res.status(200).json({ success: true, message: "OTP sent to your email" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error sending email: " + err.message });
    }
});

//VERIFY FORGOT OTP
router.post("/verify-reset-otp", async (req, res) => {
    try {
        const { email, otp } = req.body
        if (!email || !otp)
            return res.status(400).json({ message: "All fields required" });
        let user = await User.findOne({ email }) || await Admin.findOne({ email })
        if (!user)
            return res.status(404).json({ "message": "User not found" })
        if (user.resetOtp !== otp.toString() || user.resetOtpExpire < Date.now()) {
            return res.status(400).json({ "message": "invalid or expire  otp" })
        }
        res.status(200).json({ "message": "OTP verified reset successful" })
    }
    catch (error) {
        res.status(500).json({ message: "Verification failed.Try again" });
    }
})

//RESET PASSWORD
router.post("/reset-password", async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password)
            return res.status(400).json({ "message": "all fields required" })
        let user = await User.findOne({ email }) || await Admin.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword
        user.resetOtp = null
        user.resetOtpExpire = null
        await user.save()
        res.status(200).json({ "message": "password reset succesffuly" })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error in reset password" });
    }
})

module.exports = router;
