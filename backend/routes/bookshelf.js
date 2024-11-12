require("dotenv").config()
const validateJWT = require("../middleware/validateJWT.js")
const { rateLimit } = require("express-rate-limit")
const express = require("express")
const db = require("../db.js")

const router = express.Router()

// Rate limiter middleware to limit repeated requests to public APIs
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 60, // limit each IP to 60 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { response: "Too many requests! Please slow down and try again in a minute." }
})

// Apply the rate limiting middleware to all requests
router.use(limiter)

// Route to get the user's bookshelf
router.get("/getbookshelf", validateJWT, async (req, res) => {
    try {
        const queryResult = await db.sql`SELECT * FROM user_bookshelves WHERE email = ${req.email}`

        res.json({
            response: "Successful retrieval.",
            bookshelf: JSON.stringify(queryResult[0].bookshelf)
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ response: "Internal server error." })
    }
})

// Route to update the user's bookshelf
router.post("/updatebookshelf", validateJWT, async (req, res) => {
    const bookshelfJson = String(req.body.bookshelf)

    // Check if the provided bookshelf data is valid JSON
    try {
        JSON.parse(bookshelfJson)
    } catch {
        res.json({
            response: "Invalid JSON."
        })
        return
    }

    try {
        // Update the user's bookshelf in the database
        await db.sql`UPDATE user_bookshelves SET bookshelf = ${bookshelfJson} WHERE email = ${req.email}`
        res.json({
            response: "Successful bookshelf update."
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ response: "Internal server error." })
    }
})

module.exports = router