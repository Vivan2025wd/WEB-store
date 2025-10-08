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
const requiredEnvVars = [
  'MONGO_URI', 
  'JWT_SECRET', 
  'STRIPE_SECRET_KEY', 
  'STRIPE_WEBHOOK_SECRET',
  'CLIENT_URL'
];

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

// ✅ CRITICAL: Webhook route MUST be before JSON parser
app.use("/payment/webhook", paymentRoutes);

// Body parsing middleware (applied to all other routes)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Custom NoSQL injection sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    Object.keys(obj).forEach(key => {
      // Remove keys that start with $ or contain .
      if (key.startsWith('$') || key.includes('.')) {
        console.log(`Sanitized key: ${key}`);
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    });
    return obj;
  };

  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  if (req.query) sanitize(req.query);
  
  next();
};

app.use(sanitizeInput);

// Rate limiting for auth routes
// ✅ UPDATED: More lenient limits for development
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // 100 in dev, 5 in prod
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for local development if needed
  skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '::1',
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 500, // Higher in dev
  message: "Too many requests, please try again later",
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use("/auth", authLimiter, authRoutes);
app.use("/store", apiLimiter, storeRoutes);
app.use("/products", apiLimiter, productRoutes);
app.use("/orders", apiLimiter, orderRoutes);
app.use("/payment", apiLimiter, paymentRoutes); // Non-webhook routes
app.use("/admin", apiLimiter, adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.originalUrl 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: "Validation failed",
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      error: "Duplicate entry",
      field: Object.keys(err.keyPattern)[0]
    });
  }
  
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
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`✅ Client URL: ${process.env.CLIENT_URL}`);
      console.log(`✅ Auth rate limit: ${process.env.NODE_ENV === 'production' ? '5' : '100'} requests per 15 min`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
  });