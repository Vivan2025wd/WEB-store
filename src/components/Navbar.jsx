import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { getCurrentUser, logout } from "../services/auth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center relative">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold hover:text-gray-200">
        Win Rich Solutions
      </Link>

      {/* Desktop Menu */}
      <ul className="hidden md:flex gap-6 items-center">
        <li><Link to="/" className="hover:text-gray-200">Home</Link></li>
        <li><Link to="/about" className="hover:text-gray-200">About</Link></li>
        
        {!user ? (
          <>
            <li><Link to="/login" className="hover:text-gray-200">Login</Link></li>
            <li>
              <Link 
                to="/login" 
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
              >
                Get Started
              </Link>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/dashboard" className="hover:text-gray-200">Dashboard</Link></li>
            {!user.isAdmin && (
              <li><Link to="/create-store" className="hover:text-gray-200">Create Store</Link></li>
            )}
            {user.isAdmin && (
              <li><span className="bg-yellow-500 text-black px-3 py-1 rounded text-sm font-semibold">Admin</span></li>
            )}
            <li>
              <button 
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded-lg font-semibold hover:bg-red-600"
              >
                Logout
              </button>
            </li>
          </>
        )}
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
        <div className="absolute top-full left-0 w-full bg-blue-600 text-white shadow-md md:hidden z-50">
          <ul className="flex flex-col gap-4 px-6 py-4">
            <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
            <li><Link to="/about" onClick={() => setIsOpen(false)}>About</Link></li>
            
            {!user ? (
              <>
                <li><Link to="/login" onClick={() => setIsOpen(false)}>Login</Link></li>
                <li><Link to="/login" onClick={() => setIsOpen(false)}>Get Started</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link></li>
                {!user.isAdmin && (
                  <li><Link to="/create-store" onClick={() => setIsOpen(false)}>Create Store</Link></li>
                )}
                {user.isAdmin && (
                  <li><span className="text-yellow-400">Admin Account</span></li>
                )}
                <li>
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="text-left text-red-300 hover:text-red-100"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}