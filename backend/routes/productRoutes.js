import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// Add product
router.post("/add", async (req, res) => {
  try {
    const { storeId, name, price, description, image } = req.body;

    const product = new Product({ storeId, name, price, description, image });
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit product
router.put("/:id/edit", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product
router.delete("/:id/delete", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get products by store
router.get("/store/:storeId", async (req, res) => {
  try {
    const products = await Product.find({ storeId: req.params.storeId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
