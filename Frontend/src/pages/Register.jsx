import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import config from "../config"; 

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const API_URL = config.API_URL;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    
    setLoading(true);
    axios.post(`${API_URL}/auth/register`, { username: form.username, email: form.email, password: form.password }, { withCredentials: true })
      .then((response) => {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        window.location.href = "/"; 
      })
      .catch((err) => {
        console.error("Registration failed:", err);
        
        // FIX: Check for express-validator array of errors first
        if (err.response?.data?.errors && err.response.data.errors.length > 0) {
            setError(err.response.data.errors[0].msg);
        } 
        // Fallback for custom messages like "User already exists"
        else {
            setError(err.response?.data?.message || "Registration failed.");
        }
        
        setLoading(false);
      });
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">Instagram</h1>
        <p className="muted" style={{ fontSize: '1.1rem', textAlign: 'center' }}>
          Sign up to see photos and videos from your friends.
        </p>

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
          <input name="username" type="text" placeholder="Username" className="auth-input" value={form.username} onChange={handleChange} required autoComplete="username" />
          <input name="email" type="email" placeholder="Email" className="auth-input" value={form.email} onChange={handleChange} required autoComplete="email" />
          <input name="password" type="password" placeholder="Password" className="auth-input" value={form.password} onChange={handleChange} required autoComplete="new-password" />
          <input name="confirm" type="password" placeholder="Confirm Password" className="auth-input" value={form.confirm} onChange={handleChange} required autoComplete="new-password" />

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div style={{ marginTop: '30px', fontSize: '0.95rem' }}>
          <span className="muted">Have an account? </span>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}