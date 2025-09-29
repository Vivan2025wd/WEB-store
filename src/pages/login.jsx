import React from "react";
import Navbar from "../components/Navbar";

export default function SellerLogin() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Login Form */}
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
            Seller Login
          </h2>

          <form className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>

          {/* Extra Links */}
          <p className="text-sm text-gray-500 mt-6 text-center">
            Don’t have an account?{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Register here
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 text-center py-6">
        <p>© {new Date().getFullYear()} MyStore. All rights reserved.</p>
      </footer>
    </div>
  );
}
