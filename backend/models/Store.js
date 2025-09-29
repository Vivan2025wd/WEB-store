import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String },
    theme: { type: String, default: "light" },
  },
  { timestamps: true }
);

const Store = mongoose.model("Store", storeSchema);

export default Store; // 👈 important
