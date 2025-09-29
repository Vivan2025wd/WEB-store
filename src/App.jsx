import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/index";
import Product from "./pages/product";
import About from "./pages/about";
import Login from "./pages/login";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/product" element={<Product />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
