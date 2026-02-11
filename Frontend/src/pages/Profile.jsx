import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import config from "../config"; // <--- IMPORT CONFIG
export default function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ followers: 0, following: 0, isFollowing: false });
  
  const { id } = useParams();
  const navigate = useNavigate();
 // FIX: Use config
  const API_URL = config.API_URL;
  
  // FIX: Determine if it's "my" profile even if ID is present
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
        // Fetch specific user if ID exists, otherwise current user
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
  if (!user) return <div className="container">User not found</div>;

  const displayPosts = activeTab === 'posts' ? posts : savedPosts;

  return (
    <div className="container page-enter">
      <header className="profile-header">
        <div className="profile-image-container">
          <img className="profile-avatar" src={user.image || "https://via.placeholder.com/150"} alt={user.username} />
        </div>
        <section className="profile-info">
           <div className="profile-top-row">
             <h2 className="profile-username">{user.username}</h2>
             {isMyProfile ? (
                <button onClick={() => navigate("/edit-profile")} className="btn-outline" style={{fontWeight: 600}}>Edit Profile</button>
             ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className={stats.isFollowing ? "btn-outline" : "btn"} onClick={handleFollow}>
                    {stats.isFollowing ? "Unfollow" : "Follow"}
                  </button>
                  <button onClick={() => navigate(`/chat/${user._id || user.id}`)} className="btn-outline">Message</button>
                </div>
             )}
           </div>

           <ul className="profile-stats">
             <li><span className="stat-count">{posts.length}</span> posts</li>
             <li><span className="stat-count">{stats.followers}</span> followers</li>
             <li><span className="stat-count">{stats.following}</span> following</li>
           </ul>

           <div className="profile-bio">
             <strong>{user.username}</strong>
             <div style={{ whiteSpace: "pre-wrap" }}>{user.bio || "No bio yet."}</div>
           </div>
        </section>
      </header>

      {isMyProfile && (
        <div className="profile-tabs">
          <button onClick={() => setActiveTab('posts')} className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}>
            <svg fill="currentColor" viewBox="0 0 24 24"><rect fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="18" x="3" y="3"></rect><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="9.015" x2="9.015" y1="3" y2="21"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="14.985" x2="14.985" y1="3" y2="21"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="9.015" y2="9.015"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="14.985" y2="14.985"></line></svg>
            POSTS
          </button>
          <button onClick={() => setActiveTab('saved')} className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}>
            <svg fill="currentColor" viewBox="0 0 24 24"><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
            SAVED
          </button>
        </div>
      )}

      <div className="profile-grid">
        {displayPosts.map((post) => (
          <div key={post._id} className="grid-item" onClick={() => navigate(`/post/${post._id}`)}>
            <img src={post.image} alt="Post" />
            <div className="grid-overlay"><span style={{display:'flex', gap:5, alignItems:'center'}}>❤️ {post.likeCount}</span></div>
          </div>
        ))}
      </div>

      {displayPosts.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📸</span>
          <h3>{activeTab === 'posts' ? 'Share Photos' : 'Save Posts'}</h3>
          <p style={{maxWidth: 300, margin:'10px auto'}}>
            {activeTab === 'posts' ? "When you share photos, they will appear on your profile." : "Save photos and videos that you want to see again."}
          </p>
          {activeTab === 'posts' && isMyProfile && (
            <button onClick={() => navigate("/create-post")} className="btn-ghost" style={{marginTop:'10px'}}>Share your first photo</button>
          )}
        </div>
      )}
    </div>
  );
}