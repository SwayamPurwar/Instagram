import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const API_URL = "http://localhost:3000";

  useEffect(() => {
    axios.get(`${API_URL}/notifications`, { withCredentials: true })
      .then(res => {
          setNotifications(res.data.notifications);
          // Mark as read silently in background
          axios.put(`${API_URL}/notifications/read`, {}, { withCredentials: true });
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container page-enter">
      <h1 style={{ marginBottom: '24px', paddingLeft: '10px', fontSize: '2rem', fontWeight: 800 }}>Activity</h1>
      
      <div className="notification-list">
        {notifications.length === 0 && (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem' }}>💤</span>
            <p className="muted" style={{ marginTop: '10px' }}>No new notifications.</p>
          </div>
        )}
        
        {notifications.map(notif => (
          <div 
            key={notif._id} 
            className={`notification-item ${!notif.read ? 'notif-unread' : ''}`}
          >
            {/* Avatar Linked to Profile */}
            <Link to={`/profile/${notif.sender?._id}`}>
              <img 
                src={notif.sender?.image || "https://via.placeholder.com/48"} 
                className="notif-avatar"
                alt="Sender"
              />
            </Link>

            {/* Text Content */}
            <div style={{ flex: 1 }}>
               <Link to={`/profile/${notif.sender?._id}`} style={{ fontWeight: 700, color: 'var(--text)', textDecoration: 'none', marginRight: '6px' }}>
                 {notif.sender?.username}
               </Link>
               <span style={{ color: 'var(--text)' }}>
                 {notif.type === 'like' && 'liked your post.'}
                 {notif.type === 'follow' && 'started following you.'}
                 {notif.type === 'unfollow' && 'unfollowed you.'}
                 {notif.type === 'comment' && `commented: "${notif.text}"`}
               </span>
               <div className="muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                 {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
               </div>
            </div>

            {/* Post Preview (if applicable) */}
            {notif.post && (
               <Link to={`/post/${notif.post._id}`}>
                 <img src={notif.post.image} className="notif-post-preview" alt="Post" />
               </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}