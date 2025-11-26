import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext.jsx";
import StoryViewer from "./StoryViewer.jsx"; 

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [viewingStories, setViewingStories] = useState(null); 
  const fileInputRef = useRef(null);
  
  let addToast = (msg) => console.log(msg);
  try { const toast = useToast(); if (toast) addToast = toast.addToast; } catch (e) {}

  const API_URL = "http://localhost:3000";
  
  const groupedStories = stories.reduce((acc, story) => {
    if (!story.user) return acc;
    const userId = story.user._id;
    if (!acc[userId]) {
      acc[userId] = { user: story.user, items: [] };
    }
    acc[userId].items.push(story);
    return acc;
  }, {});

  const storyList = Object.values(groupedStories);

  useEffect(() => {
    fetchStories();
  }, []);

  function fetchStories() {
    axios.get(`${API_URL}/stories`, { withCredentials: true })
      .then(res => setStories(res.data.stories || []))
      .catch(err => console.error("Failed to fetch stories:", err));
  }

  function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    addToast("Uploading Story...", "info");

    axios.post(`${API_URL}/stories`, formData, { withCredentials: true })
      .then(() => {
        addToast("Story Added!", "success");
        fetchStories();
      })
      .catch((err) => {
        const msg = err.response?.data?.message || "Failed to upload story";
        addToast(msg, "error");
      });
  }

  return (
    <>
      {viewingStories && (
        <StoryViewer 
          stories={viewingStories} 
          onClose={() => setViewingStories(null)} 
        />
      )}

      <div className="card" style={{ 
        padding: '20px', 
        marginBottom: '24px', 
        overflowX: 'auto', 
        whiteSpace: 'nowrap', 
        display: 'flex',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', minWidth: 'min-content' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => fileInputRef.current.click()}>
            <div style={{ 
               width: 68, height: 68, borderRadius: '50%', 
               border: '2px dashed var(--text-secondary)', 
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               fontSize: '2rem', color: 'var(--primary)',
               background: 'rgba(255,255,255,0.1)'
            }}>
              +
            </div>
            <span style={{ fontSize: '0.8rem', width: 70, textAlign: 'center', overflow:'hidden', textOverflow:'ellipsis', fontWeight: 500 }}>Your Story</span>
            <input ref={fileInputRef} type="file" style={{display:'none'}} accept="image/*" onChange={handleUpload} />
          </div>

          {storyList.map((group) => (
            <div 
              key={group.user._id} 
              onClick={() => setViewingStories(group.items)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <div className="story-ring" style={{ 
                 width: 72, height: 72, borderRadius: '50%', 
                 padding: '3px', 
              }}>
                <img 
                  src={group.user.image || "https://via.placeholder.com/60"} 
                  alt={group.user.username} 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', border: '3px solid var(--card)', objectFit: 'cover', background: 'var(--card)' }}
                />
              </div>
              <span style={{ fontSize: '0.8rem', width: 70, textAlign: 'center', overflow:'hidden', textOverflow:'ellipsis', fontWeight: 500 }}>
                {group.user.username}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}