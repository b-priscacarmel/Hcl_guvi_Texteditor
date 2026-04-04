import React, { useEffect, useRef } from 'react';

/**
 * CursorLayer
 *
 * 1. Renders a floating badge bar above the editor showing each remote
 *    user's name, colour, and character position.
 * 2. Injects a real blinking caret + name label directly inside the
 *    Quill editor DOM at the correct character offset.
 *
 * Props:
 *   cursors    — map: username → { color, position }
 *   currentUser — string, own username (filtered out)
 *   quillRef   — ref to the ReactQuill instance
 */
export default function CursorLayer({ cursors = {}, currentUser, quillRef }) {
  const entries = Object.entries(cursors).filter(
    ([user, info]) => user !== currentUser && info.position !== undefined
  );

  // ── Inject real carets into Quill DOM ──────────────────────────
  useEffect(() => {
    const quill = quillRef?.current?.getEditor?.();
    if (!quill) return;

    // Remove all previously injected cursor elements
    quill.container
      .querySelectorAll('.remote-cursor-caret, .remote-cursor-label')
      .forEach((el) => el.remove());

    entries.forEach(([user, info]) => {
      try {
        const pos = info.position;
        if (pos == null || pos < 0) return;

        // getBounds gives pixel coords of the character at `pos`
        const bounds = quill.getBounds(pos);
        if (!bounds) return;

        const editorEl = quill.container.querySelector('.ql-editor');
        if (!editorEl) return;

        // ── Caret line ──
        const caret = document.createElement('span');
        caret.className = 'remote-cursor-caret';
        caret.style.cssText = `
          position: absolute;
          left: ${bounds.left}px;
          top: ${bounds.top}px;
          width: 2px;
          height: ${bounds.height || 20}px;
          background: ${info.color};
          border-radius: 1px;
          pointer-events: none;
          z-index: 10;
          animation: remoteBlink 1.2s ease-in-out infinite;
        `;

        // ── Name label above caret ──
        const label = document.createElement('span');
        label.className = 'remote-cursor-label';
        label.textContent = user;
        label.style.cssText = `
          position: absolute;
          left: ${bounds.left}px;
          top: ${bounds.top - 20}px;
          background: ${info.color};
          color: #fff;
          font-size: 11px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 4px 4px 4px 0;
          pointer-events: none;
          z-index: 11;
          white-space: nowrap;
          line-height: 18px;
        `;

        // Quill container must be position:relative for absolute children
        quill.container.style.position = 'relative';
        quill.container.appendChild(caret);
        quill.container.appendChild(label);
      } catch (_) {
        // getBounds can throw if position is out of range — safe to ignore
      }
    });

    // Inject the blink keyframe once
    if (!document.getElementById('remote-cursor-style')) {
      const style = document.createElement('style');
      style.id = 'remote-cursor-style';
      style.textContent = `
        @keyframes remoteBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }, [cursors, quillRef, entries]);

  // ── Badge bar ─────────────────────────────────────────────────
  if (entries.length === 0) return null;

  return (
    <div className="cursor-layer">
      {entries.map(([user, info]) => (
        <div
          key={user}
          className="cursor-badge"
          style={{
            borderColor: info.color,
            background: `${info.color}18`,
          }}
        >
          {/* Blinking caret icon */}
          <span
            className="cursor-caret"
            style={{ background: info.color }}
          />

          {/* Avatar circle */}
          <span
            className="cursor-avatar"
            style={{ background: info.color }}
          >
            {user.charAt(0).toUpperCase()}
          </span>

          {/* Username */}
          <span className="cursor-username" style={{ color: info.color }}>
            {user}
          </span>

          {/* Character position */}
          <span className="cursor-pos-pill">
            col {info.position}
          </span>
        </div>
      ))}
    </div>
  );
}
