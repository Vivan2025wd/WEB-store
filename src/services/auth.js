// ✅ Base API URLs
const API_URL = "http://localhost:5000/auth";
const STORE_URL = "http://localhost:5000/store";

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
    // Handle both validation errors array and message string
    const errorMessage = err.message || 
                        (err.errors && err.errors[0]?.msg) || 
                        "Registration failed";
    throw new Error(errorMessage);
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
    // Handle both validation errors array and message string
    const errorMessage = err.message || 
                        (err.errors && err.errors[0]?.msg) || 
                        "Login failed";
    throw new Error(errorMessage);
  }

  const data = await res.json();

  // ✅ Store token and user data separately
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

// ---------------------------
// Logout
// ---------------------------
export function logout() {
  localStorage.removeItem("token");
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

// ---------------------------
// Create Store
// ---------------------------
export async function createStore(formData) {
  const token = getToken();
  
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  const res = await fetch(`${STORE_URL}/create`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      // ⚠️ Don't set Content-Type header - browser will set it automatically with boundary for multipart/form-data
    },
    body: formData, // FormData object with name, slug, logo, theme
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    
    // Handle different error types
    if (res.status === 409) {
      throw new Error("Store URL already taken. Please choose another.");
    } else if (res.status === 400) {
      const errorMessage = err.message || 
                          (err.errors && err.errors[0]?.msg) || 
                          "Invalid store data";
      throw new Error(errorMessage);
    } else if (res.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else {
      throw new Error(err.message || err.error || "Failed to create store");
    }
  }

  return res.json();
}