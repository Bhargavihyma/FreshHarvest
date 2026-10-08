const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();
const pool = require("../db");


// ==================================================
// REGISTER USER
// ==================================================

router.post("/register", async (req, res) => {
    try {

        const { full_name, email, password } = req.body;


        // Check required fields
        if (!full_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email and password"
            });
        }


        // Check if email already exists
        const existingUser = await pool.query(
            "SELECT user_id FROM users WHERE email = $1",
            [email]
        );


        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }


        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);


        // Insert user into database
        const result = await pool.query(
            `
            INSERT INTO users
                (full_name, email, password_hash)
            VALUES
                ($1, $2, $3)
            RETURNING user_id, full_name, email, created_at
            `,
            [full_name, email, passwordHash]
        );


        // Registration successful
        res.status(201).json({
            success: true,
            message: "Registration successful",
            user: result.rows[0]
        });


    } catch (error) {

        console.error("REGISTER ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Registration failed"
        });

    }
});


// ==================================================
// LOGIN USER
// ==================================================

router.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body;


        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }


        // Find user by email
        const result = await pool.query(
            `
            SELECT
                user_id,
                full_name,
                email,
                password_hash
            FROM users
            WHERE email = $1
            `,
            [email]
        );


        // User not found
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }


        const user = result.rows[0];


        // Compare entered password
        // with the bcrypt password hash
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );


        // Password is incorrect
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }


        // Login successful
        res.json({
            success: true,
            message: "Login successful",

            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email
            }
        });


    } catch (error) {

        console.error("LOGIN ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Login failed"
        });

    }
});


// ==================================================
// EXPORT ROUTER
// ==================================================

module.exports = router;