const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./config/swagger");
const { sequelize, testDatabaseConnection } = require("./config/database");
require("dotenv").config();

// Import route modules
const authRoutes = require("./routes/authRoutes");
const pumpRoutes = require("./routes/pumpRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

// Test database connection
testDatabaseConnection();

// Sync database models
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database tables have been created (if they didn't exist).");
  })
  .catch((err) => {
    console.error("Error synchronizing database:", err);
  });

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/pumps", pumpRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/inventory", inventoryRoutes);

// Endpoint to get Swagger JSON
app.get("/docs", (req, res) => {
  res.status(200).json(swaggerDocs);
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Swagger documentation is available at http://localhost:${PORT}/api-docs`
  );
});
