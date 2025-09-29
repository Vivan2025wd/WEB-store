const API_URL = "http://localhost:5000"; // backend base URL

const api = {
  get: async (url) => {
    const res = await fetch(API_URL + url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Request failed");
    return await res.json();
  },

  post: async (url, body) => {
    const res = await fetch(API_URL + url, {
      method: "POST",
      headers:
        body instanceof FormData
          ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
          : {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Request failed");
    return await res.json();
  },
};

export default api;
