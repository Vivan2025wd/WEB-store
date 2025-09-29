import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center flex-1 text-center px-6">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to MyStore
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Find the best products at unbeatable prices.
        </p>
        <Link
          to="/product"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Shop Now
        </Link>
      </header>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 py-12 bg-white">
        <div className="p-6 bg-gray-100 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
          <p className="text-gray-600">Get your products delivered in no time.</p>
        </div>
        <div className="p-6 bg-gray-100 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">Best Quality</h3>
          <p className="text-gray-600">We offer only the best items for you.</p>
        </div>
        <div className="p-6 bg-gray-100 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
          <p className="text-gray-600">We’re here to help whenever you need us.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 text-center py-6">
        <p>© {new Date().getFullYear()} MyStore. All rights reserved.</p>
      </footer>
    </div>
  );
}
