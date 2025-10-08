import express from "express";
import { body, validationResult } from "express-validator";
import Product from "../models/Product.js";
import Store from "../models/Store.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Middleware to verify store ownership (now actually used)
const verifyStoreOwnership = async (req, res, next) => {
  try {
    const storeId = req.body.storeId || req.params.storeId;
    
    if (!storeId) {
      return res.status(400).json({ error: "Store ID is required" });
    }
    
    const store = await Store.findById(storeId);
    
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    if (store.ownerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized for this store" });
    }

    req.store = store; // Attach to request
    next();
  } catch (err) {
    console.error("Store verification error:", err);
    res.status(500).json({ error: "Store verification failed" });
  }
};

// Add product (Protected)
router.post(
  "/add",
  authMiddleware,
  verifyStoreOwnership, // ✅ Now using the middleware
  [
    body("storeId").notEmpty().withMessage("Store ID is required"),
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("price")
      .isFloat({ min: 0.01 })
      .withMessage("Price must be greater than 0"),
    body("description").optional().trim(),
    body("image").optional().isURL().withMessage("Image must be a valid URL"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { storeId, name, price, description, image } = req.body;

      // Store ownership already verified by middleware
      const product = new Product({
        storeId,
        name,
        price,
        description: description || "",
        image: image || "",
      });

      await product.save();
      res.status(201).json(product);
    } catch (err) {
      console.error("Product creation error:", err);
      res.status(500).json({ error: "Failed to create product" });
    }
  }
);

// Edit product (Protected)
router.put(
  "/:id",
  authMiddleware,
  [
    body("name").optional().trim().notEmpty().withMessage("Product name cannot be empty"),
    body("price").optional().isFloat({ min: 0.01 }).withMessage("Price must be greater than 0"),
    body("description").optional().trim(),
    body("image").optional().isURL().withMessage("Image must be a valid URL"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Verify store ownership
      const store = await Store.findById(product.storeId);
      if (!store || store.ownerId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ error: "Not authorized to edit this product" });
      }

      const { name, price, description, image } = req.body;

      if (name !== undefined) product.name = name;
      if (price !== undefined) product.price = price;
      if (description !== undefined) product.description = description;
      if (image !== undefined) product.image = image;

      await product.save();
      res.json(product);
    } catch (err) {
      console.error("Product update error:", err);
      res.status(500).json({ error: "Failed to update product" });
    }
  }
);

// Delete product (Protected)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Verify store ownership
    const store = await Store.findById(product.storeId);
    if (!store || store.ownerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this product" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Product deletion error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Get products by store (Public)
router.get("/store/:storeId", async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = "-createdAt" } = req.query;
    
    // ✅ FIXED: Verify store exists and is active
    const store = await Store.findById(req.params.storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }
    
    if (!store.isActive) {
      return res.status(403).json({ error: "This store is currently unavailable" });
    }

    const products = await Product.find({ storeId: req.params.storeId })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const count = await Product.countDocuments({ storeId: req.params.storeId });

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
      store: {
        id: store._id,
        name: store.name,
        slug: store.slug
      }
    });
  } catch (err) {
    console.error("Products fetch error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get single product (Public)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // ✅ FIXED: Also check if the store is active
    const store = await Store.findById(product.storeId);
    if (!store || !store.isActive) {
      return res.status(403).json({ error: "This product is currently unavailable" });
    }

    res.json({
      ...product.toObject(),
      store: {
        id: store._id,
        name: store.name,
        slug: store.slug
      }
    });
  } catch (err) {
    console.error("Product fetch error:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// ✅ NEW: Bulk get products by IDs (useful for cart/checkout)
router.post("/bulk", async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: "Product IDs array is required" });
    }

    const products = await Product.find({ _id: { $in: productIds } });
    
    res.json(products);
  } catch (err) {
    console.error("Bulk products fetch error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

export default router;