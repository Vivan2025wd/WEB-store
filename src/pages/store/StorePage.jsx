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
        } else {
          setError(err.response?.data?.message || "Failed to load store. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Oops!</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link 
            to="/" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Store not found</p>
          <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Store Header */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-center gap-6 mb-8">
          <img
            src={store.logo || "/logo.png"}
            alt={store.name}
            className="h-24 w-24 object-cover rounded-lg shadow"
            onError={(e) => { e.target.src = "/logo.png"; }}
          />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800">{store.name}</h1>
            <p className="text-gray-600 text-lg">@{store.slug}</p>
            <p className="text-sm text-gray-500 mt-2">
              Owned by: {store.ownerId?.name || store.owner?.name || "Seller"}
            </p>
          </div>
        </div>

        {/* Products Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Products ({products.length})
          </h2>

          {products.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <p className="text-gray-600 text-lg mb-2">No products available yet</p>
              <p className="text-gray-500 text-sm">Check back soon for updates!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                  <ProductCard product={product} />
                  <div className="p-4 border-t">
                    <button
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                      onClick={() => {
                        // TODO: Implement checkout integration
                        alert(`🛒 Adding "${product.name}" to cart\n\nCheckout integration coming soon!`);
                      }}
                    >
                      Buy Now - ${parseFloat(product.price).toFixed(2)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link 
            to="/" 
            className="inline-block text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}