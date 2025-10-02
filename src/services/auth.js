// auth.js

// ✅ Base API URL (adjust depending on your backend location)
const API_URL = "http://localhost:5000/api/auth";

// ---------------------------
// Register new seller
// ---------------------------
export async function register(name, email, password) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Registration failed");
  }

  return res.json();
}

// ---------------------------
// Login
// ---------------------------
export async function login(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Login failed");
  }

  const data = await res.json();

  // ✅ Store separately
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

// ---------------------------
// Logout
// ---------------------------
export function logout() {
  localStorage.removeItem("token"); // ✅ Remove token also
  localStorage.removeItem("user");
}

// ---------------------------
// Get current user
// ---------------------------
export function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

// ---------------------------
// Get stored token (helper)
// ---------------------------
export function getToken() {
  return localStorage.getItem("token");
}
