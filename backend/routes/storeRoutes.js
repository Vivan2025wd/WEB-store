import express from "express";
import Store from "../models/Store.js";

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

export default router; // 👈 this is what server.js expects
