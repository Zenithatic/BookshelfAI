require("dotenv").config()
const { rateLimit } = require("express-rate-limit")
const express = require("express")
const validator = require("email-validator")
const db = require("../db.js")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require("uuid")

const router = express.Router()

// remove all codes after 15 min
setInterval(async () => {
    await db.sql`DELETE FROM password_change_codes`
}, 1000 * 60 * 15);

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { response: "Too many requests! Please slow down and try again in a minute." }
})

router.use(limiter)

router.post("/getcode", async (req, res) => {
    // validate request body
    if (req.body === null || req.body.email === null) {
        req.json({
            response: "Invalid request body."
        })
        return
    }

    const email = String(req.body.email)

    // check for email validity
    if (validator.validate(email) == false) {
        res.json({
            response: "Invalid Email."
        })
        return
    }

    // make sure email exists in authentication table
    let queryResult = await db.sql`SELECT * FROM authentication WHERE email = ${email}`

    if (queryResult.length == 0) {
        res.json({
            response: "This Email is not associated with an account."
        })
        return
    }

    // send verification code
    let generatedCode = 100000 + Math.floor(Math.random() * 900000)

    // save code to db
    await db.sql`DELETE FROM password_change_codes WHERE email = ${email}`
    await db.sql`INSERT INTO password_change_codes VALUES (${email}, ${generatedCode})`

    // send email
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    })

    var mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: `BookshelfAI Password Reset Code - ${generatedCode}`,
        text: `A BookshelfAI password reset code has been requested for this email. If this was not you, please ignore this email. \n\nYour code is: ${generatedCode}.`
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response)
        }
    })

    res.json({
        response: "An email has been sent with your code. Make sure to check your spam as well. Codes expire every 15 minutes EST."
    })
})


router.post("/reset", async (req, res) => {
    // validate request body
    if (req.body === null || req.body.email === null || req.body.code === null || req.body.pass === null) {
        req.json({
            response: "Invalid request body."
        })
        return
    }

    const email = String(req.body.email)
    const code = String(req.body.code)
    const pass = String(req.body.pass)

    // check if code is valid
    let queryResult = await db.sql`SELECT * FROM password_change_codes WHERE email = ${email}`

    if (queryResult.length == 0 || String(queryResult[0].code) !== code) {
        res.json({
            response: "Invalid code. Either you have not requested a code, you have inputted the wrong email, or you have inputted the wrong code."
        })
        return
    }

    // proceed with password update
    const hashed = await bcrypt.hash(pass, 10)
    const newjwtcode = uuidv4()
    await db.sql`UPDATE authentication SET password = ${hashed}, jwtcode = ${newjwtcode} WHERE email = ${email}`
    await db.sql`DELETE FROM password_change_codes WHERE email = ${email}`

    res.json({
        response: `Password successfully changed for email ${email}.`
    })
})

module.exports = router