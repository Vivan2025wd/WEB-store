import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import storeRoutes from "./routes/storeRoutes.js"; // 👈 will now work

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/store", storeRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log(`✅ Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error(err));
