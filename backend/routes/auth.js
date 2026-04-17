const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/Users")
const transporter = require("../utils/mail")

// Send OTP to email
// router.post("/send-otp", async (req, res) => {
//     try {
//         const { email} = req.body
//         if (!email) {
//             return res.status(400).json({ "message": "Email are required" })
//         }
//         // Check if user already registered
//         const existingUser = await User.findOne({ email })
//         if (existingUser && existingUser.isVerified) {
//             return res.status(409).json({ "message": "Email already registered" })
//         }

//         // Generate 5-digit OTP
//         const otp = Math.floor(10000 + Math.random() * 90000).toString()

//         // Save or update OTP in database
//         if (existingUser) {
//             existingUser.verificationOtp = otp
//             existingUser.otpExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
//             await existingUser.save()
//         } else {
//             const tempUser = new Model({
//                 email,
//                 verificationOtp: otp,
//                 otpExpires: Date.now() + 10 * 60 * 1000,
//                 // Temporary placeholder values
//                 name: "temp",
//                 password: "temp",
//                 mobileNumber: "temp",
//             })
//             await tempUser.save()
//         }

//         // Send OTP email
//         await transporter.sendMail({
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: "Your OTP for MERAKI EVENT PLANNER Registration",
//             html: `
//                 <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
//                     <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
//                         <h2 style="color: #333;">Job Portal - Email Verification</h2>
//                         <p style="font-size: 16px; color: #555;">Your OTP for registration is:</p>
//                         <h1 style="color: #8c4caf; font-size: 30px; letter-spacing: 5px;">${otp}</h1>
//                         <p style="color: #777;">This OTP will expire in <strong>10 minutes</strong>.</p>
//                         <p style="color: #777;">If you didn't request this, please ignore this email.</p>
//                     </div>
//                 </div>
//             `
//         })
//         res.status(200).json({ "message": "OTP sent successfully to your email" })
//     } catch (err) {
//         console.log("Error in send-otp:", err)
//         res.status(500).json({ "message": "Failed to send OTP. Please try again." })
//     }
// })
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
// Helper function to generate tokens
const generateTokens = (user) => {
    const accesssToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || "access_secret",
        { expiresIn: "15m" }
    )
    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET || "refresh_secret",
        { expiresIn: "7d" }
    )
    return { accesssToken, refreshToken }
}



// 2. LOGIN PROCESS
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        const { accesssToken, refreshToken } = generateTokens(user);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            path: "/",
            sameSite: "lax"
        });

        res.status(200).json({
            message: "User identified",
            token: accesssToken,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. LOGOUT PROCESS
router.post("/logout", (req, res) => {
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
});

// 4. SEND FORGOT OTP / FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "No account found with this email" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendEmail(email, otp);
        res.status(200).json({ success: true, message: "OTP sent to your email" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error sending email: " + err.message });
    }
});

// Keep alias as requested
router.post("/send-forgot-otp", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "No account found with this email" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendEmail(email, otp);
        res.status(200).json({ success: true, message: "OTP sent to your email" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error sending email: " + err.message });
    }
});

// 5. VERIFY FORGOT OTP
router.post("/verify-forgot-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

        res.status(200).json({ success: true, message: "OTP verified successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 6. RESET PASSWORD
router.post("/reset-password", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ "message": "user not found" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.otp = undefined; // Clearing OTP fields as they aren't needed anymore
        user.otpExpires = undefined;

        await user.save();
        res.status(200).json({ "message": "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});




module.exports = router;
