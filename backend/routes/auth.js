const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/Users")
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
module.exports = router