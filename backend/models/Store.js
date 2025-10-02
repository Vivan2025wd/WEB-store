import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { type: String },
    theme: { type: String, default: "light", enum: ["light", "dark"] },
    isActive: { type: Boolean, default: true }, // ✅ For admin to suspend stores
  },
  { timestamps: true }
);

// Index for faster queries
storeSchema.index({ slug: 1 });
storeSchema.index({ ownerId: 1 });

const Store = mongoose.model("Store", storeSchema);

export default Store;