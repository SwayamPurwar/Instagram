import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import config from "../config"; 

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = config.API_URL;

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
    <div className="container page-enter" style={{ maxWidth: '700px' }}>
      
      {/* 1. FLOATING SEARCH HEADER */}
      <div style={{ position: 'sticky', top: '20px', zIndex: 50, marginBottom: '30px' }}>
        <div style={{ position: 'relative' }}>
          <svg 
            style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
            width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          
          <input
            type="text"
            className="glass-search-input"
            placeholder="Search for people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          
          {loading && (
             <div className="spinner" style={{ position: 'absolute', right: '20px', top: '18px', width: 20, height: 20, borderWidth: 2 }}></div>
          )}
        </div>
      </div>

      {/* 2. RESULTS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!loading && results.length === 0 && query && (
          <div style={{ textAlign: "center", marginTop: "40px", opacity: 0.6 }}>
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🤔</div>
            <p>No users found for "{query}"</p>
          </div>
        )}

        {!query && results.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "60px", opacity: 0.5 }}>
            <p>Type to find friends, creators, and more.</p>
          </div>
        )}

        {results.map((user) => (
          <Link to={`/profile/${user._id}`} key={user._id} className="user-list-item">
            <img
              src={user.image || "https://via.placeholder.com/56"}
              alt={user.username}
              style={{
                width: 56, height: 56,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid rgba(255,255,255,0.5)"
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{user.username}</div>
              
              {user.bio && (
                <div style={{ fontSize: "0.85rem", marginTop: "4px", opacity: 0.8, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {user.bio}
                </div>
              )}
            </div>
            <div className="btn-ghost" style={{ fontSize: '1.2rem' }}>→</div>
          </Link>
        ))}
      </div>
    </div>
  );
}