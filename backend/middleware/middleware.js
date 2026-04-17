const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")
const Users = require("../models/Users")

const authMiddleware = (roles = []) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers["authorization"]
            if (!authHeader) {
                return res.status(401).json({ message: "token not provided" })
            }
            const token = authHeader.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            let user
            if (decoded.role === "user") {
                user = await Users.findById(decoded.id).select("-password")
            }
            else if (decoded.role === "admin") {
                user = await Admin.findById(decoded.id).select("-password")
            }
            if (!user) {
                return res.status(401).json({ message: "User not found" })
            }
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: "Forbidden" });
            }
            req.user = user //{id,email,role}
            req.user.role = decoded.role
            next()
        }
        catch (err) {
            return res.status(401).json({ message: "invalid or token expired" })
        }
    }
}
module.exports = authMiddleware
