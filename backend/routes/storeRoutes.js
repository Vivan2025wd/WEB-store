import express from "express";
import { body, validationResult } from "express-validator";
import Store from "../models/Store.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create store (Protected)
router.post(
  "/create",
  authMiddleware,
  [
    body("name").trim().notEmpty().withMessage("Store name is required"),
    body("slug")
      .trim()
      .notEmpty()
      .matches(/^[a-z0-9-]+$/)
      .withMessage("Slug must be lowercase letters, numbers, and hyphens only"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, slug, logo, theme } = req.body;

      // Check if slug already exists
      const existingStore = await Store.findOne({ slug });
      if (existingStore) {
        return res.status(400).json({ message: "Store slug already taken" });
      }

      // Check if user already has a store (optional - remove if multiple stores allowed)
      const userStore = await Store.findOne({ ownerId: req.user.id });
      if (userStore) {
        return res.status(400).json({ message: "You already have a store" });
      }

      const store = new Store({
        ownerId: req.user.id, // ✅ Use authenticated user
        name,
        slug,
        logo,
        theme: theme || "light",
      });

      await store.save();
      res.status(201).json(store);
    } catch (err) {
      console.error("Store creation error:", err);
      res.status(500).json({ error: "Failed to create store" });
    }
  }
);

// Update store (Protected - owner only)
router.put(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);
      
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }

      // ✅ Verify ownership
      if (store.ownerId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ error: "Not authorized to edit this store" });
      }

      const { name, logo, theme } = req.body;
      
      if (name) store.name = name;
      if (logo !== undefined) store.logo = logo;
      if (theme) store.theme = theme;

      await store.save();
      res.json(store);
    } catch (err) {
      console.error("Store update error:", err);
      res.status(500).json({ error: "Failed to update store" });
    }
  }
);

// Get store by ID (Protected - owner only)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // ✅ Verify ownership
    if (store.ownerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized to view this store" });
    }

    res.json(store);
  } catch (err) {
    console.error("Store fetch error:", err);
    res.status(500).json({ error: "Failed to fetch store" });
  }
});

// Get user's own stores (Protected)
router.get("/my/stores", authMiddleware, async (req, res) => {
  try {
    const stores = await Store.find({ ownerId: req.user.id });
    res.json(stores);
  } catch (err) {
    console.error("Stores fetch error:", err);
    res.status(500).json({ error: "Failed to fetch stores" });
  }
});

// Get store by slug (Public - for storefront)
router.get("/slug/:slug", async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug }).select("-ownerId");
    
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Fetch products belonging to this store
    const products = await Product.find({ storeId: store._id });

    res.json({
      store,
      products,
    });
  } catch (err) {
    console.error("Public store fetch error:", err);
    res.status(500).json({ error: "Failed to fetch store" });
  }
});

// Delete store (Protected - owner only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // ✅ Verify ownership
    if (store.ownerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this store" });
    }

    // Delete all products associated with store
    await Product.deleteMany({ storeId: store._id });
    
    await Store.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Store and associated products deleted successfully" });
  } catch (err) {
    console.error("Store deletion error:", err);
    res.status(500).json({ error: "Failed to delete store" });
  }
});

export default router;