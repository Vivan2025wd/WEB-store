import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import { getCurrentUser } from "../services/auth";

export default function Dashboard() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "", image: "" });
  const [editingProduct, setEditingProduct] = useState(null);

  // Admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState(null);

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Check current user
        const user = getCurrentUser();
        
        if (!user) {
          setError("Please log in to view dashboard");
          setLoading(false);
          return;
        }

        // Verify with backend and check admin status
        const authRes = await api.get("/auth/me");
        
        if (authRes.data.isAdmin) {
          setIsAdmin(true);
          const statsRes = await api.get("/admin/stats");
          setAdminStats(statsRes.data);
        } else {
          // Seller flow
          try {
            const storeRes = await api.get("/store/me");
            setStore(storeRes.data);

            if (storeRes.data?._id) {
              const productsRes = await api.get(`/products/store/${storeRes.data._id}`);
              setProducts(productsRes.data);
            }
          } catch (storeErr) {
            // No store yet - this is okay
            if (storeErr.response?.status !== 404) {
              console.error("Error fetching store:", storeErr);
            }
            setStore(null);
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Seller product logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!store) return;

    setError("");
    setSuccessMessage("");

    // Validation
    if (!form.name.trim()) {
      setError("Product name is required");
      return;
    }

    if (!form.price || parseFloat(form.price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    try {
      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct._id}/edit`, form);
        setProducts(products.map((p) => (p._id === editingProduct._id ? res.data : p)));
        setSuccessMessage("Product updated successfully!");
        setEditingProduct(null);
      } else {
        const res = await api.post("/products/add", { ...form, storeId: store._id });
        setProducts([...products, res.data]);
        setSuccessMessage("Product added successfully!");
      }
      setForm({ name: "", price: "", description: "", image: "" });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save product", err);
      setError(err.response?.data?.message || "Failed to save product");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setError("");
    try {
      await api.delete(`/products/${id}/delete`);
      setProducts(products.filter((p) => p._id !== id));
      setSuccessMessage("Product deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to delete product", err);
      setError(err.response?.data?.message || "Failed to delete product");
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
    setError("");
    setSuccessMessage("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        {isAdmin ? (
          // ✅ Admin Dashboard
          <div className="bg-white shadow p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Admin Overview</h2>
            {adminStats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${adminStats.totalRevenue?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Commission</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${adminStats.totalCommission?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>

                <h3 className="mt-6 font-semibold text-lg mb-3">Seller Stats:</h3>
                {Object.keys(adminStats.sellerStats || {}).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 border">Store ID</th>
                          <th className="p-3 border">Revenue</th>
                          <th className="p-3 border">Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(adminStats.sellerStats).map(([storeId, data]) => (
                          <tr key={storeId} className="hover:bg-gray-50">
                            <td className="p-3 border">{storeId}</td>
                            <td className="p-3 border">${data.revenue?.toFixed(2) || "0.00"}</td>
                            <td className="p-3 border">${data.commission?.toFixed(2) || "0.00"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600">No seller data available yet.</p>
                )}
              </>
            ) : (
              <p className="text-gray-600">Loading stats...</p>
            )}
          </div>
        ) : (
          // ✅ Seller Dashboard
          <>
            {store ? (
              <div className="space-y-8">
                {/* Store Info */}
                <div className="bg-white shadow p-6 rounded-lg">
                  <div className="flex items-center gap-4">
                    <img 
                      src={store.logo || "/logo.png"} 
                      alt="Store Logo" 
                      className="h-20 w-20 object-cover rounded"
                      onError={(e) => { e.target.src = "/logo.png"; }}
                    />
                    <div>
                      <h2 className="text-2xl font-semibold">{store.name}</h2>
                      <p className="text-gray-600">Store URL: <a href={`/store/${store.slug}`} className="text-blue-600 hover:underline">/store/{store.slug}</a></p>
                      <p className="text-sm text-gray-500 mt-1">Theme: {store.theme || "light"}</p>
                    </div>
                  </div>
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
                      className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <textarea
                      placeholder="Description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                    <input
                      type="url"
                      placeholder="Image URL"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-3">
                      <button 
                        type="submit"
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                      >
                        {editingProduct ? "Update Product" : "Add Product"}
                      </button>
                      {editingProduct && (
                        <button
                          type="button"
                          className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500 transition"
                          onClick={() => {
                            setEditingProduct(null);
                            setForm({ name: "", price: "", description: "", image: "" });
                            setError("");
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
                    <div className="bg-white shadow p-6 rounded-lg text-center">
                      <p className="text-gray-600">No products yet. Add your first product above!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((p) => (
                        <div key={p._id} className="bg-white rounded-lg shadow overflow-hidden">
                          <ProductCard product={p} />
                          <div className="flex gap-2 p-3 border-t">
                            <button
                              onClick={() => startEditing(p)}
                              className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition"
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
              <div className="bg-white shadow p-8 rounded-lg text-center">
                <h2 className="text-xl font-semibold mb-4">Welcome to Your Dashboard!</h2>
                <p className="mb-6 text-gray-700">You don't have a store yet. Create one to start selling!</p>
                <Link
                  to="/create-store"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Create Your Store
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}