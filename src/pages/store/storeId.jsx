import { useParams } from "react-router-dom";

export default function StorePage() {
  const { storeId } = useParams();

  return (
    <div className="flex flex-col items-center py-20">
      <h1 className="text-2xl font-bold">Welcome to {storeId}’s Store</h1>
      <p className="text-gray-600 mt-2">Products will be listed here.</p>
    </div>
  );
}
