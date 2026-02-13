import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import config from "../config"; 

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_URL = config.API_URL;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    axios
      .post(`${API_URL}/auth/login`, form, { withCredentials: true })
      .then((response) => {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        window.location.href = "/"; 
      })
      .catch((err) => {
        console.error("Login failed:", err);
        setError(err.response?.data?.message || "Invalid credentials.");
        setLoading(false);
      });
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">Instagram</h1>
        <p className="muted" style={{ fontSize: '1.1rem' }}>Welcome back</p>

        {error && (
          <div style={{ 
            width: '100%', marginTop: '20px', padding: '12px', 
            borderRadius: '12px', background: 'rgba(255, 59, 48, 0.1)', 
            color: '#ff3b30', fontSize: '0.9rem', textAlign: 'center' 
          }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email address"
            className="auth-input"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="auth-input"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div style={{ marginTop: '30px', fontSize: '0.95rem' }}>
          <span className="muted">Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}