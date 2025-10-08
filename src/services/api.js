const API_URL = "http://localhost:5000";

// Helper: always add token if exists
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = {
  get: async (url) => {
    try {
      const res = await fetch(API_URL + url, {
        headers: getAuthHeaders(),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ 
          message: `Request failed with status ${res.status}` 
        }));
        const error = new Error(err.message || err.error || "Request failed");
        error.response = { 
          status: res.status, 
          data: err 
        };
        throw error;
      }
      
      return { data: await res.json() };
    } catch (error) {
      // If it's a network error (e.g., backend not running)
      if (!error.response) {
        console.error(`Network error fetching ${url}:`, error);
        const networkError = new Error("Cannot connect to server. Is the backend running?");
        networkError.response = { 
          status: 0, 
          data: { message: "Cannot connect to server" } 
        };
        throw networkError;
      }
      throw error;
    }
  },

  post: async (url, body) => {
    try {
      const isForm = body instanceof FormData;
      const res = await fetch(API_URL + url, {
        method: "POST",
        headers: isForm ? getAuthHeaders() : { "Content-Type": "application/json", ...getAuthHeaders() },
        body: isForm ? body : JSON.stringify(body),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ 
          message: `Request failed with status ${res.status}` 
        }));
        const error = new Error(err.message || err.error || "Request failed");
        error.response = { 
          status: res.status, 
          data: err 
        };
        throw error;
      }
      
      return { data: await res.json() };
    } catch (error) {
      if (!error.response) {
        console.error(`Network error posting to ${url}:`, error);
        const networkError = new Error("Cannot connect to server. Is the backend running?");
        networkError.response = { 
          status: 0, 
          data: { message: "Cannot connect to server" } 
        };
        throw networkError;
      }
      throw error;
    }
  },

  put: async (url, body) => {
    try {
      const res = await fetch(API_URL + url, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ 
          message: `Request failed with status ${res.status}` 
        }));
        const error = new Error(err.message || err.error || "Request failed");
        error.response = { 
          status: res.status, 
          data: err 
        };
        throw error;
      }
      
      return { data: await res.json() };
    } catch (error) {
      if (!error.response) {
        console.error(`Network error putting to ${url}:`, error);
        const networkError = new Error("Cannot connect to server. Is the backend running?");
        networkError.response = { 
          status: 0, 
          data: { message: "Cannot connect to server" } 
        };
        throw networkError;
      }
      throw error;
    }
  },

  delete: async (url) => {
    try {
      const res = await fetch(API_URL + url, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ 
          message: `Request failed with status ${res.status}` 
        }));
        const error = new Error(err.message || err.error || "Request failed");
        error.response = { 
          status: res.status, 
          data: err 
        };
        throw error;
      }
      
      return { data: await res.json() };
    } catch (error) {
      if (!error.response) {
        console.error(`Network error deleting ${url}:`, error);
        const networkError = new Error("Cannot connect to server. Is the backend running?");
        networkError.response = { 
          status: 0, 
          data: { message: "Cannot connect to server" } 
        };
        throw networkError;
      }
      throw error;
    }
  },
};

export default api;