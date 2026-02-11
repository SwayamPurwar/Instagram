import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/Layout.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Explore from "./pages/Explore.jsx"; 
import Chat from "./pages/Chat.jsx";
import Conversation from "./pages/Conversation.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import Profile from "./pages/Profile.jsx";
import UserSearch from "./pages/UserSearch.jsx";
import EditProfile from "./pages/EditProfile.jsx"; 
import Notifications from "./pages/Notifications.jsx"; 
import PostDetails from "./pages/PostDetails.jsx";

export default function App() {
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    // 1. Apply Theme Immediately (Prevents flash of wrong theme)
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
// 2. Verify Session
  const checkSession = async () => {
    try {
      // You need to create this simple endpoint in backend that returns 200 if token is valid
      // await axios.get(`${config.API_URL}/auth/verify`, { withCredentials: true });
      
      // For now, at least check if we have the user in localStorage
      const user = localStorage.getItem("user");
      if (!user) {
         // If no user, stop loading immediately
         setAppLoading(false);
      } else {
         // Optional: Give a small buffer for smooth animation
         setTimeout(() => setAppLoading(false), 1500);
      }
    } catch (err) {
      localStorage.removeItem("user");
      setAppLoading(false);
    }
  };

  checkSession();
}, []);

  // --- RENDER SPLASH SCREEN ---
  if (appLoading) {
    return (
      <div className="splash-screen">
        <div className="splash-icon">
          {/* Instagram Gradient Icon */}
          <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="url(#splashGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="splashGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor:"#f09433", stopOpacity:1}} />
                <stop offset="25%" style={{stopColor:"#e6683c", stopOpacity:1}} />
                <stop offset="50%" style={{stopColor:"#dc2743", stopOpacity:1}} />
                <stop offset="75%" style={{stopColor:"#cc2366", stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:"#bc1888", stopOpacity:1}} />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        </div>
        
        <div className="splash-logo">Instagram</div>
        
        <div className="splash-footer">
          <span className="from-text">from</span>
          <div className="meta-brand">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="url(#metaGrad)">
               <linearGradient id="metaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0071e3"/>
                  <stop offset="100%" stopColor="#00c6ff"/>
               </linearGradient>
               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            Swayam
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/explore" element={<Explore />} /> 
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/notifications" element={<Notifications />} /> 
            <Route path="/chat/:receiverId?" element={<Chat />} />
            <Route path="/conversation" element={<Conversation />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/profile/:id?" element={<Profile />} />
            <Route path="/user-search" element={<UserSearch />} />
            <Route path="/post/:id" element={<PostDetails />} /> 
          </Route>
          
          <Route
            path="*"
            element={<h2 style={{ padding: 16, textAlign:'center' }}>404 - Not Found</h2>}
          />
        </Routes>
      </div>
    </div>
  );
}