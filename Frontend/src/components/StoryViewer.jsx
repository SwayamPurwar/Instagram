import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { timeAgo } from "../utils/timeAgo";
import config from "../config";

export default function StoryViewer({ stories, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [localStories, setLocalStories] = useState(stories);

  const storyDuration = 5000; // 5 seconds per story
  const intervalRef = useRef(null);
  const API_URL = config.API_URL;
  
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Close if all stories are deleted
  useEffect(() => {
    if (localStories.length === 0) {
      onClose();
    }
  }, [localStories, onClose]);

  const currentStory = localStories[currentIndex];
  
  // Guard clause to prevent crash during delete transition
  if (!currentStory) return null;

  const user = currentStory.user;
  const isOwner = (currentUser.id === user._id) || (currentUser._id === user._id);

  // Lock Body Scroll when Story is Open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Handle Progress Bar & Auto-Advance
  useEffect(() => {
    setProgress(0);
    clearInterval(intervalRef.current);

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percentage = (elapsed / storyDuration) * 100;
      
      if (percentage >= 100) {
        nextStory();
      } else {
        setProgress(percentage);
      }
    }, 50);

    return () => clearInterval(intervalRef.current);
  }, [currentIndex, localStories]);

  const nextStory = () => {
    if (currentIndex < localStories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setProgress(0);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm("Delete this story?")) return;

    // Pause timer
    clearInterval(intervalRef.current);

    try {
      await axios.delete(`${API_URL}/stories/${currentStory._id}`, { withCredentials: true });
      
      const updatedStories = localStories.filter(s => s._id !== currentStory._id);
      setLocalStories(updatedStories);
      
      if (currentIndex >= updatedStories.length) {
        setCurrentIndex(Math.max(0, updatedStories.length - 1));
      }
    } catch (err) {
      console.error("Failed to delete story", err);
      nextStory(); // Resume
    }
  };

  return createPortal(
    <div className="story-overlay">
      <div 
        className="story-bg-blur" 
        style={{ backgroundImage: `url(${currentStory.image})` }} 
      />

      <div className="story-container">
        {/* Progress Bars */}
        <div className="story-progress-container">
          {localStories.map((_, idx) => (
            <div key={idx} className="story-progress-bar-bg">
              <div 
                className="story-progress-bar-fill"
                style={{ 
                  width: idx < currentIndex ? "100%" : idx === currentIndex ? `${progress}%` : "0%" 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="story-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={user.image || "https://via.placeholder.com/40"} alt={user.username} className="story-user-avatar" />
            <span className="story-username">{user.username}</span>
            <span className="story-time">{timeAgo(currentStory.createdAt)}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
             {/* Delete Button (Owner Only) */}
             {isOwner && (
              <button onClick={handleDelete} className="story-close-btn" title="Delete">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            )}
            <button onClick={onClose} className="story-close-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <img src={currentStory.image} alt="Story" className="story-main-image" />

        {/* Tap Zones */}
        <div className="story-tap-area left" onClick={prevStory} />
        <div className="story-tap-area right" onClick={nextStory} />
      </div>
    </div>,
    document.body
  );
}