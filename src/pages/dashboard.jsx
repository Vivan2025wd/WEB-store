import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
  const [store, setStore] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await api.get("/store/me"); // backend route for logged-in seller
        setStore(res.data);
      } catch {
        setStore(null);
      }
    };
    fetchStore();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {store ? (
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-xl font-semibold">{store.name}</h2>
          <p className="text-gray-600">URL: /store/{store.slug}</p>
          <img
            src={store.logo || "/logo.png"}
            alt="Store Logo"
            className="h-20 mt-4"
          />
        </div>
      ) : (
        <div className="bg-white shadow p-6 rounded-lg">
          <p className="mb-4 text-gray-700">You don’t have a store yet.</p>
          <Link
            to="/create-store"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Your Store
          </Link>
        </div>
      )}
    </div>
  );
}
