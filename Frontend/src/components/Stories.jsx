import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext.jsx";
import StoryViewer from "./StoryViewer.jsx"; 
import config from "../config";

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [viewingStories, setViewingStories] = useState(null); 
  const fileInputRef = useRef(null);
  
  let addToast = (msg) => console.log(msg);
  try { const toast = useToast(); if (toast) addToast = toast.addToast; } catch (e) {}

  const API_URL = config.API_URL;
  
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

      <div className="stories-rail">
        {/* ADD STORY BUTTON */}
        <div className="story-item" onClick={() => fileInputRef.current.click()}>
          <div className="story-ring add-story">
            <span>+</span>
          </div>
          <span className="story-username">Your Story</span>
          <input 
            ref={fileInputRef} 
            type="file" 
            style={{display:'none'}} 
            accept="image/*" 
            onChange={handleUpload} 
          />
        </div>

        {/* STORY LIST */}
        {storyList.map((group) => (
          <div 
            key={group.user._id} 
            className="story-item"
            onClick={() => setViewingStories(group.items)}
          >
            <div className="story-ring">
              <img 
                src={group.user.image || "https://via.placeholder.com/60"} 
                alt={group.user.username} 
                className="story-avatar"
              />
            </div>
            <span className="story-username">
              {group.user.username}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}