const express = require("express");
const router = express.Router();

const pool = require("../db");


// ==================================================
// GET USER CART
// ==================================================

router.get("/:userId", async (req, res) => {

    try {

        const userId = req.params.userId;

        const result = await pool.query(
            `
            SELECT
                cart.cart_id,
                cart.user_id,
                cart.product_id,
                cart.quantity,
                products.product_name,
                products.price,
                products.image_url,
                products.description
            FROM cart
            JOIN products
                ON cart.product_id = products.product_id
            WHERE cart.user_id = $1
            ORDER BY cart.cart_id
            `,
            [userId]
        );

        res.json({
            success: true,
            cart: result.rows
        });

    } catch (error) {

        console.error("GET CART ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch cart"
        });

    }

});


// ==================================================
// ADD PRODUCT TO CART
// ==================================================

router.post("/add", async (req, res) => {

    try {

        const {
            user_id,
            product_id,
            quantity
        } = req.body;


        if (!user_id || !product_id) {

            return res.status(400).json({
                success: false,
                message: "User ID and product ID are required"
            });

        }


        const productQuantity = quantity || 1;


        // Check whether product already exists
        const existingItem = await pool.query(
            `
            SELECT cart_id, quantity
            FROM cart
            WHERE user_id = $1
            AND product_id = $2
            `,
            [user_id, product_id]
        );


        // Product already in cart
        if (existingItem.rows.length > 0) {

            const newQuantity =
                existingItem.rows[0].quantity + productQuantity;


            const result = await pool.query(
                `
                UPDATE cart
                SET quantity = $1
                WHERE cart_id = $2
                RETURNING *
                `,
                [
                    newQuantity,
                    existingItem.rows[0].cart_id
                ]
            );


            return res.json({
                success: true,
                message: "Cart quantity updated",
                cartItem: result.rows[0]
            });

        }


        // Product not in cart → insert it
        const result = await pool.query(
            `
            INSERT INTO cart
                (user_id, product_id, quantity)
            VALUES
                ($1, $2, $3)
            RETURNING *
            `,
            [
                user_id,
                product_id,
                productQuantity
            ]
        );


        res.status(201).json({
            success: true,
            message: "Product added to cart",
            cartItem: result.rows[0]
        });


    } catch (error) {

        console.error("ADD CART ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to add product to cart"
        });

    }

});


// ==================================================
// REMOVE PRODUCT FROM CART
// ==================================================

router.delete("/:userId/:productId", async (req, res) => {

    try {

        const {
            userId,
            productId
        } = req.params;


        await pool.query(
            `
            DELETE FROM cart
            WHERE user_id = $1
            AND product_id = $2
            `,
            [userId, productId]
        );


        res.json({
            success: true,
            message: "Product removed from cart"
        });


    } catch (error) {

        console.error("REMOVE CART ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to remove product from cart"
        });

    }

});
// UPDATE CART QUANTITY
router.put("/:userId/:productId", async (req, res) => {
    try {
        const {
            userId,
            productId
        } = req.params;

        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        const result = await pool.query(
            `
            UPDATE cart
            SET quantity = $1
            WHERE user_id = $2
            AND product_id = $3
            RETURNING *
            `,
            [
                quantity,
                userId,
                productId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        res.json({
            success: true,
            message: "Cart quantity updated",
            cartItem: result.rows[0]
        });

    } catch (error) {
        console.error("UPDATE CART ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update cart quantity"
        });
    }
});

module.exports = router;