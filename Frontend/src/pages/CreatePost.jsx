import { useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mentions, setMentions] = useState("");
  const [caption, setCaption] = useState(""); 
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false); // State for AI loading
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const API_URL = "http://localhost:3000";

  const loadFile = (file) => {
    if (!file) return;
    setImageFile(file || null);
    setError("");
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    loadFile(file);
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) loadFile(file);
  }, []);

  function triggerFileDialog() {
    fileInputRef.current?.click();
  }

  // --- FUNCTION: Generate Caption ---
  function handleGenerateCaption() {
    if (!imageFile) {
      setError("Please upload an image first to generate a caption.");
      return;
    }
    setGenerating(true);
    
    const formData = new FormData();
    formData.append("image", imageFile);

    axios.post(`${API_URL}/posts/ai-caption`, formData, { withCredentials: true })
      .then(res => {
        setCaption(res.data.caption);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to generate caption.");
      })
      .finally(() => setGenerating(false));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!imageFile) return;

    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("mentions", mentions);
    formData.append("caption", caption); 

    axios
      .post(`${API_URL}/posts`, formData, { withCredentials: true })
      .then((response) => {
        console.log("Post created:", response.data);
        navigate("/");
      })
      .catch((err) => {
        console.error("Post failed:", err);
        setSubmitting(false);
        setError(
          err.response?.data?.message ||
            "Failed to create post. Check your backend console."
        );
      });
  }

  return (
    <div className="container" style={{ paddingTop: "32px", paddingBottom: "64px" }}>
      <div className="card" style={{ maxWidth: 760, margin: "0 auto", padding: '24px' }}>
        <div className="form-header" style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0 }}>Create a new post</h1>
          <p className="muted" style={{ marginTop: 4 }}>Share a moment.</p>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.9rem" }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form className="form" onSubmit={handleSubmit} onDragEnter={handleDrag} noValidate>
          {/* Image Upload Area with Optimized UI */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label="Upload image"
            onClick={triggerFileDialog}
            style={{
              border: dragActive ? "2px solid var(--primary)" : "2px dashed var(--border)",
              padding: 0,
              borderRadius: 12,
              position: "relative",
              background: dragActive ? "rgba(0,149,246,0.05)" : "var(--bg)",
              cursor: "pointer",
              minHeight: imagePreview ? "auto" : 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              transition: "all 0.2s ease"
            }}
          >
            <input ref={fileInputRef} id="image" name="image" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} required />
            
            {!imagePreview && (
              <div style={{ textAlign: "center", padding: "32px 24px", display: "grid", gap: 12 }}>
                <svg width="64" height="64" viewBox="0 0 24 24" stroke="var(--muted)" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Drag photos here</div>
                  <div className="muted" style={{ fontSize: ".85rem", marginTop: 4 }}>or click to upload</div>
                </div>
              </div>
            )}
            
            {imagePreview && (
              <div style={{ width: "100%", position: "relative" }}>
                <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", aspectRatio: "4/5" }} />
                <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8 }}>
                  <button type="button" className="btn-ghost" style={{ background: "rgba(0,0,0,.6)", color: "#fff", backdropFilter: 'blur(4px)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.85rem' }} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Change</button>
                  <button type="button" className="btn-ghost" style={{ background: "rgba(0,0,0,.6)", color: "#fff", backdropFilter: 'blur(4px)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.85rem' }} onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}>Remove</button>
                </div>
              </div>
            )}
          </div>

          {/* Caption Input Field with AI Button */}
          <div className="field" style={{ marginTop: 24 }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
              <label htmlFor="caption" style={{margin: 0}}>Caption</label>
              <button 
                type="button" 
                onClick={handleGenerateCaption}
                disabled={generating || !imageFile}
                className="btn-ghost"
                style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  padding: '4px 8px'
                }}
              >
                {generating ? (
                  <>⏳ Generating...</>
                ) : (
                  <>✨ AI Write</>
                )}
              </button>
            </div>
            <textarea
              id="caption"
              name="caption"
              rows="3"
              placeholder="Write a caption..."
              className="input"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{ resize: "vertical", fontFamily: "inherit", lineHeight: '1.5' }}
            />
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label htmlFor="mentions">Mentions</label>
            <input id="mentions" name="mentions" type="text" placeholder="@alice, @bob" className="input" value={mentions} onChange={(e) => setMentions(e.target.value)} />
            <p className="muted" style={{ margin: "6px 0 0", fontSize: ".75rem" }}>Separate usernames with commas.</p>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            <button type="submit" disabled={!imageFile || submitting} className="btn">
              {submitting ? "Posting…" : "Post"}
            </button>
            <button type="button" className="btn-outline" onClick={() => { setImageFile(null); setImagePreview(null); setMentions(""); setCaption(""); }} disabled={submitting}>
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}