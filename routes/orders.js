const express = require("express");
const router = express.Router();

const pool = require("../db");


// =====================================================
// PLACE ORDER
// =====================================================

router.post("/create", async (req, res) => {

    const client = await pool.connect();

    try {

        const {
            user_id,
            address_id
        } = req.body;


        // Check required fields
        if (!user_id || !address_id) {

            return res.status(400).json({
                success: false,
                message: "User ID and address ID are required"
            });

        }


        // Start database transaction
        await client.query("BEGIN");


        // =================================================
        // CHECK ADDRESS
        // =================================================

        const addressResult = await client.query(
            `
            SELECT *
            FROM addresses
            WHERE address_id = $1
            AND user_id = $2
            `,
            [
                address_id,
                user_id
            ]
        );


        if (addressResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Address not found"
            });

        }


        // =================================================
        // GET CART
        // =================================================

        const cartResult = await client.query(
            `
            SELECT
                cart.product_id,
                cart.quantity,
                products.product_name,
                products.price
            FROM cart
            JOIN products
                ON cart.product_id = products.product_id
            WHERE cart.user_id = $1
            `,
            [user_id]
        );


        // Check if cart is empty
        if (cartResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });

        }


        // =================================================
        // CALCULATE TOTAL
        // =================================================

        let totalAmount = 0;

        for (const item of cartResult.rows) {

            totalAmount +=
                Number(item.price) *
                Number(item.quantity);

        }


        // =================================================
        // CREATE ORDER
        // =================================================

        const orderResult = await client.query(
            `
            INSERT INTO orders
                (
                    user_id,
                    address_id,
                    total_amount,
                    order_status
                )
            VALUES
                ($1, $2, $3, $4)
            RETURNING *
            `,
            [
                user_id,
                address_id,
                totalAmount,
                "Pending"
            ]
        );


        const order = orderResult.rows[0];


        // =================================================
        // CREATE ORDER ITEMS
        // =================================================

        for (const item of cartResult.rows) {

            await client.query(
                `
                INSERT INTO order_items
                    (
                        order_id,
                        product_id,
                        quantity,
                        price
                    )
                VALUES
                    ($1, $2, $3, $4)
                `,
                [
                    order.order_id,
                    item.product_id,
                    item.quantity,
                    item.price
                ]
            );

        }


        // =================================================
        // CLEAR CART
        // =================================================

        await client.query(
            `
            DELETE FROM cart
            WHERE user_id = $1
            `,
            [user_id]
        );


        // =================================================
        // COMPLETE TRANSACTION
        // =================================================

        await client.query("COMMIT");


        // =================================================
        // SEND RESPONSE
        // =================================================

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: order,
            items: cartResult.rows
        });


    } catch (error) {

        // Undo all database changes if something fails
        await client.query("ROLLBACK");

        console.error(
            "CREATE ORDER ERROR:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Unable to place order"
        });


    } finally {

        // Release database connection
        client.release();

    }

});


module.exports = router;