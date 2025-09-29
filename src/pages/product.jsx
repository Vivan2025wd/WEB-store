import React from "react";
import Navbar from "../components/Navbar";

export default function Product() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Product Content */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-6">
        <h1 className="text-3xl font-bold text-blue-600">Our Products</h1>
        <p className="text-gray-600 mt-4">
          Browse our collection of amazing items!
        </p>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 text-center py-6">
        <p>© {new Date().getFullYear()} MyStore. All rights reserved.</p>
      </footer>
    </div>
  );
}
