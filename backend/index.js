const express = require("express")
const helmet = require("helmet")

const port = 3000
const app = express()
app.set("trust proxy", 3)
app.use(helmet())
app.use(express.json())

// allow certain origins
app.use((req, res, next) => {
    const allowedOrigins = ["http://localhost", "https://bookshelfai.onrender.com"]
    const origin = req.headers.origin

    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }

    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// health check
app.get("/", (req, res) => {
    res.json({
        response: req.ip
    })
})

// signup router
const signup = require("./routes/signup.js")
app.use("/signup", signup)

// password reset router
const passreset = require("./routes/passreset.js")
app.use("/passreset", passreset)

// login router
const login = require("./routes/login.js")
app.use("/login", login)

// bookshelf router
const bookshelf = require("./routes/bookshelf.js")
app.use("/bookshelf", bookshelf)

app.listen(port, () => {
    console.log("BookshelfAI Backend is listening on port 3000.");
})