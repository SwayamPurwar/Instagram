import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext.jsx";
import { timeAgo } from "../utils/timeAgo.js";
import RichText from "./RichText";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(caption);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = currentUser.username === username;
  const API_URL = "http://localhost:3000";

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

  /* --- NEW PREMIUM ICONS --- */
  const HeartIcon = ({ filled, animate }) => (
    <svg
      aria-label="Like"
      color={filled ? "#ff3040" : "currentColor"}
      fill={filled ? "#ff3040" : "none"}
      height="24"
      viewBox="0 0 24 24"
      width="24"
      stroke={filled ? "none" : "currentColor"}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={animate ? "like-bounce" : ""}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );

  const CommentIcon = () => (
    <svg aria-label="Comment" fill="none" height="24" viewBox="0 0 24 24" width="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  );

  const ShareIcon = () => (
    <svg aria-label="Share Post" fill="none" height="24" viewBox="0 0 24 24" width="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );

  const BookmarkIcon = ({ filled }) => (
    <svg aria-label="Save" fill={filled ? "currentColor" : "none"} height="24" viewBox="0 0 24 24" width="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
  );

  const BigHeartIcon = () => (
    <svg aria-label="Like" fill="white" height="80" viewBox="0 0 48 48" width="80" style={{filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'}}>
      <path d="M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16L24 41 14.5 33.6C8.9 28.6 3 24.4 3 17.6c0-6.3 4.7-11.5 10.4-11.5 3.2 0 6.4 2 8.2 5.2 1.8-3.2 5-5.2 8.2-5.2z" />
    </svg>
  );

  // --- HANDLERS ---
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

  const handleDeleteComment = (commentId) => {
    if (!confirm("Delete this comment?")) return;
    axios.delete(`${API_URL}/posts/comment/${commentId}`, { withCredentials: true })
      .then(() => {
        if (setPosts) {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post._id === id ? { ...post, comments: post.comments.filter((c) => c._id !== commentId) } : post
            )
          );
        }
        addToast("Comment deleted", "info");
      })
      .catch(() => addToast("Failed to delete comment", "error"));
  };

  const handleDelete = () => {
    if (!confirm("Delete post?")) return;
    axios.delete(`${API_URL}/posts/${id}`, { withCredentials: true })
      .then(() => {
        if (setPosts) setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
        addToast("Post deleted", "info");
      })
      .catch(() => addToast("Failed to delete post", "error"));
  };

  const handleEditSubmit = () => {
    axios.put(`${API_URL}/posts/${id}`, { caption: editCaption }, { withCredentials: true })
      .then(() => {
        setIsEditing(false);
        if (setPosts) {
          setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, caption: editCaption } : p)));
        }
        addToast("Post updated", "success");
      })
      .catch(() => addToast("Failed to update post", "error"));
  };

  return (
    <article className="post card" style={{ border: 'none' }}>
      {/* Header */}
      <div className="post-header">
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link to={`/profile/${userId}`} style={{display:'flex', alignItems:'center', textDecoration:'none', color:'inherit'}}>
            <img className="avatar" src={avatarUrl || "https://via.placeholder.com/40"} alt="avatar" />
            <span className="username">{username}</span>
          </Link>
          {createdAt && <span className="muted" style={{ marginLeft: "4px", fontSize: "0.8rem" }}>• {timeAgo(createdAt)}</span>}
        </div>
        {isOwner && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setIsEditing(!isEditing)} className="btn-ghost" style={{ fontSize: "0.9rem" }}>{isEditing ? "Cancel" : "Edit"}</button>
            <button onClick={handleDelete} className="btn-ghost" style={{ color: "var(--danger)" }}>Delete</button>
          </div>
        )}
      </div>

      {/* Image & Overlay */}
      <div style={{ position: "relative" }} onDoubleClick={handleDoubleClick}>
        <img className="post-image" src={postImage} alt="Content" />
        <div
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%) scale(0)",
            opacity: showHeartOverlay ? 1 : 0,
            transition: "all 0.2s ease-out",
            animation: showHeartOverlay ? "popHeart 0.8s ease-out" : "none",
            pointerEvents: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <BigHeartIcon />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="post-actions">
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={likePost} className="action-btn" title="Like">
            <HeartIcon filled={liked} animate={animateLike} />
          </button>
          <button onClick={() => setShowInput(!showInput)} className="action-btn" title="Comment">
            <CommentIcon />
          </button>
          <button onClick={handleShare} className="action-btn" title="Share">
            <ShareIcon />
          </button>
        </div>
        <button onClick={handleSave} className="action-btn" title="Save">
          <BookmarkIcon filled={isSaved} />
        </button>
      </div>

      {/* Caption & Comments */}
      <div className="post-body">
        <div className="likes-count">{likesCount ? likesCount.toLocaleString() : 0} likes</div>
        <div className="caption">
          <Link to={`/profile/${userId}`} className="username" style={{textDecoration:'none', color:'inherit'}}>{username}</Link>
          {isEditing ? (
            <div style={{ marginTop: "8px" }}>
              <textarea className="input" value={editCaption} onChange={(e) => setEditCaption(e.target.value)} rows={2} />
              <button onClick={handleEditSubmit} className="btn" style={{ marginTop: "8px", fontSize: "0.8rem", padding: "6px 12px" }}>Save Changes</button>
            </div>
          ) : (
            <RichText text={caption} />
          )}
        </div>
        
        {comments.length > 0 && (
          <Link to={`/post/${id}`} style={{ marginTop: "6px", color: "var(--text-secondary)", fontSize: "0.9rem", display: "block", textDecoration: "none" }}>
            View all {comments.length} comments
          </Link>
        )}
        
        {comments.slice(0, 3).map((c, i) => (
          <div key={i} className="caption" style={{ marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Link to={`/profile/${c.user?._id}`} className="username" style={{textDecoration:'none', color:'inherit', fontSize: '0.95rem'}}>{c.user?.username}</Link>
              <span>{c.text}</span>
            </div>
            {currentUser.username === c.user?.username && (
              <button onClick={() => handleDeleteComment(c._id)} className="btn-ghost" style={{ fontSize: "0.7rem", color: "var(--danger)", padding: 0 }}>✕</button>
            )}
          </div>
        ))}
        
        {showInput && (
          <form onSubmit={handleCommentSubmit} style={{ marginTop: "12px", borderTop: "1px solid var(--glass-border)", paddingTop: "12px", display: "flex", gap: '10px' }}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{ border: "none", background: "transparent", width: "100%", outline: "none", fontSize: "0.9rem", color: "var(--text)" }}
            />
            <button type="submit" className="btn-ghost" style={{ fontSize: '0.9rem' }}>Post</button>
          </form>
        )}
      </div>
    </article>
  );
}