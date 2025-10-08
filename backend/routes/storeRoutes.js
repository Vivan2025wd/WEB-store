import express from "express";
import { body, validationResult } from "express-validator";
import multer from "multer";
import path from "path";
import Store from "../models/Store.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/store-logos/'); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Create store (Protected)
router.post(
  "/create",
  authMiddleware,
  upload.single('logo'), // Handle single file upload with field name 'logo'
  [
    body("name").trim().notEmpty().withMessage("Store name is required"),
    body("slug")
      .trim()
      .notEmpty()
      .matches(/^[a-z0-9-]+$/)
      .withMessage("Slug must be lowercase letters, numbers, and hyphens only")
      .isLength({ min: 3, max: 50 })
      .withMessage("Slug must be between 3 and 50 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, slug, theme } = req.body;
      
      // Get logo path if file was uploaded
      const logoPath = req.file ? `/uploads/store-logos/${req.file.filename}` : "";

      // Check if slug already exists
      const existingStore = await Store.findOne({ slug });
      if (existingStore) {
        return res.status(400).json({ message: "Store slug already taken" });
      }

      // Check if user already has a store (optional - remove if multiple stores allowed)
      const userStore = await Store.findOne({ ownerId: req.user.id });
      if (userStore) {
        return res.status(400).json({ 
          message: "You already have a store",
          existingStore: {
            id: userStore._id,
            name: userStore.name,
            slug: userStore.slug
          }
        });
      }

      const store = new Store({
        ownerId: req.user.id,
        name,
        slug,
        logo: logoPath,
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
  upload.single('logo'),
  [
    body("name").optional().trim().notEmpty().withMessage("Store name cannot be empty"),
    body("theme").optional().isIn(["light", "dark"]).withMessage("Theme must be light or dark"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const store = await Store.findById(req.params.id);
      
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }

      // Verify ownership
      if (store.ownerId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ error: "Not authorized to edit this store" });
      }

      const { name, theme } = req.body;
      
      if (name) store.name = name;
      if (theme) store.theme = theme;
      
      // Update logo if new file uploaded
      if (req.file) {
        store.logo = `/uploads/store-logos/${req.file.filename}`;
      }

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

    // Verify ownership
    if (store.ownerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized to view this store" });
    }

    // Get product count
    const productCount = await Product.countDocuments({ storeId: store._id });

    res.json({
      ...store.toObject(),
      productCount
    });
  } catch (err) {
    console.error("Store fetch error:", err);
    res.status(500).json({ error: "Failed to fetch store" });
  }
});

// Get user's own stores (Protected)
router.get("/user/my-stores", authMiddleware, async (req, res) => {
  try {
    const stores = await Store.find({ ownerId: req.user.id });
    
    // Add product count for each store
    const storesWithCounts = await Promise.all(
      stores.map(async (store) => {
        const productCount = await Product.countDocuments({ storeId: store._id });
        return {
          ...store.toObject(),
          productCount
        };
      })
    );
    
    res.json(storesWithCounts);
  } catch (err) {
    console.error("Stores fetch error:", err);
    res.status(500).json({ error: "Failed to fetch stores" });
  }
});

// Get store by slug (Public - for storefront)
router.get("/public/slug/:slug", async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug }).select("-ownerId");
    
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    if (!store.isActive) {
      return res.status(403).json({ error: "This store is currently unavailable" });
    }

    // Fetch products belonging to this store
    const products = await Product.find({ storeId: store._id }).sort({ createdAt: -1 });

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

    // Verify ownership
    if (store.ownerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this store" });
    }

    // Delete all products associated with store
    const deletedProducts = await Product.deleteMany({ storeId: store._id });
    
    await Store.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: "Store and associated products deleted successfully",
      deletedProductCount: deletedProducts.deletedCount
    });
  } catch (err) {
    console.error("Store deletion error:", err);
    res.status(500).json({ error: "Failed to delete store" });
  }
});

export default router;