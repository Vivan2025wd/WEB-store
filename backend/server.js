import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentroutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'STRIPE_SECRET_KEY', 'CLIENT_URL'];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: "10mb" })); // ✅ Added with size limit
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many attempts, please try again later",
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Routes
app.use("/auth", authLimiter, authRoutes); // ✅ Added with rate limiting
app.use("/store", storeRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes); // ✅ Added
app.use("/payment", paymentRoutes); // ✅ Added
app.use("/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : err.message
  });
});

// Connect to database and start server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
  });