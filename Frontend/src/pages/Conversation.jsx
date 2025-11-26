import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Conversation() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define API_URL
  const API_URL = "http://localhost:3000";

  useEffect(() => {
    // Use API_URL
    axios
      .get(`${API_URL}/chat/conversations`, { withCredentials: true })
      .then((res) => {
        setConversations(res.data.conversations || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginBottom: "1.5rem" }}>Messages</h1>

        {loading && <p className="muted">Loading chats...</p>}

        {!loading && conversations.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>No conversations yet.</p>
            <Link to="/user-search" className="btn">
              Start a new chat
            </Link>
          </div>
        )}

        <div className="grid-1 gap-2">
          {conversations.map((convo) => (
            <Link
              key={convo._id}
              to={`/chat/${convo._id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  border: "1px solid var(--border)",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "var(--bg)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "var(--card)")
                }
              >
                <img
                  src={
                    convo.userDetails.image || "https://via.placeholder.com/50"
                  }
                  alt={convo.userDetails.username}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong style={{ fontSize: "1rem" }}>
                      {convo.userDetails.username}
                    </strong>
                    <span className="muted" style={{ fontSize: "0.75rem" }}>
                      {new Date(convo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div
                    className="muted"
                    style={{
                      fontSize: "0.9rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {convo.lastMessage}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
