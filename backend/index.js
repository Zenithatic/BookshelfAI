const express = require("express")
const helmet = require("helmet")
const cors = require("cors")

const port = 3000
const app = express()
app.use(helmet())

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://bookshelfai.onrender.com");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

app.listen(port, () => {
    console.log("BookshelfAI Backend is listening on port 3000.");
})

app.get("/", (req, res) => {

    res.json({
        response: "BookshelfAI Backend is listening on port 3000."
    })
})