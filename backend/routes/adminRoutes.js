import express from "express";
import User from "../models/User.js";
import Store from "../models/Store.js";
import Order from "../models/Order.js";

const router = express.Router();

// Middleware to check admin role
const requireAdmin = async (req, res, next) => {
  // Assume userId is extracted from session/JWT
  const user = await User.findById(req.userId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};

// Get all stores & sellers
router.get("/sellers", requireAdmin, async (req, res) => {
  const sellers = await User.find({ isAdmin: false }).select("-password");
  res.json(sellers);
});

// Get revenue + commission stats
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find();

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalCommission = orders.reduce((sum, o) => sum + o.commission, 0);

    // Group by storeId
    const sellerStats = {};
    for (const o of orders) {
      if (!sellerStats[o.storeId]) sellerStats[o.storeId] = { revenue: 0, commission: 0 };
      sellerStats[o.storeId].revenue += o.total;
      sellerStats[o.storeId].commission += o.commission;
    }

    res.json({ totalRevenue, totalCommission, sellerStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
