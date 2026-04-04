import React, { useState } from 'react';
import { format } from 'date-fns';

export default function VersionHistory({ versions = [], onClose, onRestore }) {
  const [restoring, setRestoring] = useState(null);

  const handleRestore = async (version) => {
    const confirmed = window.confirm(
      `Restore to Version ${version.versionNumber}?\n\nThis will replace the current content with the snapshot saved by "${version.savedBy}".`
    );
    if (!confirmed) return;

    setRestoring(version.id);
    try {
      await onRestore?.(version);
    } finally {
      setRestoring(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown date';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy · HH:mm');
    } catch {
      return dateStr;
    }
  };

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]+>/g, '').trim();
  };

  return (
    <div className="version-overlay" onClick={onClose}>
      <div className="version-panel" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="version-header">
          <div className="version-header-left">
            <span className="version-header-icon">🕓</span>
            <div>
              <h2 className="version-title">Revision History</h2>
              <p className="version-subtitle">
                {versions.length === 0
                  ? 'No snapshots yet'
                  : `${versions.length} version${versions.length !== 1 ? 's' : ''} saved`}
              </p>
            </div>
          </div>
          <button className="v-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Body ── */}
        <div className="version-body">
          {versions.length === 0 ? (
            <div className="version-empty">
              <span className="version-empty-icon">📄</span>
              <p>No versions saved yet.</p>
              <p className="version-empty-hint">
                Click <strong>"💾 Save Version"</strong> in the toolbar to snapshot the current state.
              </p>
            </div>
          ) : (
            <ul className="version-list">
              {versions.map((v, idx) => {
                const preview = stripHtml(v.content);
                const isLatest = idx === 0;
                const isRestoring = restoring === v.id;

                return (
                  <li key={v.id} className={`version-item ${isLatest ? 'latest' : ''}`}>
                    <div className="version-item-header">
                      <div className="version-badges">
                        <span className="version-num">v{v.versionNumber}</span>
                        {isLatest && <span className="version-latest-badge">Latest</span>}
                      </div>
                      <div className="version-item-meta">
                        <span className="version-author">
                          <span className="version-author-dot" />
                          {v.savedBy || 'unknown'}
                        </span>
                        <span className="version-date">{formatDate(v.createdAt)}</span>
                      </div>
                    </div>

                    <div className="version-preview">
                      {preview
                        ? preview.length > 150
                          ? preview.slice(0, 150) + '…'
                          : preview
                        : <em className="version-empty-content">Empty document</em>}
                    </div>

                    <div className="version-item-footer">
                      <span className="version-char-count">
                        {preview.length} characters
                      </span>
                      {onRestore && (
                        <button
                          className={`restore-btn ${isRestoring ? 'restoring' : ''}`}
                          onClick={() => handleRestore(v)}
                          disabled={!!restoring}
                        >
                          {isRestoring ? '⏳ Restoring…' : '↩ Restore this version'}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="version-footer">
          <p className="version-footer-note">
            💡 Restoring replaces the current document. Current content is not auto-saved before restore.
          </p>
          <button className="close-footer-btn" onClick={onClose}>Close</button>
        </div>
      </div>

      <style>{`
  .version-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.25);
    backdrop-filter: blur(6px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: vFadeIn 0.2s ease;
  }
  @keyframes vFadeIn { from{opacity:0} to{opacity:1} }

  .version-panel {
    background: #ffffff;
    border: 1px solid #d6dcf5;
    border-radius: 16px;
    width: min(620px, 94vw);
    max-height: 82vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 24px 80px rgba(0,0,0,0.1);
    animation: vSlideUp 0.25s ease;
    overflow: hidden;
  }

  @keyframes vSlideUp {
    from { transform:translateY(16px); opacity:0 }
    to   { transform:translateY(0);   opacity:1 }
  }

  .version-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #e4e9ff;
    flex-shrink: 0;
  }

  .version-header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .version-header-icon { font-size: 1.6rem; }

  .version-title {
    font-family: 'Inter', sans-serif;
    font-size: 1.05rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 2px;
  }

  .version-subtitle {
    font-size: 0.78rem;
    color: #64748b;
    margin: 0;
  }

  .v-close-btn {
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 1rem;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .v-close-btn:hover { background: #eef2ff; color: #2563eb; }

  .version-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .version-empty {
    text-align: center;
    padding: 56px 24px;
  }

  .version-empty-icon {
    font-size: 2.4rem;
    display: block;
    margin-bottom: 14px;
  }

  .version-empty p {
    margin: 0 0 8px;
    font-size: 0.9rem;
    color: #64748b;
  }

  .version-empty-hint {
    font-size: 0.82rem !important;
    color: #94a3b8 !important;
  }

  .version-empty strong { color: #2563eb; }

  .version-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .version-item {
    background: #ffffff;
    border: 1px solid #e4e9ff;
    border-radius: 10px;
    padding: 16px;
    transition: all 0.2s;
  }

  .version-item:hover {
    border-color: #c7d2fe;
    background: #f8faff;
  }

  .version-item.latest {
    border-color: rgba(37,99,235,0.4);
    background: #f0f6ff;
  }

  .version-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .version-badges {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .version-num {
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: #fff;
    font-size: 0.72rem;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    letter-spacing: 0.04em;
  }

  .version-latest-badge {
    background: rgba(37,99,235,0.1);
    color: #2563eb;
    border: 1px solid rgba(37,99,235,0.3);
    font-size: 0.68rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .version-item-meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .version-author {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    color: #64748b;
  }

  .version-author-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #2563eb;
    display: inline-block;
    flex-shrink: 0;
  }

  .version-date {
    font-size: 0.74rem;
    color: #94a3b8;
    font-family: 'JetBrains Mono', monospace;
  }

  .version-preview {
    font-size: 0.83rem;
    color: #475569;
    line-height: 1.55;
    background: #f1f5ff;
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 12px;
    min-height: 38px;
    word-break: break-word;
  }

  .version-empty-content {
    color: #94a3b8;
    font-style: italic;
  }

  .version-item-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .version-char-count {
    font-size: 0.72rem;
    color: #94a3b8;
    font-family: 'JetBrains Mono', monospace;
  }

  .restore-btn {
    background: #2563eb;
    border: 1px solid #2563eb;
    color: #ffffff;
    font-size: 0.8rem;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .restore-btn:hover:not(:disabled) {
    background: #3b82f6;
  }

  .restore-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .restore-btn.restoring {
    background: #e2e8f0;
    color: #64748b;
    border-color: #cbd5e1;
  }

  .version-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    border-top: 1px solid #e4e9ff;
    flex-shrink: 0;
    gap: 16px;
  }

  .version-footer-note {
    font-size: 0.74rem;
    color: #94a3b8;
    margin: 0;
    line-height: 1.4;
  }

  .close-footer-btn {
    background: #f1f5ff;
    border: 1px solid #d6dcf5;
    color: #2563eb;
    font-size: 0.85rem;
    padding: 8px 20px;
    border-radius: 8px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .close-footer-btn:hover {
    background: #e6ebff;
  }
`}</style>
`
    </div>
  );
}
