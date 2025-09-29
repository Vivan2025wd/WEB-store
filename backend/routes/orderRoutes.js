import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// Create order (after payment success)
router.post("/create", async (req, res) => {
  try {
    const { storeId, products, buyerInfo, total } = req.body;

    // Simple 10% commission
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
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order history (by buyer email or store owner)
router.get("/history/:email", async (req, res) => {
  try {
    const orders = await Order.find({ "buyerInfo.email": req.params.email });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
