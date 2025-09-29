import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    image: { type: String }, // could be an image URL (later integrate uploads)
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
