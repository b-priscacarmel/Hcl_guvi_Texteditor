import React from 'react';

export default function UserList({ users = [], currentUser }) {
  if (users.length === 0) return null;

  return (
    <div className="user-list">
      <span className="user-list-label">Online</span>
      <div className="user-pills">
        {users.map((u) => (
          <div
            key={u.username}
            className={`user-pill ${u.username === currentUser ? 'you' : ''}`}
            title={u.username === currentUser ? `${u.username} (you)` : u.username}
          >
            <span
              className="user-avatar"
              style={{ background: u.color || '#888' }}
            >
              {u.username.charAt(0).toUpperCase()}
            </span>
            <span className="user-name">
              {u.username === currentUser ? 'You' : u.username}
            </span>
            <span className="online-dot" />
          </div>
        ))}
      </div>
    </div>
  );
}
