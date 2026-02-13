import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext.jsx";
import { timeAgo } from "../utils/timeAgo.js";
import RichText from "../components/RichText.jsx";
import config from "../config"; 

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);
  
  // Edit & Delete State
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState("");
  
  const { addToast } = useToast();
  const API_URL = config.API_URL;
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    axios.get(`${API_URL}/posts/${id}`, { withCredentials: true })
      .then((res) => {
        setPost(res.data.post);
        setLiked(res.data.post.isLiked);
        setEditCaption(res.data.post.caption); // Initialize edit text
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        addToast("Post not found", "error");
        setLoading(false);
        navigate("/");
      });
  }, [id, navigate, addToast]);

  const handleLike = () => {
    setLiked(!liked);
    setPost(prev => ({ ...prev, likeCount: liked ? prev.likeCount - 1 : prev.likeCount + 1 }));
    axios.post(`${API_URL}/posts/like`, { post: id }, { withCredentials: true }).catch(console.error);
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    axios.post(`${API_URL}/posts/comment`, { post: id, text: commentText }, { withCredentials: true })
      .then((res) => {
        const newComment = { ...res.data.comment, user: { username: currentUser.username, image: currentUser.image, _id: currentUser._id || currentUser.id } };
        setPost(prev => ({ ...prev, comments: [...prev.comments, newComment] }));
        setCommentText("");
        addToast("Comment posted", "success");
      })
      .catch(() => addToast("Failed to post comment", "error"));
  };

  const handleDeleteComment = (commentId) => {
    if(!confirm("Delete comment?")) return;
    axios.delete(`${API_URL}/posts/comment/${commentId}`, { withCredentials: true })
      .then(() => {
        setPost(prev => ({ ...prev, comments: prev.comments.filter(c => c._id !== commentId) }));
      })
      .catch(() => addToast("Failed to delete", "error"));
  };

  // --- DELETE POST ---
  const handleDeletePost = async () => {
    if (!confirm("Delete this post permanently?")) return;
    try {
      await axios.delete(`${API_URL}/posts/${id}`, { withCredentials: true });
      addToast("Post deleted", "success");
      navigate(-1);
    } catch (err) {
      addToast("Failed to delete", "error");
    }
  };

  // --- EDIT POST ---
  const handleEditPost = async () => {
    try {
      const res = await axios.put(`${API_URL}/posts/${id}`, { caption: editCaption }, { withCredentials: true });
      setPost(prev => ({ ...prev, caption: editCaption }));
      setIsEditing(false);
      setShowMenu(false);
      addToast("Post updated", "success");
    } catch (err) {
      addToast("Failed to update", "error");
    }
  };

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;
  if (!post) return null;

  return (
    <div className="container page-enter" style={{ paddingBottom: '80px', paddingTop: '20px' }}>
      
      {/* Back Button */}
      <div style={{ marginBottom: '16px' }}>
        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ fontSize: '1rem', paddingLeft: 0 }}>
          ← Back
        </button>
      </div>

      <div className="post-modal">
        {/* LEFT: Image */}
        <div className="post-modal-image-container">
          <img src={post.image} alt="Post" className="post-modal-image" />
        </div>

        {/* RIGHT: Sidebar */}
        <div className="post-modal-sidebar">
          
          {/* Header */}
          <div className="post-modal-header">
            <Link to={`/profile/${post.user?._id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
              <img src={post.user?.image || "https://via.placeholder.com/40"} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
              <span style={{ fontWeight: 700 }}>{post.user?.username}</span>
            </Link>
            
            {/* Owner Actions Dropdown */}
            {(currentUser.username === post.user?.username) && (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowMenu(!showMenu)} className="btn-ghost" style={{ fontSize: '1.2rem' }}>•••</button>
                
                {showMenu && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%',
                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                    borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                    zIndex: 10, minWidth: '120px', overflow: 'hidden'
                  }}>
                    <button 
                      onClick={() => { setIsEditing(true); setShowMenu(false); }}
                      style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', color: 'var(--text)', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={handleDeletePost}
                      style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', color: '#ff3b30', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scrollable Comments Area */}
          <div className="post-modal-comments">
            {/* Caption / Edit Area */}
            <div className="comment-row">
               <img src={post.user?.image || "https://via.placeholder.com/40"} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
               <div style={{ width: '100%' }}>
                  <span style={{ fontWeight: 700, marginRight: '6px' }}>{post.user?.username}</span>
                  
                  {isEditing ? (
                    <div style={{ marginTop: '8px' }}>
                      <textarea 
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        className="glass-search-input"
                        rows="3"
                        style={{ width: '100%', borderRadius: '12px', padding: '10px' }}
                      />
                      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                        <button onClick={handleEditPost} className="btn" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Save</button>
                        <button onClick={() => setIsEditing(false)} className="btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <RichText text={post.caption} />
                      <div className="muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>{timeAgo(post.createdAt)}</div>
                    </>
                  )}
               </div>
            </div>

            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }}></div>

            {/* Comments List */}
            {post.comments.map((comment) => (
              <div key={comment._id} className="comment-row">
                <Link to={`/profile/${comment.user?._id}`}>
                  <img src={comment.user?.image || "https://via.placeholder.com/32"} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                </Link>
                <div style={{ flex: 1 }}>
                   <Link to={`/profile/${comment.user?._id}`} style={{ fontWeight: 700, marginRight: '6px', textDecoration:'none', color:'inherit' }}>
                     {comment.user?.username}
                   </Link>
                   <span>{comment.text}</span>
                   {(currentUser.username === comment.user?.username || currentUser.username === post.user?.username) && (
                      <button onClick={() => handleDeleteComment(comment._id)} className="btn-ghost" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '8px', padding: 0 }}>
                        delete
                      </button>
                   )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="post-modal-footer">
            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '1.5rem' }}>
               <button onClick={handleLike} className="btn-ghost" style={{ padding: 0 }}>
                 {liked ? '❤️' : '🤍'}
               </button>
               <button className="btn-ghost" style={{ padding: 0 }}>💬</button>
               <button className="btn-ghost" style={{ padding: 0 }}>🚀</button>
            </div>
            
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>{post.likeCount} likes</div>
            <div className="muted" style={{ fontSize: '0.75rem', marginBottom: '12px' }}>{new Date(post.createdAt).toLocaleDateString()}</div>

            <form onSubmit={handleComment} style={{ display: 'flex', gap: '8px' }}>
              <input 
                className="glass-search-input" 
                style={{ padding: '8px 12px', borderRadius: '16px', fontSize: '0.9rem' }}
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button type="submit" className="btn-ghost" disabled={!commentText.trim()}>Post</button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}