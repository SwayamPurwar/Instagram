import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import config from "../config";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = config.API_URL;

  useEffect(() => {
    axios.get(`${API_URL}/notifications`, { withCredentials: true })
      .then(res => {
          setNotifications(res.data.notifications);
          setLoading(false);
          // Mark read
          axios.put(`${API_URL}/notifications/read`, {}, { withCredentials: true });
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container page-enter" style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '24px', padding: '0 10px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Activity</h1>
      </div>

      {loading ? (
         <div className="spinner-container"><div className="spinner"></div></div>
      ) : (
        <div>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', opacity: 0.6 }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>💤</div>
              <p>No new notifications.</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div key={notif._id} className={`notif-item ${!notif.read ? 'unread' : ''}`}>
                <Link to={`/profile/${notif.sender?._id}`}>
                  <img src={notif.sender?.image || "https://via.placeholder.com/44"} className="notif-thumb" alt="User" />
                </Link>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem' }}>
                    <Link to={`/profile/${notif.sender?._id}`} style={{ fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}>
                      {notif.sender?.username}
                    </Link>
                    {' '}
                    <span style={{ color: 'var(--text)' }}>
                      {notif.type === 'like' && 'liked your post.'}
                      {notif.type === 'follow' && 'started following you.'}
                      {notif.type === 'comment' && `commented: "${notif.text}"`}
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                    {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {notif.post && (
                  <Link to={`/post/${notif.post._id}`}>
                    <img src={notif.post.image} className="notif-thumb" style={{ borderRadius: '8px' }} alt="Post" />
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}