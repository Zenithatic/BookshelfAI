require("dotenv").config()
const db = require("../db.js")
const jwt = require("jsonwebtoken")

const validateJWT = async (req, res, next) => {
    const header = req.headers['authorization']

    // validate jwt
    if (typeof header !== "undefined") {
        const token = header.split(" ")[1]

        // make sure jwt is valid
        jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
            if (err) {
                res.json({
                    response: "Invalid credentials. Try logging in again, or clearing your cache if that does not work."
                })
            }
            else {
                // make sure jwtcode matches jwtcode in database
                const givenJwtCode = String(payload.jwtcode)
                const givenEmail = String(payload.email)

                const queryResult = await db.sql`SELECT * FROM authentication WHERE email = ${givenEmail}`
                const queryJwtCode = String(queryResult[0].jwtcode)

                if (givenJwtCode === queryJwtCode) {
                    // proceed to authorized endpoint
                    req.email = givenEmail;
                    next()
                }
                else {
                    res.json({
                        response: "Invalid credentials. Try logging in again, or clearing your cache if that does not work."
                    })
                }
            }
        })
    }
    else {
        res.json({
            response: "Invalid credentials. Try logging in again, or clearing your cache if that does not work."
        })
    }
}

module.exports = validateJWT