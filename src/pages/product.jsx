import React from "react";
import Navbar from "../components/Navbar";

export default function Product() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      {/* Product Content */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-6">
        <h1 className="text-3xl font-bold text-blue-600">Our Products</h1>
        <p className="text-gray-600 mt-4">
          Browse our collection of amazing items!
        </p>
      </main>
    </div>
  );
}
