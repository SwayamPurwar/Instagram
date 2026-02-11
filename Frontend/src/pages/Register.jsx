import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config"; // <--- IMPORT CONFIG
export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
// FIX: Use config
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
        setError(err.response?.data?.message || "Registration failed.");
        setLoading(false);
      });
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo-container">
          <svg className="auth-icon" viewBox="0 0 24 24" fill="none" stroke="url(#authGradReg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="authGradReg" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor:"#f09433", stopOpacity:1}} />
                <stop offset="50%" style={{stopColor:"#dc2743", stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:"#bc1888", stopOpacity:1}} />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          <h1 className="brand-logo">Instagram</h1>
        </div>
        
        <div className="auth-header">
          <h2>Get Started</h2>
          <p>Create an account to join the community.</p>
        </div>

        {error && <div style={{ width: '100%', background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid rgba(255, 59, 48, 0.2)' }}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input id="username" name="username" type="text" autoComplete="username" placeholder="Username" className="auth-input" value={form.username} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <input id="email" name="email" type="email" autoComplete="email" placeholder="Email" className="auth-input" value={form.email} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <input id="password" name="password" type="password" autoComplete="new-password" placeholder="Password" className="auth-input" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <div className="input-group">
            <input id="confirm" name="confirm" type="password" autoComplete="new-password" placeholder="Confirm Password" className="auth-input" value={form.confirm} onChange={handleChange} required />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <div className="spinner" style={{width:20, height:20, borderTopColor:'white', margin: '0 auto'}}></div> : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}