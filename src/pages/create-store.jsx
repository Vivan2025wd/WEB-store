import React, { useState } from "react";
import { slugify } from "../services/utils";

export default function CreateStore() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState(null);
  const [theme, setTheme] = useState("light");

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setSlug(slugify(value)); // auto-generate slug
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ name, slug, logo, theme });
    // 🔜 send to backend (POST /store/create)
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Create Your Store</h2>

        {/* Store Name */}
        <label className="block mb-2 text-gray-700">Store Name</label>
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          className="w-full p-2 border rounded mb-4"
          placeholder="Enter store name"
          required
        />

        {/* Slug (readonly, auto-generated) */}
        <label className="block mb-2 text-gray-700">Store URL</label>
        <input
          type="text"
          value={slug}
          readOnly
          className="w-full p-2 border rounded mb-4 bg-gray-100 text-gray-600"
        />
        <p className="text-sm text-gray-500 mb-4">
          Your store will be available at: <br />
          <span className="font-mono text-blue-600">
            yourplatform.com/store/{slug || "your-slug"}
          </span>
        </p>

        {/* Logo Upload */}
        <label className="block mb-2 text-gray-700">Logo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogo(e.target.files[0])}
          className="mb-4"
        />

        {/* Theme */}
        <label className="block mb-2 text-gray-700">Theme</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Create Store
        </button>
      </form>
    </div>
  );
}
