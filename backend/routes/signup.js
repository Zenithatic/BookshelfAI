require("dotenv").config()
const { rateLimit } = require("express-rate-limit")
const express = require("express")
const validator = require("email-validator")
const db = require("../db.js")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require('uuid');

const router = express.Router()

// Remove all codes after 15 minutes
setInterval(async () => {
    await db.sql`DELETE FROM signup_codes`
}, 1000 * 60 * 15);

// Rate limiter middleware
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 15, // limit each IP to 15 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { response: "Too many requests! Please slow down and try again in a minute." }
})

router.use(limiter)

// Email verification code endpoint
router.post("/verify", async (req, res) => {
    // Validate request body
    if (req.body === null || req.body.email === null) {
        req.json({
            response: "Invalid request body."
        })
        return
    }

    const email = String(req.body.email)

    // Check for email validity
    if (!validator.validate(email)) {
        res.json({
            response: "Invalid Email."
        })
        return
    }

    // Ensure email doesn't already belong to a user
    let queryResult = await db.sql`SELECT * FROM authentication WHERE email = ${email}`
    if (queryResult.length !== 0) {
        res.json({
            response: "This Email already belongs to another user."
        })
        return
    }

    // Generate and send verification code
    let generatedCode = 100000 + Math.floor(Math.random() * 900000)

    // Save code to database
    await db.sql`DELETE FROM signup_codes WHERE email = ${email}`
    await db.sql`INSERT INTO signup_codes VALUES (${email}, ${generatedCode})`

    // Configure email transporter
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    })

    // Email options
    var mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: `BookshelfAI Email Verification Code - ${generatedCode}`,
        text: `A BookshelfAI email verification code has been requested for this email. If this was not you, please ignore this email. \n\nYour code is: ${generatedCode}.`
    }

    // Send email
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

// Account creation endpoint
router.post("/makeaccount", async (req, res) => {
    // Validate request body
    if (req.body === null || req.body.email === null || req.body.code === null || req.body.pass === null) {
        req.json({
            response: "Invalid request body."
        })
        return
    }

    const email = String(req.body.email)
    const code = String(req.body.code)
    const pass = String(req.body.pass)

    // Check if code is valid
    let queryResult = await db.sql`SELECT * FROM signup_codes WHERE email = ${email}`
    if (queryResult.length === 0 || String(queryResult[0].code) !== code) {
        res.json({
            response: "Invalid code. Either you have not requested a code, you have used an email that belongs to someone else, or you have inputted the wrong code."
        })
        return
    }

    // Proceed with account creation
    const hashed = await bcrypt.hash(pass, 10)
    const jwtcode = uuidv4()
    await db.sql`INSERT INTO authentication VALUES (${email}, ${hashed}, ${jwtcode})`
    await db.sql`INSERT INTO user_bookshelves VALUES (${email}, '{
        "books": [{
            "title": "Sample Book",
            "author": "John Smith",
            "published": "2024",
            "isbn": "1234567890",
            "genre": "romance, horror",
            "cover": "https://th.bing.com/th/id/OIP.4XB8NF1awQyApnQDDmBmQwHaEo?rs=1&pid=ImgDetMain",
            "summary": "Welcome to BookshelfAI! This is a sample book that you can edit to get started with our platform. Feel free to delete this book and add your own!",
            "tags": "tag1 tag2",
            "dateadded": "1"    
        }]
    }')`
    await db.sql`DELETE FROM signup_codes WHERE email = ${email}`

    res.json({
        response: `Account successfully created with email ${email}.`
    })
})

module.exports = router


