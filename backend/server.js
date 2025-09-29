import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import storeRoutes from "./routes/storeRoutes.js"; // 👈 will now work
import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();


// Routes
app.use("/store", storeRoutes);
app.use("/products", productRoutes);
app.use("/admin", adminRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log(`✅ Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error(err));
