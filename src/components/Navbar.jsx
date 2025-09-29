import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow">
      <h1 className="text-2xl font-bold text-blue-600">MyStore</h1>
      <ul className="flex gap-6 text-gray-700 font-medium">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/product">Products</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/login" className="text-blue-600 hover:underline">Login</Link></li>
      </ul>
    </nav>
  );
}
