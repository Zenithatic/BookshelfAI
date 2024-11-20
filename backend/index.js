// Import necessary modules
const express = require("express")
const helmet = require("helmet")

// Initialize express app and set port
const port = 3000
const app = express()

// Set trust proxy
app.set("trust proxy", 3)

// Use helmet for security
app.use(helmet())

// Parse incoming JSON requests
app.use(express.json())

// Maximum 

// Allow certain origins for CORS
app.use((req, res, next) => {
    const allowedOrigins = ["http://localhost", "https://bookshelfai.onrender.com"]
    const origin = req.headers.origin

    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin)
    }

    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE")
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization")
    next()
})

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        response: req.ip
    })
})

// Import and use routers
const signup = require("./routes/signup.js")
app.use("/signup", signup)

const passreset = require("./routes/passreset.js")
app.use("/passreset", passreset)

const login = require("./routes/login.js")
app.use("/login", login)

const bookshelf = require("./routes/bookshelf.js")
app.use("/bookshelf", bookshelf)

const search = require("./routes/search.js")
app.use("/search", search)

// Start the server
app.listen(port, () => {
    console.log("BookshelfAI Backend is listening on port 3000.")
})