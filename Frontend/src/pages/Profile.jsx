import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import config from "../config"; 

export default function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ followers: 0, following: 0, isFollowing: false });
  
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = config.API_URL;
  
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
const isMyProfile = !id || (currentUser.id === id || currentUser._id === id);

  useEffect(() => {
    setUser(null);
    setPosts([]);
    setSavedPosts([]);
    setLoading(true);
    
    async function fetchProfileData() {
      try {
        let profileUser = null;
        if (id) {
           const res = await axios.get(`${API_URL}/users/${id}`, { withCredentials: true });
           profileUser = res.data.user;
        } else {
           if (currentUser) profileUser = currentUser;
        }

        if (profileUser) {
          setUser(profileUser);
          const userId = profileUser._id || profileUser.id;

          const postsRes = await axios.get(`${API_URL}/posts?user=${userId}&limit=20`, { withCredentials: true });
          setPosts(postsRes.data.posts || []);

          const statsRes = await axios.get(`${API_URL}/follow/stats/${userId}`, { withCredentials: true });
          setStats({
             followers: statsRes.data.followersCount,
             following: statsRes.data.followingCount,
             isFollowing: statsRes.data.Vk
          });

          if (isMyProfile) {
            try {
                const savedRes = await axios.get(`${API_URL}/posts/saved`, { withCredentials: true });
                setSavedPosts(savedRes.data.posts || []);
            } catch (e) { console.error(e); }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfileData();
  }, [id]);

  function handleFollow() {
     if (!user) return;
     const userId = user._id || user.id;
     axios.post(`${API_URL}/follow/toggle`, { userId }, { withCredentials: true })
      .then(res => {
         setStats(prev => ({ ...prev, isFollowing: res.data.isFollowing, followers: res.data.isFollowing ? prev.followers + 1 : prev.followers - 1 }));
      });
  }

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;
  if (!user) return <div className="container" style={{textAlign:'center', marginTop: 40}}>User not found</div>;

  const displayPosts = activeTab === 'posts' ? posts : savedPosts;

  return (
    <div className="container page-enter" style={{ paddingBottom: 80 }}>
      {/* 1. GLASS PROFILE HEADER */}
      <div className="profile-card">
        <div style={{ flexShrink: 0, display:'flex', justifyContent:'center' }}>
          <img 
            className="profile-avatar-lg" 
            src={user.image || "https://via.placeholder.com/150"} 
            alt={user.username} 
          />
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
           {/* Top Row: Name & Buttons */}
           <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
             <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 300 }}>{user.username}</h2>
             
             <div style={{ display: 'flex', gap: '8px' }}>
                {isMyProfile ? (
                    <button onClick={() => navigate("/edit-profile")} className="btn-outline" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                      Edit Profile
                    </button>
                ) : (
                    <>
                      <button className={stats.isFollowing ? "btn-outline" : "btn"} onClick={handleFollow}>
                        {stats.isFollowing ? "Unfollow" : "Follow"}
                      </button>
                      <button onClick={() => navigate(`/chat/${user._id || user.id}`)} className="btn-outline">
                        Message
                      </button>
                    </>
                )}
             </div>
           </div>

           {/* Stats Row */}
           <div style={{ display: 'flex', gap: '40px' }}>
             <div className="stat-box">
                <span className="stat-num">{posts.length}</span>
                <span className="stat-label">posts</span>
             </div>
             <div className="stat-box">
                <span className="stat-num">{stats.followers}</span>
                <span className="stat-label">followers</span>
             </div>
             <div className="stat-box">
                <span className="stat-num">{stats.following}</span>
                <span className="stat-label">following</span>
             </div>
           </div>

           {/* Bio */}
           <div style={{ lineHeight: '1.5', fontSize: '1rem' }}>
             <strong>{user.username}</strong>
             <div style={{ whiteSpace: "pre-wrap", color: 'var(--text-secondary)' }}>{user.bio || "No bio yet."}</div>
           </div>
        </div>
      </div>

      {/* 2. PILL TABS (Only for owner) */}
      {isMyProfile && (
        <div className="profile-tabs">
          <button 
            onClick={() => setActiveTab('posts')} 
            className={`tab-pill ${activeTab === 'posts' ? 'active' : ''}`}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
            POSTS
          </button>
          <button 
            onClick={() => setActiveTab('saved')} 
            className={`tab-pill ${activeTab === 'saved' ? 'active' : ''}`}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            SAVED
          </button>
        </div>
      )}

      {/* 3. IMAGE GRID */}
      <div className="image-grid">
        {displayPosts.map((post) => (
          <div key={post._id} className="grid-image-container" onClick={() => navigate(`/post/${post._id}`)}>
            <img src={post.image} alt="Post" className="grid-image" />
            <div className="grid-overlay">
              <span style={{display:'flex', gap:5, alignItems:'center'}}>❤️ {post.likeCount}</span>
              <span style={{display:'flex', gap:5, alignItems:'center'}}>💬 {post.comments?.length || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {displayPosts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.6 }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📷</div>
          <h3>No Posts Yet</h3>
        </div>
      )}
    </div>
  );
}