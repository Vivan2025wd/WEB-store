import express from "express";
import { body, validationResult } from "express-validator";
import Order from "../models/Order.js";
import Store from "../models/Store.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create order (Called after successful payment)
router.post(
  "/create",
  [
    body("storeId").notEmpty().withMessage("Store ID is required"),
    body("products").isArray({ min: 1 }).withMessage("Products array required"),
    body("buyerInfo.name").trim().notEmpty().withMessage("Buyer name required"),
    body("buyerInfo.email").isEmail().withMessage("Valid email required"),
    body("total").isFloat({ min: 0 }).withMessage("Valid total required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { storeId, products, buyerInfo, total } = req.body;

      // ✅ Verify store exists
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }

      // Calculate commission (10%)
      const commissionRate = 0.1;
      const commission = total * commissionRate;

      const order = new Order({
        storeId,
        products,
        buyerInfo,
        total,
        commission,
        paymentStatus: "pending",
      });

      await order.save();
      res.status(201).json(order);
    } catch (err) {
      console.error("Order creation error:", err);
      res.status(500).json({ error: "Failed to create order" });
    }
  }
);

// Get order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("storeId", "name slug")
      .populate("products.productId", "name price");
    
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

    const orders = await Order.find({ "buyerInfo.email": req.params.email })
      .populate("storeId", "name slug")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Order.countDocuments({ "buyerInfo.email": req.params.email });

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
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
    // ✅ Verify store ownership
    const store = await Store.findById(req.params.storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }
    if (store.ownerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized to view these orders" });
    }

    const { page = 1, limit = 20 } = req.query;

    const orders = await Order.find({ storeId: req.params.storeId })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Order.countDocuments({ storeId: req.params.storeId });

    // Calculate store revenue
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total - order.commission), 0);

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
      totalRevenue,
    });
  } catch (err) {
    console.error("Store orders fetch error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Update order payment status (For webhook)
router.put("/:id/payment-status", async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!["pending", "paid", "failed"].includes(paymentStatus)) {
      return res.status(400).json({ error: "Invalid payment status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("Payment status update error:", err);
    res.status(500).json({ error: "Failed to update payment status" });
  }
});

export default router;