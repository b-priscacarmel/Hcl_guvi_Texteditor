import React from 'react';

/**
 * CursorLayer renders coloured remote-user cursor labels
 * overlaid on top of the editor.
 *
 * `cursors` is a map: username → { color, position }
 * `editorRef` is the container element reference for positioning.
 *
 * Because Quill manages its own DOM, we display cursor labels as
 * floating badges in a top bar (simpler, reliable cross-browser).
 */
export default function CursorLayer({ cursors = {}, currentUser }) {
  const entries = Object.entries(cursors).filter(([user]) => user !== currentUser);

  if (entries.length === 0) return null;

  return (
    <div className="cursor-layer">
      {entries.map(([user, info]) => (
        <div
          key={user}
          className="cursor-badge"
          style={{ borderColor: info.color, background: `${info.color}22` }}
        >
          <span
            className="cursor-caret"
            style={{ background: info.color }}
          />
          <span className="cursor-username" style={{ color: info.color }}>
            {user}
          </span>
          {info.position !== undefined && (
            <span className="cursor-pos">@{info.position}</span>
          )}
        </div>
      ))}
    </div>
  );
}
