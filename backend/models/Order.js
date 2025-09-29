import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
      },
    ],
    buyerInfo: {
      name: String,
      email: String,
    },
    total: { type: Number, required: true },
    commission: { type: Number, required: true }, // platform fee
    paymentStatus: { type: String, default: "pending" }, // pending, paid, failed
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
