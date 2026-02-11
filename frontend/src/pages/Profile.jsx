import React from 'react';
import '../css/Profile.css';

export default function Profile({ user }) {
  if (!user) {
    return (
      <div className="profile-container">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'U';
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {getInitials(user.name)}
        </div>
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      <div className="profile-details">
        <div className="detail-item">
          <span className="detail-label">User ID</span>
          <span className="detail-value">#{user.id}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Member Since</span>
          <span className="detail-value">
            {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>
      
      {/* 
      <div className="profile-actions">
         Placeholder for future edit functionality 
        <button className="btn-edit">Edit Profile</button>
      </div>
      */}
    </div>
  );
}
