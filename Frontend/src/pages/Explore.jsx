import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import config from "../config"; // <--- IMPORT CONFIG
export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
// FIX: Use config
  const API_URL = config.API_URL;
  useEffect(() => {
    // Fetch trending posts
    axios.get(`${API_URL}/posts/explore`, { withCredentials: true })
      .then((res) => {
        setPosts(res.data.posts);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container page-enter">
      <h1 style={{ marginBottom: '20px' }}>Explore</h1>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : (
        <div className="profile-grid">
          {posts.map((post) => (
            <Link key={post._id} to={`/post/${post._id}`} className="grid-item">
              <img src={post.image} alt="Explore Content" />
              <div className="grid-overlay">
                <span style={{ fontSize: '1.2rem', display: 'flex', gap: '5px' }}>
                  ❤️ {post.likeCount}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <p className="muted" style={{ textAlign: 'center' }}>No trending posts found.</p>
      )}
    </div>
  );
}