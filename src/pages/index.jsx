import React from "react";
import ProductCard from "../components/ProductCard";

export default function Home() {
  // Example products (replace later with API call from services/api.js)
  const products = [
  ];

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

      {/* Product Grid */}
      <main className="px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Featured Products
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
