import express from "express";
import User from "../models/User.js";
import Store from "../models/Store.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { authMiddleware, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ All admin routes require authentication + admin role
router.use(authMiddleware, requireAdmin);

// Get all sellers (non-admin users)
router.get("/sellers", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const sellers = await User.find({ isAdmin: false })
      .select("-passwordHash")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments({ isAdmin: false });

    res.json({
      sellers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (err) {
    console.error("Sellers fetch error:", err);
    res.status(500).json({ error: "Failed to fetch sellers" });
  }
});

// Get all stores
router.get("/stores", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const stores = await Store.find()
      .populate("ownerId", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Store.countDocuments();

    res.json({
      stores,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (err) {
    console.error("Stores fetch error:", err);
    res.status(500).json({ error: "Failed to fetch stores" });
  }
});

// Get revenue and commission statistics
router.get("/stats", async (req, res) => {
  try {
    const orders = await Order.find({ paymentStatus: "paid" });

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalCommission = orders.reduce((sum, o) => sum + o.commission, 0);
    const sellerRevenue = totalRevenue - totalCommission;

    // Group by store
    const storeStats = {};
    for (const order of orders) {
      const storeId = order.storeId.toString();
      
      if (!storeStats[storeId]) {
        storeStats[storeId] = {
          storeId,
          revenue: 0,
          commission: 0,
          sellerEarnings: 0,
          orderCount: 0,
        };
      }

      storeStats[storeId].revenue += order.total;
      storeStats[storeId].commission += order.commission;
      storeStats[storeId].sellerEarnings += (order.total - order.commission);
      storeStats[storeId].orderCount += 1;
    }

    // Populate store details
    const storeStatsArray = await Promise.all(
      Object.values(storeStats).map(async (stat) => {
        const store = await Store.findById(stat.storeId)
          .populate("ownerId", "name email")
          .lean();
        return {
          ...stat,
          storeName: store?.name || "Unknown",
          storeSlug: store?.slug || "",
          owner: store?.ownerId || null,
        };
      })
    );

    // Additional stats
    const totalOrders = orders.length;
    const totalStores = await Store.countDocuments();
    const totalSellers = await User.countDocuments({ isAdmin: false });
    const totalProducts = await Product.countDocuments();

    res.json({
      overview: {
        totalRevenue,
        totalCommission,
        sellerRevenue,
        totalOrders,
        totalStores,
        totalSellers,
        totalProducts,
      },
      storeStats: storeStatsArray.sort((a, b) => b.revenue - a.revenue),
    });
  } catch (err) {
    console.error("Stats fetch error:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Get all orders
router.get("/orders", async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = status ? { paymentStatus: status } : {};

    const orders = await Order.find(query)
      .populate("storeId", "name slug")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (err) {
    console.error("Orders fetch error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get seller details with their store and stats
router.get("/sellers/:id", async (req, res) => {
  try {
    const seller = await User.findById(req.params.id).select("-passwordHash");
    
    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    if (seller.isAdmin) {
      return res.status(400).json({ error: "This user is an admin, not a seller" });
    }

    // Get seller's stores
    const stores = await Store.find({ ownerId: seller._id });
    const storeIds = stores.map(s => s._id);

    // Get orders for seller's stores
    const orders = await Order.find({
      storeId: { $in: storeIds },
      paymentStatus: "paid"
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalCommission = orders.reduce((sum, o) => sum + o.commission, 0);
    const sellerEarnings = totalRevenue - totalCommission;

    // Get product count
    const productCount = await Product.countDocuments({ storeId: { $in: storeIds } });

    res.json({
      seller,
      stores,
      stats: {
        totalOrders: orders.length,
        totalRevenue,
        totalCommission,
        sellerEarnings,
        productCount,
      },
    });
  } catch (err) {
    console.error("Seller details fetch error:", err);
    res.status(500).json({ error: "Failed to fetch seller details" });
  }
});

// Delete user (and their stores/products)
router.delete("/sellers/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isAdmin) {
      return res.status(400).json({ error: "Cannot delete admin users" });
    }

    // Find user's stores
    const stores = await Store.find({ ownerId: user._id });
    const storeIds = stores.map(s => s._id);

    // Delete products
    await Product.deleteMany({ storeId: { $in: storeIds } });

    // Note: Orders are kept for record-keeping
    // await Order.deleteMany({ storeId: { $in: storeIds } });

    // Delete stores
    await Store.deleteMany({ ownerId: user._id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "Seller and associated data deleted successfully" });
  } catch (err) {
    console.error("Seller deletion error:", err);
    res.status(500).json({ error: "Failed to delete seller" });
  }
});

// Suspend/activate store
router.put("/stores/:id/status", async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive must be a boolean" });
    }

    const store = await Store.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.json(store);
  } catch (err) {
    console.error("Store status update error:", err);
    res.status(500).json({ error: "Failed to update store status" });
  }
});

export default router;