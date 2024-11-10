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
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { response: "Too many requests! Please slow down and try again in a minute." }
})

router.use(limiter)

router.get("/getbookshelf", validateJWT, async (req, res) => {
    const queryResult = await db.sql`SELECT * FROM user_bookshelves WHERE email = ${req.email}`
    console.log(queryResult)

    res.json({
        response: "Successful retrieval.",
        bookshelf: JSON.stringify(queryResult[0].bookshelf)
    })
})

router.post("/updatebookshelf", validateJWT, async (req, res) => {
    const bookshelfJson = String(req.body.bookshelf)

    // check if it is valid json
    try {
        const temp = JSON.parse(bookshelfJson)
    }
    catch {
        res.json({
            response: "Invalid JSON."
        })
        return
    }

    await db.sql`UPDATE user_bookshelves SET bookshelf = ${bookshelfJson} WHERE email = ${req.email}`

    res.json({
        response: "Successful bookshelf update."
    })
})

module.exports = router