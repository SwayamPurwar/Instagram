import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import config from "../config"; 

export default function EditProfile() {
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const API_URL = config.API_URL;

  // Load current user data on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setBio(user.bio || "");
      setPreview(user.image);
      setUsername(user.username);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Handle file selection & local preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        addToast("Please select an image file", "error");
        return;
      }
      // Validate size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        addToast("Image must be smaller than 5MB", "error");
        return;
      }

      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("bio", bio);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await axios.put(`${API_URL}/users/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      // Update Local Storage with new user data
      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      addToast("Profile updated successfully", "success");
      
      // Force a small delay then redirect to ensure UI updates
      setTimeout(() => {
        // Dispatch a custom event so Navbar updates automatically without reload
        window.dispatchEvent(new Event("storage")); 
        navigate(`/profile/${updatedUser._id}`);
      }, 500);

    } catch (err) {
      console.error(err);
      addToast("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-enter" style={{ paddingTop: "20px" }}>
      <div className="card" style={{ maxWidth: "600px", margin: "0 auto", padding: "30px" }}>
        
        <h2 style={{ marginBottom: "20px", fontSize: "1.5rem" }}>Edit Profile</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* 1. Profile Photo Section */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", background: "var(--bg-secondary)", padding: "16px", borderRadius: "12px" }}>
            <div 
              onClick={() => fileInputRef.current.click()}
              style={{ 
                width: "60px", height: "60px", borderRadius: "50%", overflow: "hidden", 
                cursor: "pointer", border: "2px solid var(--primary)", flexShrink: 0
              }}
            >
              <img 
                src={preview || "https://via.placeholder.com/150"} 
                alt="Preview" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>{username}</div>
              <button 
                type="button" 
                className="btn-ghost" 
                style={{ color: "var(--primary)", padding: "4px 0", fontSize: "0.9rem", fontWeight: "600" }}
                onClick={() => fileInputRef.current.click()}
              >
                Change Profile Photo
              </button>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              style={{ display: "none" }} 
              accept="image/*" 
            />
          </div>

          {/* 2. Bio Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontWeight: "600", fontSize: "0.95rem" }}>Bio</label>
            <textarea
              className="glass-search-input" // Re-using your input style
              rows="4"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write something about yourself..."
              maxLength={150}
              style={{ width: "100%", borderRadius: "8px", padding: "12px", fontSize: "0.95rem" }}
            />
            <div className="muted" style={{ textAlign: "right", fontSize: "0.8rem" }}>
              {bio.length} / 150
            </div>
          </div>

          {/* 3. Actions */}
          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button 
              type="submit" 
              className="btn" 
              disabled={loading}
              style={{ flex: 1, justifyContent: "center" }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button 
              type="button" 
              className="btn-ghost" 
              onClick={() => navigate(-1)}
              style={{ padding: "0 20px", border: "1px solid var(--border)", borderRadius: "8px" }}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}