import api from "./api";

export async function startCheckout(products, storeId, buyerInfo) {
  try {
    const res = await api.post("/payment/create-checkout-session", {
      products,
      storeId,
      buyerInfo,
    });
    window.location.href = res.data.url; // redirect to Stripe checkout
  } catch (err) {
    console.error("Payment error:", err);
    alert("Payment could not be processed.");
  }
}
