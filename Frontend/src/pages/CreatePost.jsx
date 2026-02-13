import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config"; 

export default function CreatePost() {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const API_URL = config.API_URL;

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAIWrite = () => {
    if (!imageFile) return;
    setGenerating(true);
    const formData = new FormData();
    formData.append("image", imageFile);
    
    axios.post(`${API_URL}/posts/ai-caption`, formData, { withCredentials: true })
      .then(res => setCaption(res.data.caption))
      .catch(console.error)
      .finally(() => setGenerating(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("caption", caption);

    try {
      await axios.post(`${API_URL}/posts`, formData, { withCredentials: true });
      navigate("/");
    } catch (err) {
      alert("Failed to create post");
      setLoading(false);
    }
  };

  return (
    <div className="container page-enter" style={{ maxWidth: '800px' }}>
      <div className="profile-card" style={{ display: 'block' }}> {/* Reusing Glass Card */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
           <h1 style={{ margin: 0 }}>New Post</h1>
           <p className="muted">Share photos and videos with your friends.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* DRAG & DROP ZONE */}
          <div 
            className="upload-zone"
            onClick={() => !preview && fileInputRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {preview ? (
              <>
                <img src={preview} className="upload-preview" />
                <button 
                  type="button"
                  className="btn-ghost" 
                  style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: 20 }}
                  onClick={(e) => { e.stopPropagation(); setPreview(null); setImageFile(null); }}
                >
                  Change
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px', opacity: 0.5 }}>📂</div>
                <h3 style={{ margin: 0 }}>Drag & Drop</h3>
                <p className="muted">or click to upload</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} hidden onChange={(e) => handleFile(e.target.files[0])} accept="image/*" />
          </div>

          {/* CAPTION AREA */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600 }}>Caption</label>
              <button 
                type="button" 
                onClick={handleAIWrite} 
                disabled={!imageFile || generating}
                className="btn-ghost" 
                style={{ fontSize: '0.85rem' }}
              >
                {generating ? "✨ Writing..." : "✨ AI Write"}
              </button>
            </div>
            <textarea 
              className="glass-search-input" 
              rows="3" 
              placeholder="Write something..." 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{ borderRadius: '16px', resize: 'vertical', width: '100%', padding: '16px' }} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
             <button type="button" className="btn-outline" onClick={() => navigate('/')}>Cancel</button>
             <button type="submit" className="btn" disabled={loading || !imageFile}>
               {loading ? "Sharing..." : "Share Post"}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}