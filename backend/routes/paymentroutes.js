import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/Order.js";
import Store from "../models/Store.js";
import Product from "../models/Product.js";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// ✅ Validate webhook secret on startup
if (!endpointSecret) {
  console.error("❌ CRITICAL: STRIPE_WEBHOOK_SECRET not set in environment variables");
  process.exit(1);
}

// Create Stripe Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { products, storeId, buyerInfo } = req.body;

    // Validation
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Products array is required" });
    }
    if (!storeId) {
      return res.status(400).json({ error: "Store ID is required" });
    }
    if (!buyerInfo || !buyerInfo.email || !buyerInfo.name) {
      return res.status(400).json({ error: "Buyer info (name and email) is required" });
    }

    // ✅ FIXED: Verify store exists and is active
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }
    if (!store.isActive) {
      return res.status(403).json({ error: "This store is currently unavailable" });
    }

    // ✅ FIXED: Verify all products exist, are from the correct store, and prices match
    const productIds = products.map(p => p.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    if (dbProducts.length !== products.length) {
      return res.status(400).json({ error: "One or more products not found" });
    }

    // Verify products belong to the store and validate prices
    for (const product of products) {
      const dbProduct = dbProducts.find(p => p._id.toString() === product.productId);
      
      if (!dbProduct) {
        return res.status(400).json({ error: `Product ${product.productId} not found` });
      }

      if (dbProduct.storeId.toString() !== storeId) {
        return res.status(400).json({ error: "All products must be from the same store" });
      }

      // Price validation with tolerance for floating point errors
      if (Math.abs(dbProduct.price - product.price) > 0.01) {
        return res.status(400).json({ 
          error: `Price mismatch for ${dbProduct.name}`,
          expected: dbProduct.price,
          received: product.price
        });
      }
    }

    // Create line items for Stripe
    const lineItems = products.map((p) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: p.name,
          description: p.description || "",
        },
        unit_amount: Math.round(p.price * 100), // Convert to cents
      },
      quantity: p.quantity || 1,
    }));

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout-cancel`,
      customer_email: buyerInfo.email,
      metadata: {
        storeId,
        storeName: store.name,
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
// IMPORTANT: This route must be registered BEFORE express.json() middleware in server.js
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("⚠️ Webhook signature verification failed:", err.message);
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

          // ✅ FIXED: Check for duplicate orders (idempotency)
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          const existingOrder = await Order.findOne({
            storeId,
            "buyerInfo.email": buyerEmail,
            total,
            paymentStatus: "paid",
            createdAt: { $gte: fiveMinutesAgo }
          });

          if (existingOrder) {
            console.log(`⚠️ Duplicate order prevented: ${existingOrder._id}`);
            return res.json({ received: true, duplicate: true });
          }

          // Calculate commission (10%)
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
            paymentStatus: "paid",
          });

          await order.save();
          console.log(`✅ Order created: ${order._id} for ${buyerEmail}`);
          
          // TODO: Send order confirmation email here
          
        } catch (err) {
          console.error("❌ Error creating order from webhook:", err);
          // Don't return error to Stripe - log it and investigate
        }
        break;
      }

      case "checkout.session.expired": {
        console.log("⏰ Checkout session expired");
        // Optionally notify user or log for analytics
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log(`❌ Payment failed: ${paymentIntent.id}`);
        // Optionally create a failed order record for tracking
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    // Always return 200 to acknowledge receipt
    res.json({ received: true });
  }
);

// Get session details (for success page)
router.get("/session/:sessionId", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    
    // Only return safe information
    res.json({
      id: session.id,
      payment_status: session.payment_status,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata
    });
  } catch (err) {
    console.error("Session retrieval error:", err);
    res.status(500).json({ error: "Failed to retrieve session" });
  }
});

// ✅ NEW: Get order by session ID (useful for success page)
router.get("/order-by-session/:sessionId", async (req, res) => {
  try {
    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    
    if (!session.metadata || !session.metadata.buyerEmail) {
      return res.status(404).json({ error: "Session metadata not found" });
    }

    // Find the order created from this session
    const order = await Order.findOne({
      "buyerInfo.email": session.metadata.buyerEmail,
      total: session.amount_total / 100,
      paymentStatus: "paid",
      createdAt: { $gte: new Date(session.created * 1000) } // After session creation
    })
    .populate("storeId", "name slug")
    .sort({ createdAt: -1 })
    .limit(1);

    if (!order) {
      return res.status(404).json({ 
        error: "Order not found",
        message: "Order may still be processing. Please check your email."
      });
    }

    res.json(order);
  } catch (err) {
    console.error("Order by session fetch error:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

export default router;