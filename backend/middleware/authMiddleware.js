import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Standard authentication middleware
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch full user object (optional, for additional checks)
    const user = await User.findById(decoded.id).select("-passwordHash");
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { id: user._id, email: user.email, isAdmin: user.isAdmin }; // ✅ Consistent structure
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Invalid token" });
  }
};

// Admin-only middleware (use after authMiddleware)
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Optional middleware - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-passwordHash");
      
      if (user) {
        req.user = { id: user._id, email: user.email, isAdmin: user.isAdmin };
      }
    }
  } catch (err) {
    // Silently fail - optional auth
  }
  next();
};

export default authMiddleware;