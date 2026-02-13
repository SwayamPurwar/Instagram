import { NavLink, Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext.jsx";
import { useSocket } from "../context/SocketContext.jsx"; // Import hook
import config from "../config";

/* --- ICONS --- */
function Icon({ children }) {
  return <span className="navicon" aria-hidden>{children}</span>;
}

const HomeIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" /></svg>;
const SearchIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-3.6-3.6" /></svg>;
const CompassIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
const CreateIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>;
const NotifIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const ChatIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" /></svg>;
const ProfileIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21a8 8 0 1 0-16 0" /><circle cx="12" cy="7" r="4" /></svg>;
const LogoutIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);
const MoonIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
const SunIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>;


export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = config.API_URL;
  const { addToast } = useToast();
  const socket = useSocket(); // Use Global Socket
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  // --- 1. Socket Listener for Notifications ---
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data) => {
      addToast(`🔔 ${data.message}`, "info");
      // Increment unread count if we are NOT on the notifications page
      if (location.pathname !== "/notifications") {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, addToast, location.pathname]);

  // --- 2. Fetch Initial Unread Count ---
  useEffect(() => {
    axios.get(`${API_URL}/notifications`, { withCredentials: true })
      .then((res) => {
        const count = res.data.notifications.filter(n => !n.read).length;
        setUnreadCount(count);
      })
      .catch((err) => console.error("Failed to fetch notifications", err));
  }, [API_URL]);

  // --- 3. Reset Count on View ---
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
        window.location.reload(); // Clear memory/socket state
      })
      .catch((err) => console.error("Logout failed", err));
  }

  const links = [
    { to: "/home", label: "Home", icon: <HomeIcon /> },
    { to: "/user-search", label: "Search", icon: <SearchIcon /> },
    { to: "/explore", label: "Explore", icon: <CompassIcon /> },
    { to: "/create-post", label: "Create", icon: <CreateIcon /> },
    { 
      to: "/notifications", 
      label: "Notifications", 
      icon: unreadCount > 0 ? (
        <div style={{ position: 'relative' }}>
          <NotifIcon />
          <span className="notif-badge" />
        </div>
      ) : <NotifIcon /> 
    },
    { to: "/chat", label: "Messages", icon: <ChatIcon /> },
    { to: "/profile", label: "Profile", icon: <ProfileIcon /> },
  ];

  return (
    <div className="layout">
      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
           <div className="logo-icon"><InstagramIcon /></div>
           <div className="logo-text">Instagram</div>
        </div>

        <nav className="navlist">
          {links.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `navlink${isActive ? " active" : ""}`}>
              <div style={{ position: 'relative', display: 'flex' }}>{icon}</div>
              <span className="navtext">{label}</span>
            </NavLink>
          ))}
          
          <div style={{ flex: 1 }} />

          <button onClick={toggleTheme} className="navlink" title="Toggle Theme">
            <Icon>{theme === "light" ? <MoonIcon /> : <SunIcon />}</Icon>
            <span className="navtext">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          </button>

          <button onClick={handleLogout} className="navlink" title="Log Out">
            <Icon><LogoutIcon /></Icon>
            <span className="navtext">Logout</span>
          </button>
        </nav>
      </aside>

      {/* CONTENT WRAPPER */}
      <main className="content">
        
        {/* MOBILE TOP BAR */}
        <div className="mobile-top-bar">
          <div className="logo-text" style={{ 
            opacity: 1, 
            transform: 'none', 
            margin: 0, 
            fontSize: '1.7rem', 
            padding: 0 
          }}>
            Instagram
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link to="/notifications" style={{ color: 'var(--text)', position: 'relative', display: 'flex' }}>
              {unreadCount > 0 ? <><NotifIcon /><span className="notif-badge" style={{top: 0, right: -2}}/></> : <NotifIcon />}
            </Link>
            <Link to="/chat" style={{ color: 'var(--text)', display: 'flex' }}><ChatIcon /></Link>
          </div>
        </div>

        <Outlet />
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="bottomnav">
        {links.slice(0, 5).map(({ to, icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `navlink${isActive ? " active" : ""}`} style={{ justifyContent: 'center' }}>
             {icon}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}