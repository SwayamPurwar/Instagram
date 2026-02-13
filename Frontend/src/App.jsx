import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx"; 
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Explore from "./pages/Explore.jsx"; 
import Chat from "./pages/Chat.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import Profile from "./pages/Profile.jsx";
import UserSearch from "./pages/UserSearch.jsx";
import EditProfile from "./pages/EditProfile.jsx"; 
import Notifications from "./pages/Notifications.jsx"; 
import PostDetails from "./pages/PostDetails.jsx";

export default function App() {
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    // 1. Apply Theme
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    // 2. Simulate Loading / Session Check
    setTimeout(() => setAppLoading(false), 1000);
  }, []);

  // --- SPLASH SCREEN ---
  if (appLoading) {
    return (
      <div className="splash-screen">
        <div className="splash-icon">
          <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="url(#splashGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="splashGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor:"#f09433", stopOpacity:1}} />
                <stop offset="50%" style={{stopColor:"#dc2743", stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:"#bc1888", stopOpacity:1}} />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        </div>
        <div className="splash-logo">Instagram</div>
      </div>
    );
  }

  return (
    <div className="app">
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/explore" element={<Explore />} /> 
            <Route path="/user-search" element={<UserSearch />} />
            <Route path="/notifications" element={<Notifications />} /> 
            
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:receiverId" element={<Chat />} />
            
            <Route path="/create-post" element={<CreatePost />} />
            
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            
            <Route path="/post/:id" element={<PostDetails />} /> 
          </Route>
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}