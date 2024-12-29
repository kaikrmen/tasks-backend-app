// app.js
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const { connectDB } = require("./config/db");
const cors = require("cors")
const app = express();

app.use(express.json());
app.use(cors());
// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

connectDB();

module.exports = app;