const { neon } = require("@neondatabase/serverless")
require("dotenv").config()
const sql = neon(process.env.DB_URL)

module.exports = { sql }