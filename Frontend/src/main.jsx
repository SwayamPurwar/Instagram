import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx"; // Global Socket
import ErrorBoundary from "./components/ErrorBoundary.jsx"; // Global Error Handling
import "./theme.css";
import "./styles.css";
import "./App.css";
import axios from "axios";

const root = createRoot(document.getElementById("root"));

// Global Axios Interceptor
// Automatically logs the user out if the backend returns a 401 Unauthorized
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("user");
      // Prevent redirect loop if already on auth pages
      if (!["/login", "/register"].includes(window.location.pathname)) {
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
    <ErrorBoundary>
      <ToastProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </ToastProvider>
    </ErrorBoundary>
  </BrowserRouter>
);