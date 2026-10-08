const express = require("express");
const router = express.Router();

const pool = require("../db");


// =====================================================
// ADD ADDRESS
// =====================================================

router.post("/add", async (req, res) => {

    try {

        const {
            user_id,
            full_name,
            phone,
            address_line,
            city,
            state,
            pincode,
            address_type
        } = req.body;


        // Check required fields
        if (
            !user_id ||
            !full_name ||
            !phone ||
            !address_line ||
            !city ||
            !state ||
            !pincode
        ) {

            return res.status(400).json({
                success: false,
                message: "Please provide all required address details"
            });

        }


        // Insert address into PostgreSQL
        const result = await pool.query(
            `
            INSERT INTO addresses
                (
                    user_id,
                    full_name,
                    phone,
                    address_line,
                    city,
                    state,
                    pincode,
                    address_type
                )
            VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
            `,
            [
                user_id,
                full_name,
                phone,
                address_line,
                city,
                state,
                pincode,
                address_type || "Home"
            ]
        );


        res.status(201).json({
            success: true,
            message: "Address saved successfully",
            address: result.rows[0]
        });


    } catch (error) {

        console.error(
            "ADD ADDRESS ERROR:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Unable to save address"
        });

    }

});


// =====================================================
// GET USER ADDRESSES
// =====================================================

router.get("/:userId", async (req, res) => {

    try {

        const userId =
            req.params.userId;


        const result = await pool.query(
            `
            SELECT
                address_id,
                user_id,
                full_name,
                phone,
                address_line,
                city,
                state,
                pincode,
                address_type,
                created_at
            FROM addresses
            WHERE user_id = $1
            ORDER BY address_id DESC
            `,
            [userId]
        );


        res.json({
            success: true,
            addresses: result.rows
        });


    } catch (error) {

        console.error(
            "GET ADDRESSES ERROR:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Unable to fetch addresses"
        });

    }

});


module.exports = router;