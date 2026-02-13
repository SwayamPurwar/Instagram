import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import config from "../config"; 

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams(); // <--- Get Params
  const query = searchParams.get("q")
  const API_URL = config.API_URL;

  useEffect(() => {
    setLoading(true);
    // Decide which endpoint to hit
    const endpoint = query 
      ? `${API_URL}/posts/search?query=${query}` // Search mode
      : `${API_URL}/posts/explore`; // Default explore mode
    // Fetch trending posts
    axios.get(endpoint, { withCredentials: true })
      .then((res) => {
        setPosts(res.data.posts);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [query]);

  return (
    <div className="container page-enter">
      <div style={{ marginBottom: '30px', padding: '10px 0' }}>
         <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Explore</h1>
         <p className="muted">Trending posts for you</p>
      </div>
      
      {loading ? (
        <div className="spinner-container"><div className="spinner"></div></div>
      ) : (
        <div className="image-grid">
          {posts.map((post) => (
            <Link key={post._id} to={`/post/${post._id}`} className="grid-image-container">
              <img src={post.image} alt="Explore Content" className="grid-image" />
              <div className="grid-overlay">
                <span style={{ display: 'flex', gap: '5px' }}>
                  ❤️ {post.likeCount}
                </span>
                <span style={{ display: 'flex', gap: '5px' }}>
                  💬 {post.comments?.length || 0}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p className="muted">No trending posts found right now.</p>
        </div>
      )}
    </div>
  );
}