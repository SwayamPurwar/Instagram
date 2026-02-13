import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext.jsx";
import { timeAgo } from "../utils/timeAgo.js";
import RichText from "./RichText";
import config from "../config";

export default function PostCard({
  id,
  username,
  userId,
  avatarUrl,
  postImage,
  likesCount,
  caption,
  comments = [],
  createdAt,
  setPosts,
  isLikedProp = false,
}) {
  const [commentText, setCommentText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [liked, setLiked] = useState(isLikedProp);
  const [animateLike, setAnimateLike] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = currentUser.username === username;
  const API_URL = config.API_URL;
  const navigate = useNavigate();

  let addToast = (msg) => console.log(msg);
  try {
    const toast = useToast();
    if (toast) addToast = toast.addToast;
  } catch (e) {}

  useEffect(() => {
    if (currentUser.savedPosts && currentUser.savedPosts.includes(id)) {
      setIsSaved(true);
    }
    setLiked(isLikedProp);
  }, [id, isLikedProp]);

  // --- Handlers ---
  
  // NEW: Delete Handler
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`${API_URL}/posts/${id}`, { withCredentials: true });
      addToast("Post deleted", "success");
      
      // Update UI
      if (setPosts) {
        setPosts((prev) => prev.filter((post) => post._id !== id));
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to delete post", "error");
    }
  };

  const likePost = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    if (newLiked) {
      setAnimateLike(true);
      setTimeout(() => setAnimateLike(false), 450);
    }
    axios.post(`${API_URL}/posts/like`, { post: id }, { withCredentials: true })
      .then((response) => {
        setLiked(response.data.isLiked);
        if (setPosts) {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post._id === id ? { ...post, likeCount: response.data.isLiked ? post.likeCount + 1 : post.likeCount - 1, isLiked: response.data.isLiked } : post
            )
          );
        }
      })
      .catch(() => setLiked(!newLiked));
  };

  const handleDoubleClick = () => {
    if (!liked) likePost();
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 800);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${id}`);
    addToast("Link copied! 📋", "success");
  };

  const handleSave = () => {
    axios.post(`${API_URL}/posts/save/${id}`, {}, { withCredentials: true })
      .then((res) => {
        setIsSaved(res.data.isSaved);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (res.data.isSaved) {
          user.savedPosts = [...(user.savedPosts || []), id];
          addToast("Post Saved", "success");
        } else {
          user.savedPosts = (user.savedPosts || []).filter((pid) => pid !== id);
          addToast("Post Unsaved", "info");
        }
        localStorage.setItem("user", JSON.stringify(user));
      })
      .catch((err) => console.error(err));
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    axios.post(`${API_URL}/posts/comment`, { post: id, text: commentText }, { withCredentials: true })
      .then((response) => {
        const newComment = { ...response.data.comment, user: { username: currentUser.username || "Me" } };
        if (setPosts) {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post._id === id ? { ...post, comments: [...post.comments, newComment] } : post
            )
          );
        }
        setCommentText("");
        addToast("Comment posted", "success");
      })
      .catch((err) => console.error(err));
  };

  return (
    <article className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link to={`/profile/${userId}`} style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img 
              src={avatarUrl || "https://via.placeholder.com/40"} 
              alt="avatar" 
              style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)" }} 
            />
          </Link>
          <div style={{ display: "flex", flexDirection: "column" }}>
             <Link to={`/profile/${userId}`} style={{ fontWeight: 600, color: "var(--text)", textDecoration: "none", fontSize: "0.95rem" }}>
                {username}
             </Link>
             {createdAt && <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>{timeAgo(createdAt)}</span>}
          </div>
        </div>
        {isOwner && (
          <button 
            onClick={handleDelete} 
            className="btn-ghost" 
            style={{ padding: "4px", color: "var(--danger)" }}
            title="Delete Post"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        )}
      </div>

      {/* Image & Overlay */}
      <div style={{ position: "relative", cursor: "pointer" }} onDoubleClick={handleDoubleClick}>
        <img src={postImage} alt="Content" style={{ width: "100%", display: "block", maxHeight: "600px", objectFit: "cover" }} />
        <div
          style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
            animation: showHeartOverlay ? "popHeart 0.8s ease-out" : "none",
            opacity: showHeartOverlay ? 1 : 0, transition: "opacity 0.2s"
          }}
        >
          <svg fill="white" height="100" viewBox="0 0 48 48" width="100" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
            <path d="M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16L24 41 14.5 33.6C8.9 28.6 3 24.4 3 17.6c0-6.3 4.7-11.5 10.4-11.5 3.2 0 6.4 2 8.2 5.2 1.8-3.2 5-5.2 8.2-5.2z" />
          </svg>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ padding: "12px 14px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <button onClick={likePost} className="action-btn" style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.1s' }}>
              <svg 
                 color={liked ? "#ff3040" : "currentColor"} 
                 fill={liked ? "#ff3040" : "none"} 
                 height="24" width="24" viewBox="0 0 24 24" 
                 stroke={liked ? "none" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                 className={animateLike ? "like-bounce" : ""}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <button onClick={() => setShowInput(!showInput)} style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer', color: "var(--text)" }}>
              <svg fill="none" height="24" width="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </button>
            <button onClick={handleShare} style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer', color: "var(--text)" }}>
               <svg fill="none" height="24" width="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <button onClick={handleSave} style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer', color: "var(--text)" }}>
            <svg fill={isSaved ? "currentColor" : "none"} height="24" width="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>

        <div style={{ fontWeight: "700", marginBottom: "8px" }}>
          {likesCount ? likesCount.toLocaleString() : 0} likes
        </div>

        <div style={{ marginBottom: "8px" }}>
          <span style={{ fontWeight: "700", marginRight: "6px" }}>{username}</span>
          <span style={{ lineHeight: "1.5" }}><RichText text={caption} /></span>
        </div>

        {comments.length > 0 && (
          <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", cursor: "pointer", marginBottom: "4px" }}>
            View all {comments.length} comments
          </div>
        )}

        {comments.slice(0, 2).map((c, i) => (
          <div key={i} style={{ display: "flex", gap: "6px", fontSize: "0.9rem", marginBottom: "2px" }}>
            <span style={{ fontWeight: "600" }}>{c.user?.username}</span>
            <span>{c.text}</span>
          </div>
        ))}
      </div>

      {/* Comment Input */}
      {showInput && (
        <form onSubmit={handleCommentSubmit} style={{ borderTop: "1px solid var(--border)", padding: "12px 14px", marginTop: "10px", display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: "0.9rem", color: "var(--text)" }}
            autoFocus
          />
          <button type="submit" style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "600", cursor: "pointer", opacity: commentText.trim() ? 1 : 0.5 }} disabled={!commentText.trim()}>
            Post
          </button>
        </form>
      )}
    </article>
  );
}