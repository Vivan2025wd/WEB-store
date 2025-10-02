// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Admin check should be server-verified, but this is client-side fallback
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}