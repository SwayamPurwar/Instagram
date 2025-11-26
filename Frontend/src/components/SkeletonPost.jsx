import React from "react";

export default function SkeletonPost() {
  return (
    <div className="card skeleton-card">
      {/* Header */}
      <div style={{ padding: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "50%" }}></div>
        <div className="skeleton" style={{ width: 120, height: 14 }}></div>
      </div>

      {/* Image Placeholder */}
      <div className="skeleton" style={{ width: "100%", aspectRatio: "4/5" }}></div>

      {/* Footer Actions */}
      <div style={{ padding: "12px" }}>
        <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
          <div className="skeleton" style={{ width: 24, height: 24 }}></div>
          <div className="skeleton" style={{ width: 24, height: 24 }}></div>
          <div className="skeleton" style={{ width: 24, height: 24 }}></div>
        </div>
        <div className="skeleton" style={{ width: "60%", height: 14 }}></div>
      </div>
    </div>
  );
}