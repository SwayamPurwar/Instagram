import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import config from "../config";

export default function RightSidebar() {
  const [suggestions, setSuggestions] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const API_URL = config.API_URL;

  useEffect(() => {
    axios.get(`${API_URL}/users/suggested`, { withCredentials: true })
      .then((res) => setSuggestions(res.data.users))
      .catch((err) => console.error(err));
  }, []);

  if (!currentUser.username) return null;

  return (
    <div className="right-sidebar">
      {/* My Mini Profile */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
          <img 
            src={currentUser.image || "https://via.placeholder.com/56"} 
            alt="me" 
            style={{ 
              width: 56, height: 56, 
              borderRadius: "50%", 
              objectFit: "cover", 
              border: "2px solid var(--glass-border)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
            }} 
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>{currentUser.username}</span>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{currentUser.email}</span>
          </div>
        </Link>
        <Link to="/login" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>Switch</Link>
      </div>

      {/* Suggestions Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <span style={{ color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.9rem" }}>Suggestions for you</span>
        <Link to="/user-search" style={{ fontSize: "0.8rem", color: "var(--text)", fontWeight: "600", textDecoration: "none" }}>See All</Link>
      </div>

      {/* Suggestions List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {suggestions.slice(0, 5).map((user) => (
          <div key={user._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link to={`/profile/${user._id}`} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
              <img 
                src={user.image || "https://via.placeholder.com/32"} 
                alt={user.username} 
                style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} 
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>{user.username}</span>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>Suggested for you</span>
              </div>
            </Link>
            <Link to={`/profile/${user._id}`} style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>Follow</Link>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "32px", fontSize: "0.75rem", color: "var(--text-secondary)", opacity: 0.6, lineHeight: "1.6" }}>
        © 2024 INSTAGRAM CLONE BY SWAYAM<br/>
        Built with React & Glassmorphism
      </div>
    </div>
  );
}