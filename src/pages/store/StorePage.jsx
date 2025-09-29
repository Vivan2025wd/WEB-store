// src/pages/store/StorePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import ProductCard from "../../components/ProductCard";

export default function StorePage() {
  const { storeId: slug } = useParams(); // route defined as /store/:storeId in App.jsx (we're using the same param name)
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    const fetchStore = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/store/slug/${slug}`); // backend endpoint
        // api.get may return { data: {...}} or directly the json. support both.
        const payload = res?.data ?? res;
        const payloadStore = payload?.store ?? payload;
        const payloadProducts = payload?.products ?? payloadStore?.products ?? [];

        setStore(payloadStore);
        setProducts(payloadProducts);
      } catch (err) {
        console.error(err);
        setError("Store not found or something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [slug]);

  if (loading) return <div className="p-8">Loading store…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!store) return <div className="p-8">No store found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Store header */}
      <div className="bg-white p-6 rounded-lg shadow flex items-center gap-6 mb-8">
        <img
          src={store.logo || "/logo.png"}
          alt={store.name}
          className="h-20 w-20 object-cover rounded"
        />
        <div>
          <h1 className="text-2xl font-bold">{store.name}</h1>
          <p className="text-gray-600">@{store.slug}</p>
          <p className="text-sm text-gray-500 mt-1">Owned by: {store.ownerId?.name ?? "Seller"}</p>
        </div>
      </div>

      {/* Products grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Products</h2>

        {products.length === 0 ? (
          <p className="text-gray-600">No products yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p._id} className="flex flex-col">
                <ProductCard product={p} />
                <div className="mt-3">
                  <button
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    onClick={() => {
                      // placeholder: implement checkout integration later
                      alert(`Buy Now: ${p.name} — checkout integration coming soon`);
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
