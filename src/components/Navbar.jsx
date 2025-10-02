import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react"; // 👈 nice icons

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <h1 className="text-xl font-bold">Win Rich Solutions</h1>

      {/* Desktop Menu */}
      <ul className="hidden md:flex gap-6">
        <li><Link to="/" className="hover:text-gray-200">Home</Link></li>
        <li><Link to="/login" className="hover:text-gray-200">Login</Link></li>
        <li><Link to="/dashboard" className="hover:text-gray-200">Dashboard</Link></li>
        <li><Link to="/create-store" className="hover:text-gray-200">Create Store</Link></li>
        <li><Link to="/about" className="hover:text-gray-200">About</Link></li>
        <li><Link to="/admin-login" className="hover:text-gray-200">Admin Login</Link></li>
        <li><Link to="/store/storePage" className="hover:text-gray-200">Store</Link></li>
      </ul>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-blue-600 text-white shadow-md md:hidden">
          <ul className="flex flex-col gap-4 px-6 py-4">
            <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
            <li><Link to="/login" onClick={() => setIsOpen(false)}>Login</Link></li>
            <li><Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link></li>
            <li><Link to="/create-store" onClick={() => setIsOpen(false)}>Create Store</Link></li>
            <li><Link to="/about" onClick={() => setIsOpen(false)}>About</Link></li>
            <li><Link to="/admin-login" onClick={() => setIsOpen(false)}>Admin Login</Link></li>
          </ul>
        </div>
      )}
    </nav>
  );
}
