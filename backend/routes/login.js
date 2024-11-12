require("dotenv").config()
const validateJWT = require("../middleware/validateJWT.js")
const { rateLimit } = require("express-rate-limit")
const express = require("express")
const db = require("../db.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { v4: uuidv4 } = require("uuid")

const router = express.Router()

// Rate limiter middleware to limit repeated requests to public APIs
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 15, // limit each IP to 15 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { response: "Too many requests! Please slow down and try again in a minute." }
})

// Apply the rate limiting middleware to all requests
router.use(limiter)

// Route to authenticate user and provide JWT
router.post("/authenticate", async (req, res) => {
    // Check for valid request body
    if (!req.body || !req.body.email || !req.body.pass) {
        res.json("Invalid request body.")
        return
    }

    const email = String(req.body.email)
    const pass = String(req.body.pass)

    // Verify credentials
    let queryResult = await db.sql`SELECT * FROM authentication WHERE email = ${email}`

    // If email not found
    if (queryResult.length == 0) {
        res.json({
            response: "There is no account tied to this email."
        })
        return
    }

    // Verify password
    let authenticated = await bcrypt.compare(pass, String(queryResult[0].password))

    if (authenticated) {
        // Sign and provide JWT to user
        jwt.sign({ email: email, jwtcode: String(queryResult[0].jwtcode) }, process.env.JWT_KEY, (err, token) => {
            if (err) {
                console.log(err)
            } else {
                res.json({
                    response: "Successful login.",
                    jwt: token
                })
            }
        })
    } else {
        res.json({
            response: "Incorrect password."
        })
        return
    }
})

// Route to verify JWT
router.post("/verifyjwt", validateJWT, async (req, res) => {
    res.json({
        response: `Valid credentials. Logged in as ${req.email}`,
        email: req.email
    })
})

// Route to sign out user
router.post("/signout", validateJWT, async (req, res) => {
    const newJwtCode = uuidv4()
    await db.sql`UPDATE authentication SET jwtcode = ${newJwtCode} WHERE email = ${String(req.email)}`

    res.json({
        response: "Signout successful."
    })
})

module.exports = router
