const API_URL = "http://localhost:5000"; // ✅ Fixed: Removed /api prefix

// Helper: always add token if exists
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = {
  get: async (url) => {
    const res = await fetch(API_URL + url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || err.message || "Request failed");
    }
    return await res.json();
  },

  post: async (url, body) => {
    const isForm = body instanceof FormData;
    const res = await fetch(API_URL + url, {
      method: "POST",
      headers: isForm ? getAuthHeaders() : { "Content-Type": "application/json", ...getAuthHeaders() },
      body: isForm ? body : JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || err.message || "Request failed");
    }
    return await res.json();
  },

  put: async (url, body) => {
    const res = await fetch(API_URL + url, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || err.message || "Request failed");
    }
    return await res.json();
  },

  delete: async (url) => {
    const res = await fetch(API_URL + url, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || err.message || "Request failed");
    }
    return await res.json();
  },
};

export default api;