import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios"; // <--- Import axios
import { useToast } from "../context/ToastContext.jsx"; // <--- Import toast
import config from "../config";
export default function StoryViewer({ stories, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // --- Reply State ---
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const currentStory = stories[currentIndex];
  const DURATION = 5000; 
  const API_URL = config.API_URL;
  
  let addToast = (msg) => console.log(msg);
  try { const toast = useToast(); if (toast) addToast = toast.addToast; } catch (e) {}

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      // Only nav if not typing
      if (document.activeElement.tagName !== "INPUT") {
        if (e.key === "ArrowRight") handleNext();
        if (e.key === "ArrowLeft") handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  // Animation Loop
  useEffect(() => {
    if (isPaused) return;
    
    const startTime = Date.now() - (progress / 100) * DURATION;
    let animationFrameId;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const percent = (elapsed / DURATION) * 100;
      
      if (percent >= 100) {
        handleNext();
      } else {
        setProgress(percent);
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [currentIndex, isPaused]);

  function handleNext() {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      setReplyText(""); // Clear input on slide change
    } else {
      onClose(); 
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
      setReplyText("");
    } else {
      setProgress(0); 
    }
  }

  function handleTap(e) {
    if (e.target.closest('.no-nav')) return; // Ignore clicks on controls
    const width = window.innerWidth;
    const x = e.clientX;
    if (x < width * 0.3) handlePrev();
    else handleNext();
  }

  // --- SEND FUNCTION ---
  function handleSendReply(e) {
    e?.preventDefault();
    if (!replyText.trim() || sending) return;

    setSending(true);
    setIsPaused(true); // Pause story while sending

    axios.post(`${API_URL}/chat/message`, {
      receiverId: currentStory.user._id,
      message: `Replying to story: ${replyText}`
    }, { withCredentials: true })
    .then(() => {
      addToast("Reply sent!", "success");
      setReplyText("");
      setIsPaused(false); // Resume
    })
    .catch((err) => {
      console.error(err);
      addToast("Failed to send reply", "error");
      setIsPaused(false);
    })
    .finally(() => setSending(false));
  }

  // Quick Reaction
  function handleReaction(emoji) {
    setReplyText(prev => prev + emoji);
  }

  if (!currentStory) return null;

  return createPortal(
    <div className="story-modal-enter"
      style={{
        position: "fixed", inset: 0, zIndex: 99999, background: "#000",
        display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none'
      }}
      onClick={handleTap}
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* 1. IMAGE LAYER */}
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <img 
          src={currentStory.image} 
          alt="Story"
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} 
        />
        {/* Vignettes */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '150px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', pointerEvents: 'none' }} />
      </div>

      {/* 2. CONTROLS LAYER */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
        
        {/* Header */}
        <div style={{ padding: '12px 10px' }}>
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px", pointerEvents: 'auto' }}>
            {stories.map((_, idx) => (
              <div key={idx} style={{ flex: 1, height: "3px", background: "rgba(255,255,255,0.3)", borderRadius: "2px", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
                <div style={{
                    height: "100%", background: "#fff",
                    width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? "100%" : "0%",
                    transition: idx === currentIndex ? "none" : "width 0.1s linear",
                    boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)"
                  }}
                />
              </div>
            ))}
          </div>

          <div className="no-nav" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", pointerEvents: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img src={currentStory.user?.image || "https://via.placeholder.com/32"} style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.8)", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", textShadow: "0 1px 3px rgba(0,0,0,0.5)", lineHeight: 1 }}>{currentStory.user?.username}</span>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.75rem", marginTop: '4px' }}>2h ago</span>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ background: "rgba(255, 255, 255, 0.2)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
          </div>
        </div>

        {/* Footer (Working Input) */}
        <div className="no-nav" style={{ padding: '20px', pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <form onSubmit={handleSendReply} style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              placeholder={`Reply to ${currentStory.user?.username}...`}
              style={{ 
                width: '100%', height: '48px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.5)', 
                padding: '0 20px', color: 'white', fontSize: '0.95rem', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', outline: 'none'
              }}
            />
            {replyText && (
                <button type="submit" disabled={sending} style={{ position: 'absolute', right: '6px', top: '4px', height: '40px', padding: '0 16px', borderRadius: '20px', border: 'none', background: 'white', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
                    {sending ? '...' : 'Send'}
                </button>
            )}
          </form>
          
          <button onClick={() => handleReaction("❤️")} style={{ background: 'transparent', border: 'none', fontSize: '28px', cursor: 'pointer', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', transition: 'transform 0.1s' }} className="btn-reaction">❤️</button>
          <button onClick={() => handleReaction("🔥")} style={{ background: 'transparent', border: 'none', fontSize: '28px', cursor: 'pointer', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} className="btn-reaction">🔥</button>
        </div>

      </div>
    </div>,
    document.body 
  );
}