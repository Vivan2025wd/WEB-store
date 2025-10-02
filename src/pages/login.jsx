import React, { useState, useEffect } from "react";
import { login, register, getCurrentUser } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // Validation
    if (!isLogin && name.trim().length < 2) {
      setMessage("❌ Name must be at least 2 characters");
      setLoading(false);
      return;
    }

    if (email.trim().length < 5 || !email.includes("@")) {
      setMessage("❌ Please enter a valid email");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("❌ Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const data = await login(email, password);
        setMessage("✅ Logged in successfully! Redirecting...");
        
        // Small delay to show success message
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        await register(name, email, password);
        setMessage("✅ Registered successfully! Please login.");
        setIsLogin(true);
        setPassword(""); // Clear password after registration
      }
    } catch (err) {
      console.error("Auth error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Authentication failed";
      setMessage("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? "Login to access your dashboard" : "Sign up to start selling"}
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-center ${
            message.startsWith("✅") 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            />
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              isLogin ? "Login" : "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
                setPassword("");
              }}
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
              disabled={loading}
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}