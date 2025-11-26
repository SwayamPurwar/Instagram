import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

const linkStyle = ({ isActive }) => ({
  padding: "8px 12px",
  borderRadius: 6,
  textDecoration: "none",
  color: isActive ? "var(--button-text)" : "var(--text)",
  background: isActive ? "var(--button-bg)" : "transparent",
});

export default function NavBar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("user");

  //WYSIWYG: Define API_URL
  const API_URL = "http://localhost:3000";

  function handleLogout() {
    // Use API_URL
    axios
      .post(`${API_URL}/auth/logout`, {}, { withCredentials: true })
      .then(() => {
        localStorage.removeItem("user");
        navigate("/login");
        window.location.reload();
      })
      .catch((err) => console.error("Logout failed", err));
  }

  return (
    <nav className="nav">
      <div className="brand instagram-logo">Instagram</div>
      <div className="links">
        <NavLink to="/home" style={linkStyle}>
          Home
        </NavLink>
        <NavLink to="/user-search" style={linkStyle}>
          Search
        </NavLink>
        <NavLink to="/create-post" style={linkStyle}>
          Create
        </NavLink>
        <NavLink to="/chat" style={linkStyle}>
          Chat
        </NavLink>

        {isLoggedIn ? (
          <>
            <NavLink to="/profile" style={linkStyle}>
              Profile
            </NavLink>
            <button
              onClick={handleLogout}
              className="btn-ghost"
              style={{ fontWeight: 600 }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" style={linkStyle}>
              Login
            </NavLink>
            <NavLink to="/register" style={linkStyle}>
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
