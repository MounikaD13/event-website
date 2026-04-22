require("dotenv").config();
const { initGridFS } = require("./utils/GridFs");
const mongoose = require("mongoose")
const cors = require("cors")
const express = require("express")
const app = express()
const authRoutes = require("./routes/auth")
const contactRoutes = require("./routes/contact")
const eventRoutes = require("./routes/events")
const userAccountRoutes = require("./routes/userAccount")
const adminDashboardRoutes = require("./routes/adminDashboard")
const imageRoutes = require("./routes/images")
const cookieParser = require("cookie-parser")

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("DB connected successfully");
        initGridFS(mongoose.connection.db);
    })
    .catch(err => console.log(err));
app.get("/", (req, res) => res.json({ "message": 'dummy route' }))
app.use("/api", authRoutes)
app.use("/api", contactRoutes)
app.use("/api", eventRoutes)
app.use("/api", userAccountRoutes)
app.use("/api", adminDashboardRoutes)


app.use("/api/events", eventRoutes)

app.use("/api", imageRoutes)


app.use("/api/events", eventRoutes)


app.use("/api", imageRoutes)


app.use("/api", imageRoutes)

app.listen(process.env.PORT, () => { console.log("server started successfully") })