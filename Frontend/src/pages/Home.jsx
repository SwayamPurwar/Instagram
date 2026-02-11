import PostCard from "../components/PostCard.jsx";
import Stories from "../components/Stories.jsx";
import RightSidebar from "../components/RightSidebar.jsx";
import SkeletonPost from "../components/SkeletonPost.jsx";
import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import config from "../config"; // <--- IMPORT CONFIG

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observer = useRef();

  // FIX: Use config
  const API_URL = config.API_URL;
  const LIMIT = 10;

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/posts?skip=0&limit=${LIMIT}`, { withCredentials: true })
      .then((response) => {
        const newPosts = response.data.posts || [];
        setPosts(newPosts);
        setHasMore(newPosts.length === LIMIT);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load posts. Make sure you are logged in.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const fetchMorePosts = () => {
    if (isFetchingMore || !hasMore) return;

    setIsFetchingMore(true);
    const nextPage = page + 1;
    const skip = nextPage * LIMIT;

    axios
      .get(`${API_URL}/posts?skip=${skip}&limit=${LIMIT}`, { withCredentials: true })
      .then((response) => {
        const newPosts = response.data.posts || [];
        setPosts((prev) => {
          const existingIds = new Set(prev.map(p => p._id));
          const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p._id));
          return [...prev, ...uniqueNewPosts];
        });
        setPage(nextPage);
        setHasMore(newPosts.length === LIMIT);
      })
      .catch((err) => console.error("Failed to fetch more:", err))
      .finally(() => setIsFetchingMore(false));
  };

  const lastPostElementRef = useCallback((node) => {
    if (loading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMorePosts();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, isFetchingMore, page]);


  if (loading) {
    return (
      <div className="container" style={{ display: "flex", justifyContent: "center", gap: "30px", padding: "20px 0" }}>
        <div style={{ width: "100%", maxWidth: "630px" }}>
          <Stories /> 
          <div style={{ marginTop: "20px" }}>
            <SkeletonPost />
            <SkeletonPost />
          </div>
        </div>
        <RightSidebar />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: "center", marginTop: "2rem" }}>
        <p style={{ color: "red" }}>{error}</p>
        <Link to="/login" className="btn">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="container page-enter" style={{ display: "flex", justifyContent: "center", gap: "30px", padding: "20px 0" }}>
      <div style={{ width: "100%", maxWidth: "630px" }}>
        <Stories />

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <h2 className="brand-logo" style={{ fontSize: "3.5rem", marginBottom: "10px" }}>Instagram</h2>
            <p className="muted" style={{ marginBottom: "1.5rem" }}>
              Welcome to Instagram. Follow people to see their posts here.
            </p>
            <Link to="/create-post" className="btn">Create a Post</Link>
          </div>
        ) : (
          <div className="feed">
            {posts.map((post, index) => {
              const isLast = posts.length === index + 1;
              return (
                <div ref={isLast ? lastPostElementRef : null} key={post._id} className="animate-in" style={{ animationDelay: `${index < 5 ? index * 0.1 : 0}s` }}>
                  <PostCard
                    id={post._id}
                    username={post.user?.username || "Unknown User"}
                    userId={post.user?._id}
                    avatarUrl={post.user?.image}
                    postImage={post.image}
                    likesCount={post.likeCount}
                    caption={post.caption}
                    isLikedProp={post.isLiked}
                    comments={post.comments}
                    createdAt={post.createdAt}
                    setPosts={setPosts}
                  />
                </div>
              );
            })}
            
            {isFetchingMore && (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
              </div>
            )}
            
            {!hasMore && posts.length > 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                You're all caught up! ✓
              </div>
            )}
          </div>
        )}
      </div>
      <RightSidebar />
    </div>
  );
}