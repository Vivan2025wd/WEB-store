import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Home() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch all active stores
        const response = await api.get("/store/all");
        setStores(response.data || []);
      } catch (err) {
        console.error("Failed to fetch stores:", err);
        setError("Failed to load stores. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center text-center py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Win Rich Solutions 
        </h1>
        <p className="text-lg max-w-xl">
          Discover amazing products from trusted sellers at the best prices.
        </p>
      </header>

      {/* Stores Section */}
      <main className="px-8 py-12 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Featured Stores
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading stores...</p>
            </div>
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg mb-4">No stores available yet.</p>
            <p className="text-gray-500">Be the first to create a store!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store) => (
              <Link 
                key={store._id} 
                to={`/store/${store.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Store Logo/Header */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-6">
                  {store.logo ? (
                    <img 
                      src={store.logo} 
                      alt={store.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`${store.logo ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}
                  >
                    <span className="text-5xl font-bold text-white">
                      {store.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Store Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {store.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    @{store.slug}
                  </p>

                  {store.productCount !== undefined && (
                    <div className="flex items-center text-sm text-gray-500">
                      <svg 
                        className="w-4 h-4 mr-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                        />
                      </svg>
                      {store.productCount} {store.productCount === 1 ? 'Product' : 'Products'}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="text-blue-600 font-semibold text-sm hover:text-blue-700">
                      Visit Store →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}