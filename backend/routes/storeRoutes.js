// backend/routes/storeRoutes.js
import express from "express";
import Store from "../models/Store.js";
import Product from "../models/Product.js"; // 👈 for fetching products with the store

const router = express.Router();

// Create store
router.post("/create", async (req, res) => {
  try {
    const { ownerId, name, slug, logo, theme } = req.body;
    const store = new Store({ ownerId, name, slug, logo, theme });
    await store.save();
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get store by ID
router.get("/:id", async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ error: "Store not found" });
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get store by slug (Public Storefront)
router.get("/slug/:slug", async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug });
    if (!store) return res.status(404).json({ error: "Store not found" });

    // Fetch products belonging to this store
    const products = await Product.find({ storeId: store._id });

    res.json({
      store,
      products,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
