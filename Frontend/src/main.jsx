import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ToastProvider } from "./context/ToastContext.jsx"; // Ensure this import
import "./theme.css";
import "./styles.css";
import "./App.css";
import axios from "axios";
const root = createRoot(document.getElementById("root"));
// Add this before your root.render call
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // FIX: Clear local storage and redirect if token is invalid
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
root.render(
  <BrowserRouter
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }}
>
    <ToastProvider> {/* <--- Notifications will NOT work without this wrapper */}
      <App />
    </ToastProvider>
  </BrowserRouter>
);