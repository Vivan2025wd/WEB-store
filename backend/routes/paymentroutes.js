import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/Order.js";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // ✅ Add to .env

// Create Stripe Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { products, storeId, buyerInfo } = req.body;

    // Validation
    if (!products || !products.length) {
      return res.status(400).json({ error: "Products array is required" });
    }
    if (!storeId) {
      return res.status(400).json({ error: "Store ID is required" });
    }
    if (!buyerInfo || !buyerInfo.email) {
      return res.status(400).json({ error: "Buyer info is required" });
    }

    const lineItems = products.map((p) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: p.name,
          description: p.description || "",
        },
        unit_amount: Math.round(p.price * 100), // ✅ Ensure integer (cents)
      },
      quantity: p.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout-cancel`,
      customer_email: buyerInfo.email,
      metadata: {
        storeId,
        buyerEmail: buyerInfo.email,
        buyerName: buyerInfo.name,
        products: JSON.stringify(products), // Store for webhook
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe session creation error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// ✅ Stripe Webhook Handler (handles payment confirmation)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        // Extract metadata
        const { storeId, buyerEmail, buyerName, products } = session.metadata;

        try {
          const productsParsed = JSON.parse(products);
          const total = session.amount_total / 100; // Convert from cents

          // Calculate commission
          const commissionRate = 0.1;
          const commission = total * commissionRate;

          // Create order
          const order = new Order({
            storeId,
            products: productsParsed,
            buyerInfo: {
              name: buyerName,
              email: buyerEmail,
            },
            total,
            commission,
            paymentStatus: "paid", // ✅ Mark as paid
          });

          await order.save();
          console.log(`✅ Order created: ${order._id}`);
        } catch (err) {
          console.error("Error creating order from webhook:", err);
        }
        break;
      }

      case "checkout.session.expired":
      case "payment_intent.payment_failed": {
        console.log("❌ Payment failed or session expired");
        // Optionally handle failed payments
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

// Get session details (for success page)
router.get("/session/:sessionId", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json(session);
  } catch (err) {
    console.error("Session retrieval error:", err);
    res.status(500).json({ error: "Failed to retrieve session" });
  }
});

export default router;