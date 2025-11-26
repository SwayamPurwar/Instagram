import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:3000";

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchUsers();
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query]);

  function searchUsers() {
    setLoading(true);
    axios
      .get(`${API_URL}/users/search?query=${query}`, { withCredentials: true })
      .then((res) => setResults(res.data.users))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  return (
    <div className="container page-enter">
      {/* Floating Glass Header */}
      <div className="search-header">
        <div className="search-bar-glass">
          <svg width="20" height="20" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search for people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {loading && <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>}
        </div>
      </div>

      {/* Results Area */}
      <div>
        {!loading && results.length === 0 && query && (
          <div style={{ textAlign: "center", marginTop: "40px", opacity: 0.6 }}>
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🔍</div>
            <p>No users found for "{query}"</p>
          </div>
        )}

        {!query && results.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "60px", opacity: 0.5 }}>
            <p>Type to find friends, creators, and more.</p>
          </div>
        )}

        <div className="search-results-grid">
          {results.map((user) => (
            <Link to={`/profile/${user._id}`} key={user._id} className="user-card">
              <img
                src={user.image || "https://via.placeholder.com/56"}
                alt={user.username}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,0.5)"
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', truncate: true }}>{user.username}</div>
                <div className="muted" style={{ fontSize: "0.9rem", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
                {user.bio && (
                  <div style={{ fontSize: "0.85rem", marginTop: "4px", opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.bio}
                  </div>
                )}
              </div>
              <div className="btn-ghost" style={{ fontSize: '1.2rem' }}>→</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}