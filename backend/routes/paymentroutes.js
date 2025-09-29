import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { products, storeId, buyerInfo } = req.body;

    const lineItems = products.map((p) => ({
      price_data: {
        currency: "usd",
        product_data: { name: p.name },
        unit_amount: p.price * 100, // cents
      },
      quantity: p.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/checkout-success`,
      cancel_url: `${process.env.CLIENT_URL}/checkout-cancel`,
      metadata: { storeId, buyerEmail: buyerInfo.email },
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
