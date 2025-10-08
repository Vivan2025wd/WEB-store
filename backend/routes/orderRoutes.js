import express from "express";
import { body, validationResult } from "express-validator";
import Order from "../models/Order.js";
import Store from "../models/Store.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ REMOVED: This should only be created via Stripe webhook
// Create order endpoint removed - orders are created automatically by payment webhook

// Get order by ID (Public - anyone with the order ID can view it)
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("storeId", "name slug")
      .populate("products.productId", "name price image");
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("Order fetch error:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Get order history by buyer email
router.get("/history/:email", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.params.email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const orders = await Order.find({ "buyerInfo.email": req.params.email })
      .populate("storeId", "name slug")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Order.countDocuments({ "buyerInfo.email": req.params.email });

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
    });
  } catch (err) {
    console.error("Order history fetch error:", err);
    res.status(500).json({ error: "Failed to fetch order history" });
  }
});

// Get orders for a store (Protected - store owner only)
router.get("/store/:storeId", authMiddleware, async (req, res) => {
  try {
    // Verify store ownership
    const store = await Store.findById(req.params.storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }
    if (store.ownerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized to view these orders" });
    }

    const { page = 1, limit = 20, status } = req.query;

    // Build query
    const query = { storeId: req.params.storeId };
    if (status) {
      query.paymentStatus = status;
    }

    const orders = await Order.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Order.countDocuments(query);

    // ✅ FIXED: Calculate revenue from ALL paid orders, not just current page
    const allPaidOrders = await Order.find({ 
      storeId: req.params.storeId,
      paymentStatus: "paid" 
    });
    
    const totalRevenue = allPaidOrders.reduce((sum, order) => 
      sum + (order.total - order.commission), 0
    );

    const totalOrders = allPaidOrders.length;
    const totalGrossRevenue = allPaidOrders.reduce((sum, order) => sum + order.total, 0);
    const totalCommission = allPaidOrders.reduce((sum, order) => sum + order.commission, 0);

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
      stats: {
        totalRevenue, // Net revenue after commission
        totalGrossRevenue, // Total before commission
        totalCommission,
        totalOrders
      }
    });
  } catch (err) {
    console.error("Store orders fetch error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ✅ REMOVED: Payment status should only be updated by webhook
// This endpoint was a security risk - removed

// ✅ NEW: Get order statistics for store owner
router.get("/store/:storeId/stats", authMiddleware, async (req, res) => {
  try {
    // Verify store ownership
    const store = await Store.findById(req.params.storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }
    if (store.ownerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const orders = await Order.find({ 
      storeId: req.params.storeId,
      paymentStatus: "paid"
    });

    // Calculate stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total - o.commission), 0);
    const totalGrossRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalCommission = orders.reduce((sum, o) => sum + o.commission, 0);

    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? totalGrossRevenue / totalOrders : 0;

    // Get top selling products
    const productSales = {};
    orders.forEach(order => {
      order.products.forEach(product => {
        const id = product.productId?.toString() || 'unknown';
        if (!productSales[id]) {
          productSales[id] = {
            productId: id,
            name: product.name,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[id].quantity += product.quantity || 1;
        productSales[id].revenue += product.price * (product.quantity || 1);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Orders by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentOrders = orders.filter(o => o.createdAt >= sixMonthsAgo);
    const ordersByMonth = {};
    
    recentOrders.forEach(order => {
      const month = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!ordersByMonth[month]) {
        ordersByMonth[month] = { count: 0, revenue: 0 };
      }
      ordersByMonth[month].count += 1;
      ordersByMonth[month].revenue += (order.total - order.commission);
    });

    res.json({
      totalOrders,
      totalRevenue,
      totalGrossRevenue,
      totalCommission,
      avgOrderValue,
      topProducts,
      ordersByMonth
    });
  } catch (err) {
    console.error("Store stats fetch error:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

export default router;