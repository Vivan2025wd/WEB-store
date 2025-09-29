import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/index";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import CreateStore from "./pages/create-store";
import StorePage from "./pages/store/storeId";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-store" element={<CreateStore />} />
            <Route path="/store/storeId" element={<StorePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
