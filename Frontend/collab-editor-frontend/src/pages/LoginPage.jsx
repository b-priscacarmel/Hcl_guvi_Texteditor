import React, { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Please enter your name'); return; }
    if (trimmed.length < 2) { setError('Name must be at least 2 characters'); return; }
    onLogin(trimmed);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-icon-lg">✦</span>
        </div>
        <h1 className="login-title">CollabDocs</h1>
        <p className="login-subtitle">Real-time collaborative editing for teams</p>

        <div className="login-form">
          <label className="login-label">Your display name</label>
          <input
            autoFocus
            className={`login-input ${error ? 'error' : ''}`}
            placeholder="e.g. romia"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            maxLength={30}
          />
          {error && <span className="login-error">{error}</span>}
          <button className="login-btn" onClick={handleSubmit}>
            Enter Workspace →
          </button>
        </div>

        <div className="login-features">
          <div className="feature">
            <span>⚡</span> Real-time sync
          </div>
          <div className="feature">
            <span>👥</span> Live presence
          </div>
          <div className="feature">
            <span>🕓</span> Version history
          </div>
        </div>
      </div>
    </div>
  );
}
