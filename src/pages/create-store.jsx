import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { slugify } from "../services/utils";
import api from "../services/api";
import { getCurrentUser } from "../services/auth";

export default function CreateStore() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState(null);
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setSlug(slugify(value));
    setError("");
  };

  const handleSlugChange = (e) => {
    const value = e.target.value;
    // Only allow lowercase letters, numbers, and hyphens
    const cleanSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(cleanSlug);
    setError("");
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setLogo(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (name.trim().length < 3) {
      setError("Store name must be at least 3 characters");
      return;
    }

    if (slug.trim().length < 3) {
      setError("Store URL must be at least 3 characters");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Store URL can only contain lowercase letters, numbers, and hyphens");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("slug", slug.trim());
    if (logo) {
      formData.append("logo", logo);
    }
    formData.append("theme", theme);

    try {
      await api.post("/store/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Success - redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Create store error:", err);
      const errorMsg = err.response?.data?.message || "Failed to create store";
      
      if (err.response?.status === 409) {
        setError("This store URL is already taken. Please choose another.");
      } else if (err.response?.status === 400) {
        setError(errorMsg);
      } else {
        setError("Failed to create store. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg"
      >
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
          Create Your Store
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Set up your online storefront in minutes
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Store Name */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Store Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="My Awesome Store"
            disabled={loading}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This is how customers will see your store
          </p>
        </div>

        {/* Slug */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Store URL *
          </label>
          <input
            type="text"
            value={slug}
            onChange={handleSlugChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="my-awesome-store"
            disabled={loading}
            required
          />
          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600">Your store will be available at:</p>
            <p className="font-mono text-sm text-blue-600 font-semibold break-all">
              yourplatform.com/store/{slug || "your-store-url"}
            </p>
          </div>
        </div>

        {/* Logo */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Store Logo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="w-full p-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Recommended: Square image, max 5MB
          </p>
          
          {previewUrl && (
            <div className="mt-3 flex items-center gap-3">
              <img 
                src={previewUrl} 
                alt="Logo preview" 
                className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => {
                  setLogo(null);
                  setPreviewUrl(null);
                }}
                className="text-sm text-red-600 hover:text-red-700"
                disabled={loading}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Theme */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Store Theme
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              disabled={loading}
              className={`p-4 border-2 rounded-lg transition ${
                theme === "light"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="bg-white rounded p-2 mb-2 border">
                <div className="h-2 bg-gray-300 rounded mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-2/3"></div>
              </div>
              <p className="text-sm font-medium">Light</p>
            </button>
            
            <button
              type="button"
              onClick={() => setTheme("dark")}
              disabled={loading}
              className={`p-4 border-2 rounded-lg transition ${
                theme === "dark"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="bg-gray-800 rounded p-2 mb-2 border border-gray-700">
                <div className="h-2 bg-gray-600 rounded mb-1"></div>
                <div className="h-2 bg-gray-700 rounded w-2/3"></div>
              </div>
              <p className="text-sm font-medium">Dark</p>
            </button>
          </div>
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
              Creating Store...
            </span>
          ) : (
            "Create Store"
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have a store?{" "}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 hover:underline"
            disabled={loading}
          >
            Go to Dashboard
          </button>
        </p>
      </form>
    </div>
  );
}