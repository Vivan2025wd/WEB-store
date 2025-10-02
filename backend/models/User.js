import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }, // ✅ Fixed: matches authRoutes
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add index for better query performance
userSchema.index({ email: 1 });

export default mongoose.model("User", userSchema);