import { startCheckout } from "../services/payment";

export default function ProductCard({ product, storeId }) {
  return (
    <div className="border rounded-lg p-4 shadow">
      <img src={product.image} alt={product.name} className="h-40 w-full object-cover" />
      <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
      <p className="text-gray-600">${product.price}</p>
      <button
        onClick={() =>
          startCheckout(
            [{ name: product.name, price: product.price, quantity: 1 }],
            storeId,
            { name: "Guest Buyer", email: "test@example.com" } // replace with real buyer form
          )
        }
        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Buy Now
      </button>
    </div>
  );
}
