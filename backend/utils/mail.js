// const nodemailer = require("nodemailer")
// require("dotenv").config()

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD
//     }
// })

// module.exports = transporter

const nodemailer = require("nodemailer")
require("dotenv").config()   //                                       

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smpt.gmail.com",// inbuilt secure mail  protocol transfer
    port: 465,  //smpt mail velladaniki otp 
    secure: false,
    auth: {

        }

})



module.exports = transporter