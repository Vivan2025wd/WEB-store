// src/pages/store/StorePage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import ProductCard from "../../components/ProductCard";

export default function StorePage() {
  const { storeId: slug } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (!slug) {
      setError("Store URL is missing");
      setLoading(false);
      return;
    }

    const fetchStore = async () => {
      setLoading(true);
      setError("");
      
      try {
        const res = await api.get(`/store/slug/${slug}`);
        
        // Handle different response formats
        const storeData = res.data?.store || res.data;
        const productsData = res.data?.products || storeData?.products || [];

        if (!storeData) {
          setError("Store not found");
          return;
        }

        setStore(storeData);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        console.error("Error fetching store:", err);
        if (err.response?.status === 404) {
          setError("Store not found. Please check the URL.");
        } else if (err.response?.status === 403) {
          setError("This store is currently unavailable.");
        } else {
          setError(err.response?.data?.error || err.response?.data?.message || "Failed to load store. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [slug]);

  // Get unique categories from products
  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];
  
  // Filter products by category
  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-2xl p-12 max-w-md text-center">
          <div className="text-6xl mb-6">😔</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Oops!</h2>
          <p className="text-gray-600 mb-8 text-lg">{error}</p>
          <Link 
            to="/" 
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-lg"
          >
            ← Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600 text-xl mb-4">Store not found</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold text-lg">
            ← Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Store Logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
              <img
                src={store.logo || "/logo.png"}
                alt={store.name}
                className="relative h-32 w-32 object-cover rounded-2xl shadow-2xl border-4 border-white/30"
                onError={(e) => { e.target.src = "/logo.png"; }}
              />
            </div>

            {/* Store Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">
                {store.name}
              </h1>
              <p className="text-xl text-white/90 mb-2">@{store.slug}</p>
              <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start text-sm">
                <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                  📦 {products.length} Products
                </span>
                <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                  👤 {store.ownerId?.name || store.owner?.name || "Seller"}
                </span>
                {store.theme && (
                  <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full capitalize">
                    🎨 {store.theme} Theme
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Category Filter (if categories exist) */}
        {categories.length > 1 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">FILTER BY CATEGORY</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat === "all" ? "All Products" : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
            <span>Products</span>
            <span className="text-lg font-normal text-gray-500">
              ({filteredProducts.length})
            </span>
          </h2>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-16 text-center">
              <div className="text-gray-300 text-8xl mb-6">📦</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">
                {products.length === 0 ? "No products available yet" : "No products in this category"}
              </h3>
              <p className="text-gray-500 text-lg">
                {products.length === 0 
                  ? "This store is just getting started. Check back soon!" 
                  : "Try selecting a different category"}
              </p>
              {selectedCategory !== "all" && products.length > 0 && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  View All Products
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div 
                  key={product._id} 
                  className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  <ProductCard product={product} />
                  <div className="p-4 border-t border-gray-100">
                    <button
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform group-hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      onClick={() => {
                        // TODO: Implement checkout integration
                        alert(`🛒 Adding "${product.name}" to cart\n\nPrice: $${parseFloat(product.price).toFixed(2)}\n\nCheckout integration coming soon!`);
                      }}
                    >
                      <span>🛒</span>
                      <span>Buy Now</span>
                      <span className="font-bold">${parseFloat(product.price).toFixed(2)}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back to Home Button */}
        <div className="mt-16 text-center pb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-lg transition"
          >
            <span>←</span>
            <span>Browse More Stores</span>
          </Link>
        </div>
      </div>
    </div>
  );
}