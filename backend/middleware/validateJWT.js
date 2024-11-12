require("dotenv").config();
const db = require("../db.js");
const jwt = require("jsonwebtoken");

/**
 * Middleware to validate JWT token.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const validateJWT = async (req, res, next) => {
    const header = req.headers['authorization'];

    // Validate JWT
    if (typeof header !== "undefined") {
        let token;

        // Extract token from header
        try {
            token = header.split(" ")[1];
        } catch (error) {
            return res.json({
                response: "Invalid credentials. Try logging in again, or clearing your cache if that does not work."
            });
        }

        // Verify JWT token
        jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
            if (err) {
                return res.json({
                    response: "Invalid credentials. Try logging in again, or clearing your cache if that does not work."
                });
            } else {
                // Extract jwtcode and email from payload
                const givenJwtCode = String(payload.jwtcode);
                const givenEmail = String(payload.email);

                // Query database to get jwtcode for the given email
                const queryResult = await db.sql`SELECT * FROM authentication WHERE email = ${givenEmail}`;
                const queryJwtCode = String(queryResult[0].jwtcode);

                // Compare jwtcode from payload with jwtcode from database
                if (givenJwtCode === queryJwtCode) {
                    // Proceed to authorized endpoint
                    req.email = givenEmail;
                    next();
                } else {
                    return res.json({
                        response: "Invalid credentials. Try logging in again, or clearing your cache if that does not work."
                    });
                }
            }
        });
    } else {
        return res.json({
            response: "Invalid credentials. Try logging in again, or clearing your cache if that does not work."
        });
    }
};

module.exports = validateJWT;