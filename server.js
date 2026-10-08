const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./db");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "FreshHarvest backend is running!"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "PostgreSQL connected successfully!",
            databaseTime: result.rows[0].now
        });

    } catch (error) {
        console.error("DATABASE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
});

// Products route
const productsRoutes = require("./routes/products");

app.use("/api/products", productsRoutes);
// Cart routes
const cartRoutes = require("./routes/cart");

app.use("/api/cart", cartRoutes);
// Address routes
const addressesRoutes = require("./routes/addresses");

app.use("/api/addresses", addressesRoutes);
// Order routes
const ordersRoutes = require("./routes/orders");

app.use("/api/orders", ordersRoutes);

const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});