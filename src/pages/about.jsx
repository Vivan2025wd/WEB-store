import React from "react";
import Navbar from "../components/Navbar";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* About Content */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">About Us</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Welcome to <span className="font-semibold">Win Rich Solutions</span> — your one-stop shop for the best products at unbeatable prices. 
          <br /><br />
          We believe shopping should be fast, reliable, and fun. That’s why we provide:
        </p>
        <ul className="mt-6 text-left text-gray-700 space-y-2">
          <li>✅ High-quality products handpicked for you</li>
          <li>✅ Lightning-fast delivery worldwide</li>
          <li>✅ 24/7 customer support to assist anytime</li>
        </ul>
      </main>
    </div>
  );
}
