import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  
  // If no user is found in local storage, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the child routes (The App Layout)
  return <Outlet />;
}