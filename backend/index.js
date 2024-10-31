const express = require("express")
const helmet = require("helmet")
const cors = require("cors")

const port = 3000
const app = express()
app.use(helmet())

app.use(cors({
    origin: ['https://bookshelfai.onrender.com'],
    credentials: true,
    methods: "GET,POST,PUT,DELETE"
}))

app.listen(port, () => {
    console.log("BookshelfAI Backend is listening on port 3000.");
})

app.get("/", (req, res) => {

    res.json({
        response: "BookshelfAI Backend is listening on port 3000."
    })
})