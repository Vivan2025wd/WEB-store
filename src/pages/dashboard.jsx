import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

export default function Dashboard() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "", image: "" });
  const [editingProduct, setEditingProduct] = useState(null);

  // Admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.isAdmin) {
      setIsAdmin(true);
      api.get("/admin/stats")
        .then((res) => setAdminStats(res.data))
        .catch((err) => console.error("Failed to fetch admin stats", err));
    } else {
      // Seller flow
      const fetchStore = async () => {
        try {
          const res = await api.get("/store/me");
          setStore(res.data);

          const productsRes = await api.get(`/products/store/${res.data._id}`);
          setProducts(productsRes.data);
        } catch {
          setStore(null);
        }
      };
      fetchStore();
    }
  }, []);

  // Seller product logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!store) return;

    try {
      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct._id}/edit`, form);
        setProducts(products.map((p) => (p._id === editingProduct._id ? res.data : p)));
        setEditingProduct(null);
      } else {
        const res = await api.post("/products/add", { ...form, storeId: store._id });
        setProducts([...products, res.data]);
      }
      setForm({ name: "", price: "", description: "", image: "" });
    } catch (err) {
      console.error("Failed to save product", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}/delete`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  const startEditing = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {isAdmin ? (
        // ✅ Admin Dashboard
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Admin Overview</h2>
          {adminStats ? (
            <>
              <p>Total Revenue: <strong>${adminStats.totalRevenue.toFixed(2)}</strong></p>
              <p>Total Commission: <strong>${adminStats.totalCommission.toFixed(2)}</strong></p>

              <h3 className="mt-6 font-semibold">Seller Stats:</h3>
              <ul className="list-disc ml-6">
                {Object.entries(adminStats.sellerStats).map(([storeId, data]) => (
                  <li key={storeId}>
                    Store {storeId}: Revenue ${data.revenue}, Commission ${data.commission}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>Loading stats...</p>
          )}
        </div>
      ) : (
        // ✅ Seller Dashboard (your existing code)
        <>
          {store ? (
            <div className="space-y-8">
              {/* Store Info */}
              <div className="bg-white shadow p-6 rounded-lg">
                <h2 className="text-xl font-semibold">{store.name}</h2>
                <p className="text-gray-600">URL: /store/{store.slug}</p>
                <img src={store.logo || "/logo.png"} alt="Store Logo" className="h-20 mt-4" />
              </div>

              {/* Add/Edit Product Form */}
              <div className="bg-white shadow p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-4">
                  {editingProduct ? "Edit Product" : "Add a Product"}
                </h3>
                <form onSubmit={handleSubmit} className="grid gap-3 max-w-md">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="p-2 border rounded"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="p-2 border rounded"
                    required
                  />
                  <textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="p-2 border rounded"
                  />
                  <div className="flex gap-3">
                    <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                      {editingProduct ? "Update Product" : "Add Product"}
                    </button>
                    {editingProduct && (
                      <button
                        type="button"
                        className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
                        onClick={() => {
                          setEditingProduct(null);
                          setForm({ name: "", price: "", description: "", image: "" });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Product List */}
              <div>
                <h3 className="text-lg font-bold mb-4">Your Products</h3>
                {products.length === 0 ? (
                  <p className="text-gray-600">No products yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {products.map((p) => (
                      <div key={p._id} className="relative">
                        <ProductCard product={p} />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => startEditing(p)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white shadow p-6 rounded-lg">
              <p className="mb-4 text-gray-700">You don’t have a store yet.</p>
              <Link
                to="/create-store"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Your Store
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
