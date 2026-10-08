const express = require("express");
const router = express.Router();

const pool = require("../db");

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                product_id,
                product_name,
                category,
                price,
                image_url,
                description,
                product_type
            FROM products
            ORDER BY product_id
        `);

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to fetch products"
        });
    }
});

module.exports = router;