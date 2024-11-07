require("dotenv").config()
const validateJWT = require("../middleware/validateJWT.js")
const { rateLimit } = require("express-rate-limit")
const express = require("express")
const db = require("../db.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { v4: uuidv4 } = require("uuid")

const router = express.Router()

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { response: "Too many requests! Please slow down and try again in a minute." }
})

router.use(limiter)

router.post("/authenticate", async (req, res) => {
    // check for valid request body
    if (req.body === null || req.body.email === null || req.body.pass === null) {
        res.json("Invalid request body.")
        return
    }

    const email = String(req.body.email)
    const pass = String(req.body.pass)

    // verify credentials
    let queryResult = await db.sql`SELECT * FROM authentication WHERE email = ${email}`

    // if email not found
    if (queryResult.length == 0) {
        res.json({
            response: "There is no account tied to this email."
        })
        return
    }

    // verify password
    let authenticated = await bcrypt.compare(pass, String(queryResult[0].password))

    if (authenticated) {
        // sign and provide jwt to user
        jwt.sign({ email: email, jwtcode: String(queryResult[0].jwtcode) }, process.env.JWT_KEY, (err, token) => {
            if (err) {
                console.log(error)
            }
            else {
                res.json({
                    response: "Successful login.",
                    jwt: token
                })
            }
        })

    }
    else {
        res.json({
            response: "Incorrect password."
        })
        return
    }
})

router.post("/verifyjwt", validateJWT, async (req, res) => {
    res.json({
        response: `Valid credentials. Logged in as ${req.email}`,
        email: req.email
    })
})

router.post("/signout", validateJWT, async (req, res) => {
    const newJwtCode = uuidv4()
    await db.sql`UPDATE authentication SET jwtcode = ${newJwtCode} WHERE email = ${String(req.email)}`

    res.json({
        response: "Signout successful."
    })
})

module.exports = router
