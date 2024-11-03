require("dotenv").config()
const { rateLimit } = require("express-rate-limit")
const express = require("express")
const validator = require("email-validator")
const db = require("../db.js")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")

const router = express.Router()

// remove all codes after 15 min
setInterval(async () => {
    await db.sql`DELETE FROM signup_codes`
}, 1000 * 60 * 15);

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { response: "Too many requests! Please slow down and try again in a minute." }
})

router.use(limiter)

// email verification code
router.post("/verify", async (req, res) => {
    const email = String(req.body.email)

    // check for email validity
    if (validator.validate(email) == false) {
        res.json({
            response: "Invalid Email."
        })
        return
    }

    // make sure email doesn't already belong to an user
    let queryResult = await db.sql`SELECT * FROM authentication WHERE email = ${email}`

    if (!queryResult.length == 0) {
        res.json({
            response: "This Email already belongs to another user."
        })
        return
    }

    // send verification code
    let generatedCode = 100000 + Math.floor(Math.random() * 900000)

    // save code to db
    await db.sql`DELETE FROM signup_codes WHERE email = ${email}`
    await db.sql`INSERT INTO signup_codes VALUES (${email}, ${generatedCode})`

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
        subject: `BookshelfAI Email Verification Code - ${generatedCode}`,
        text: `A BookshelfAI email verification code has been requested for this email. If this was not you, please ignore this email. \n\nYour code is: ${generatedCode}.`
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


// account creation endpoint
router.post("/makeaccount", async (req, res) => {
    const email = String(req.body.email)
    const code = String(req.body.code)
    const pass = String(req.body.pass)

    // check if code is valid
    let queryResult = await db.sql`SELECT * FROM signup_codes WHERE email = ${email}`

    if (queryResult.length == 0 || String(queryResult[0].code) !== code) {
        res.json({
            response: "Invalid code. Either you have not requested a code, you have used an email that belongs to someone else, or you have inputted the wrong code."
        })
        return
    }

    // proceed with account creation
    const hashed = await bcrypt.hash(pass, 10)
    await db.sql`INSERT INTO authentication VALUES (${email}, ${hashed})`
    await db.sql`INSERT INTO user_bookshelves VALUES (${email}, '{}') `
    await db.sql`DELETE FROM signup_codes WHERE email = ${email}`

    res.json({
        response: `Account successfully created with email ${email}.`
    })
})

module.exports = router


