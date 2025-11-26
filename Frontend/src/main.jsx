import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ToastProvider } from "./context/ToastContext.jsx"; // Ensure this import
import "./theme.css";
import "./styles.css";
import "./App.css";

const root = createRoot(document.getElementById("root"));
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