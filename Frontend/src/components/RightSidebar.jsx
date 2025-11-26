import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function RightSidebar() {
  const [suggestions, setSuggestions] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const API_URL = "http://localhost:3000";

  useEffect(() => {
    axios.get(`${API_URL}/users/suggested`, { withCredentials: true })
      .then((res) => setSuggestions(res.data.users))
      .catch((err) => console.error(err));
  }, []);

  if (!currentUser.username) return null;

  return (
    <div style={{ width: "320px", paddingLeft: "30px", display: "none" }} className="desktop-sidebar">
      
      {/* My Mini Profile */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
          <img 
            src={currentUser.image || "https://via.placeholder.com/56"} 
            alt="me" 
            style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)" }} 
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>{currentUser.username}</span>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{currentUser.email}</span>
          </div>
        </Link>
        <Link to="/login" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>Switch</Link>
      </div>

      {/* Suggestions Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
        <span style={{ color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.9rem" }}>Suggestions for you</span>
        <Link to="/user-search" style={{ fontSize: "0.8rem", color: "var(--text)", fontWeight: "600", textDecoration: "none" }}>See All</Link>
      </div>

      {/* Suggestions List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {suggestions.map((user) => (
          <div key={user._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link to={`/profile/${user._id}`} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "inherit" }}>
              <img 
                src={user.image || "https://via.placeholder.com/32"} 
                alt={user.username} 
                style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} 
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: "600", fontSize: "0.85rem" }}>{user.username}</span>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>Suggested for you</span>
              </div>
            </Link>
            <Link to={`/profile/${user._id}`} style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>Follow</Link>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "30px", fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
        © 2024 INSTAGRAM CLONE FROM SWAYAM
      </div>
    </div>
  );
}