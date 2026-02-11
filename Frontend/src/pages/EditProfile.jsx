import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config"; // <--- IMPORT CONFIG
export default function EditProfile() {
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [username, setUsername] = useState(""); // Display only
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
// FIX: Use config
  const API_URL = config.API_URL;
  // Load current user data
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

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("bio", bio);
    // Only append image if a new one was selected
    if (imageFile) {
      formData.append("image", imageFile);
    }

    // Use API_URL
    axios
      .put(`${API_URL}/users/update`, formData, { withCredentials: true })
      .then((res) => {
        // Update local storage with new user data (including new image URL)
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/profile");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to update profile");
      })
      .finally(() => setLoading(false));
  }

  // ... (Render code remains the same)

  return (
    <div className="container">
      <div
        className="card"
        style={{ maxWidth: "600px", margin: "20px auto", padding: "30px" }}
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* Header / Photo Change Section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "10px",
            }}
          >
            <div
              onClick={() => fileInputRef.current.click()}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                overflow: "hidden",
                cursor: "pointer",
                border: "1px solid var(--border)",
              }}
            >
              <img
                src={preview || "https://via.placeholder.com/150"}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <div style={{ fontSize: "1.1rem", lineHeight: "1.2" }}>
                {username}
              </div>
              <button
                type="button"
                className="btn-ghost"
                style={{
                  color: "var(--primary)",
                  padding: 0,
                  fontWeight: "600",
                  fontSize: "0.9rem",
                }}
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

          {/* Bio Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontWeight: "600", fontSize: "0.95rem" }}>
              Bio
            </label>
            <textarea
              className="input"
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Bio"
              maxLength={150}
              style={{ resize: "vertical", fontFamily: "inherit" }}
            />
            <div
              className="muted"
              style={{ textAlign: "right", fontSize: "0.75rem" }}
            >
              {bio.length} / 150
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginTop: "10px" }}>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Saving..." : "Submit"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate("/profile")}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
