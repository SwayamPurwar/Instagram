import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useToast } from "../context/ToastContext.jsx";
import config from "../config";
function Icon({ children }) {
  return <span className="navicon" aria-hidden>{children}</span>;
}

// Icon Definitions
const HomeIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" /></svg>;
const SearchIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-3.6-3.6" /></svg>;
// 1. NEW ICONS (Compass, Sun, Moon)
const CompassIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
const SunIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>;
const MoonIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;

const CreateIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>;
const NotifIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const ChatIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" /></svg>;
const ProfileIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21a8 8 0 1 0-16 0" /><circle cx="12" cy="7" r="4" /></svg>;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = config.API_URL;
  const { addToast } = useToast();
  
  const [unreadCount, setUnreadCount] = useState(0);
  // 2. THEME STATE
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // 3. APPLY THEME
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 4. TOGGLE FUNCTION
  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  useEffect(() => {
    const socket = io(API_URL, { withCredentials: true });

    socket.on("notification", (data) => {
      addToast(`🔔 ${data.message}`, "info");
      if (location.pathname !== "/notifications") {
        setUnreadCount((prev) => prev + 1);
      }
    });

    axios.get(`${API_URL}/notifications`, { withCredentials: true })
      .then((res) => {
        const unread = res.data.notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      })
      .catch(console.error);

    return () => socket.disconnect();
  }, [addToast]);

  useEffect(() => {
    if (location.pathname === "/notifications") {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  function handleLogout() {
    axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true })
      .then(() => {
        localStorage.removeItem("user");
        navigate("/login");
        window.location.reload();
      })
      .catch((err) => console.error("Logout failed", err));
  }

  const links = [
    { to: "/home", label: "Home", icon: <HomeIcon /> },
    { to: "/user-search", label: "Search", icon: <SearchIcon /> },
    { to: "/explore", label: "Explore", icon: <CompassIcon /> }, // <--- 5. EXPLORE LINK ADDED
    { to: "/create-post", label: "Create", icon: <CreateIcon /> },
    { 
      to: "/notifications", 
      label: "Notifications", 
      icon: (
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <NotifIcon />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -1,
              width: 10, height: 10,
              backgroundColor: '#ff3b30',
              borderRadius: '50%',
              border: '2px solid var(--card)'
            }} />
          )}
        </div>
      )
    },
    { to: "/chat", label: "Chat", icon: <ChatIcon /> },
    { to: "/profile", label: "Profile", icon: <ProfileIcon /> },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand instagram-logo" style={{ paddingLeft: "12px", fontSize: "28px" }}>Instagram</div>
        <nav className="navlist">
          {links.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `navlink${isActive ? " active" : ""}`}>
              <Icon>{icon}</Icon>
              <span className="navtext">{label}</span>
            </NavLink>
          ))}
          
          {/* 6. DARK MODE TOGGLE BUTTON */}
          <button onClick={toggleTheme} className="navlink" style={{ background: "transparent", border: "none", cursor: "pointer", width: "100%", justifyContent: "flex-start", color: "inherit", font: "inherit" }}>
            <Icon>{theme === "light" ? <MoonIcon /> : <SunIcon />}</Icon>
            <span className="navtext">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          </button>

          <button onClick={handleLogout} className="navlink" style={{ background: "transparent", border: "none", cursor: "pointer", width: "100%", justifyContent: "flex-start", color: "inherit", font: "inherit" }}>
            <Icon><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg></Icon>
            <span className="navtext">Logout</span>
          </button>
        </nav>
      </aside>

      <main className="content">
        <Outlet />
      </main>

      <nav className="bottomnav">
        {links.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `navlink${isActive ? " active" : ""}`} aria-label={label}>
            <Icon>{icon}</Icon>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}