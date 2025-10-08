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
    const { page = 1, limit = 20, search = "" } = req.query;

    // Build search query
    const query = { isAdmin: false };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const sellers = await User.find(query)
      .select("-passwordHash")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      sellers,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
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
    const { page = 1, limit = 20, search = "", status = "" } = req.query;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } }
      ];
    }
    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    const stores = await Store.find(query)
      .populate("ownerId", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Store.countDocuments(query);

    res.json({
      stores,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
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
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = { paymentStatus: "paid" };
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(dateFilter);

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
          isActive: store?.isActive || false,
          owner: store?.ownerId || null,
        };
      })
    );

    // Additional stats
    const totalOrders = orders.length;
    const totalStores = await Store.countDocuments();
    const activeStores = await Store.countDocuments({ isActive: true });
    const totalSellers = await User.countDocuments({ isAdmin: false });
    const totalProducts = await Product.countDocuments();

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await Order.countDocuments({
      paymentStatus: "paid",
      createdAt: { $gte: thirtyDaysAgo }
    });

    const recentStores = await Store.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      overview: {
        totalRevenue,
        totalCommission,
        sellerRevenue,
        totalOrders,
        totalStores,
        activeStores,
        totalSellers,
        totalProducts,
        recentOrders,
        recentStores,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        avgCommissionRate: totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0
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
    const { page = 1, limit = 20, status, storeId, search = "" } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.paymentStatus = status;
    }
    if (storeId) {
      query.storeId = storeId;
    }
    if (search) {
      query["buyerInfo.email"] = { $regex: search, $options: "i" };
    }

    const orders = await Order.find(query)
      .populate("storeId", "name slug")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
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

    // Calculate additional metrics
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = await Order.countDocuments({
      storeId: { $in: storeIds },
      paymentStatus: "paid",
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      seller,
      stores,
      stats: {
        totalOrders: orders.length,
        totalRevenue,
        totalCommission,
        sellerEarnings,
        productCount,
        avgOrderValue,
        recentOrders,
        storeCount: stores.length
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

    // ✅ Check if there are any paid orders
    const paidOrders = await Order.countDocuments({
      storeId: { $in: storeIds },
      paymentStatus: "paid"
    });

    if (paidOrders > 0) {
      return res.status(400).json({ 
        error: "Cannot delete seller with order history",
        message: "This seller has completed orders. Consider deactivating their stores instead.",
        paidOrderCount: paidOrders
      });
    }

    // Delete products
    const deletedProducts = await Product.deleteMany({ storeId: { $in: storeIds } });

    // Delete pending/failed orders (keep paid orders for records)
    const deletedOrders = await Order.deleteMany({ 
      storeId: { $in: storeIds },
      paymentStatus: { $in: ["pending", "failed"] }
    });

    // Delete stores
    await Store.deleteMany({ ownerId: user._id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({ 
      message: "Seller and associated data deleted successfully",
      deletedProducts: deletedProducts.deletedCount,
      deletedOrders: deletedOrders.deletedCount,
      deletedStores: stores.length
    });
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
    ).populate("ownerId", "name email");

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.json({
      ...store.toObject(),
      message: isActive ? "Store activated successfully" : "Store suspended successfully"
    });
  } catch (err) {
    console.error("Store status update error:", err);
    res.status(500).json({ error: "Failed to update store status" });
  }
});

// ✅ NEW: Get dashboard overview
router.get("/dashboard", async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Today's stats
    const todayOrders = await Order.countDocuments({
      paymentStatus: "paid",
      createdAt: { $gte: startOfDay }
    });

    const todayRevenue = await Order.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    // Month's stats
    const monthOrders = await Order.countDocuments({
      paymentStatus: "paid",
      createdAt: { $gte: startOfMonth }
    });

    const monthRevenue = await Order.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    // Year's stats
    const yearRevenue = await Order.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    res.json({
      today: {
        orders: todayOrders,
        revenue: todayRevenue[0]?.total || 0
      },
      month: {
        orders: monthOrders,
        revenue: monthRevenue[0]?.total || 0
      },
      year: {
        revenue: yearRevenue[0]?.total || 0
      },
      totals: {
        sellers: await User.countDocuments({ isAdmin: false }),
        stores: await Store.countDocuments(),
        activeStores: await Store.countDocuments({ isActive: true }),
        products: await Product.countDocuments(),
        orders: await Order.countDocuments({ paymentStatus: "paid" })
      }
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

export default router;