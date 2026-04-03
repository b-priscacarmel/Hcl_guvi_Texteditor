import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllDocuments, createDocument, deleteDocument } from '../services/api';
import { format } from 'date-fns';

export default function HomePage({ username }) {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showInput, setShowInput] = useState(false);

  const fetchDocs = async () => {
    try {
      const docs = await getAllDocuments();
      setDocuments(docs);
    } catch (e) {
      toast.error('Could not load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleCreate = async () => {
    if (!newTitle.trim()) { toast.error('Enter a title'); return; }
    setCreating(true);
    try {
      const doc = await createDocument(newTitle.trim(), username);
      toast.success('Document created!');
      navigate(`/document/${doc.id}`);
    } catch (e) {
      toast.error('Failed to create document');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this document?')) return;
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">CollabDocs</span>
        </div>
        <div className="home-user">
          <span className="user-badge">
            {username.charAt(0).toUpperCase()}
          </span>
          <span>{username}</span>
        </div>
      </header>

      <main className="home-main">
        <div className="home-hero">
          <h1>Your Documents</h1>
          <p>Real-time collaboration, instant sync, zero friction.</p>
        </div>

        {/* Create new */}
        <div className="create-section">
          {showInput ? (
            <div className="create-form">
              <input
                autoFocus
                className="create-input"
                placeholder="Document title…"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
              <button className="create-confirm-btn" onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating…' : 'Create'}
              </button>
              <button className="create-cancel-btn" onClick={() => { setShowInput(false); setNewTitle(''); }}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="new-doc-btn" onClick={() => setShowInput(true)}>
              + New Document
            </button>
          )}
        </div>

        {/* Document grid */}
        {loading ? (
          <div className="loading-screen">
            <div className="loader" />
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📄</span>
            <p>No documents yet. Create your first one!</p>
          </div>
        ) : (
          <div className="doc-grid">
            {documents.map(doc => (
              <div
                key={doc.id}
                className="doc-card"
                onClick={() => navigate(`/document/${doc.id}`)}
              >
                <div className="doc-card-icon">📝</div>
                <div className="doc-card-body">
                  <h3 className="doc-card-title">{doc.title || 'Untitled'}</h3>
                  <p className="doc-card-preview">
                    {doc.content
                      ? doc.content.replace(/<[^>]+>/g, '').slice(0, 80) + '…'
                      : 'Empty document'}
                  </p>
                  <div className="doc-card-meta">
                    <span>by {doc.createdBy}</span>
                    <span>
                      {doc.updatedAt
                        ? format(new Date(doc.updatedAt), 'MMM d, yyyy')
                        : ''}
                    </span>
                  </div>
                </div>
                <button
                  className="doc-delete-btn"
                  onClick={(e) => handleDelete(e, doc.id)}
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
