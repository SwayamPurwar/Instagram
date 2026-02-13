import React from 'react';

export default function SkeletonPost() {
  return (
    <div className="skeleton-post">
      {/* Header: Avatar + Username */}
      <div className="skeleton-header">
        <div className="skeleton-avatar shimmer" />
        <div className="skeleton-info">
          <div className="skeleton-text shimmer" style={{ width: '30%' }} />
          <div className="skeleton-text shimmer" style={{ width: '20%', height: '10px', marginTop: '4px' }} />
        </div>
      </div>

      {/* Main Content: The Image Square */}
      <div className="skeleton-image shimmer" />

      {/* Footer: Action Buttons + Caption */}
      <div className="skeleton-footer">
        <div className="skeleton-actions">
          <div className="skeleton-icon shimmer" />
          <div className="skeleton-icon shimmer" />
          <div className="skeleton-icon shimmer" />
        </div>
        <div className="skeleton-text shimmer" style={{ width: '40%', marginBottom: '8px' }} />
        <div className="skeleton-text shimmer" style={{ width: '90%' }} />
        <div className="skeleton-text shimmer" style={{ width: '70%', marginTop: '6px' }} />
      </div>
    </div>
  );
}