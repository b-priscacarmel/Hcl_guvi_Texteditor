import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Editor from '../components/Editor';
import Toolbar from '../components/Toolbar';
import UserList from '../components/UserList';
import VersionHistory from '../components/VersionHistory';
import { getDocument, updateDocument, saveVersion, getVersions } from '../services/api';
import { debounce } from '../utils/debounce';

export default function DocumentPage({ username }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);

  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [users, setUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);

  // Load document on mount
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    getDocument(id)
      .then((doc) => {
        setDocument(doc);
        setTitle(doc.title || 'Untitled');
        setContent(doc.content || '');
      })
      .catch(() => {
        toast.error('Document not found');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Auto-save content to DB (debounced 2s)
  const autoSave = useRef(
    debounce(async (docId, newContent, currentTitle, user) => {
      try {
        await updateDocument(docId, {
          content: newContent,
          title: currentTitle,
          updatedBy: user,
        });
        setLastSaved(new Date());
      } catch (e) {
        console.error('Auto-save failed', e);
      }
    }, 2000)
  ).current;

  const handleContentChange = useCallback(
    (newContent) => {
      setContent(newContent);
      autoSave(id, newContent, title, username);
    },
    [id, title, username, autoSave]
  );

  // Debounced title save
  const handleTitleChange = useCallback(
    debounce(async (newTitle) => {
      try {
        await updateDocument(id, {
          title: newTitle,
          updatedBy: username,
        });
      } catch (e) {
        console.error('Title save failed', e);
      }
    }, 1000),
    [id, username]
  );

  const onTitleChange = (val) => {
    setTitle(val);
    handleTitleChange(val);
  };

  // Manual version save — reads content directly from Quill editor
  const handleSaveVersion = async () => {
    setIsSaving(true);
    try {
      const quill = quillRef.current?.getEditor();
      const latestContent = quill ? quill.root.innerHTML : content;

      await updateDocument(id, {
        content: latestContent,
        title,
        updatedBy: username,
      });

      await saveVersion(id, username);
      toast.success('Version saved! 🎉');
      setLastSaved(new Date());
    } catch (e) {
      toast.error('Failed to save version');
    } finally {
      setIsSaving(false);
    }
  };

  // Load and show version history
  const handleShowHistory = async () => {
    try {
      const res = await getVersions(id);
      console.log("VERSIONS RESPONSE:", res);

      let data = [];
      if (Array.isArray(res)) {
        data = res;
      } else if (Array.isArray(res?.content)) {
        data = res.content;
      } else if (Array.isArray(res?.data)) {
        data = res.data;
      }

      const safeVersions = data.map((v) => {
        const { document: _circular, ...version } = v || {};
        return version;
      });

      console.log("SAFE VERSIONS:", safeVersions);
      setVersions(safeVersions);
      setShowHistory(true);
    } catch (e) {
      console.error('getVersions error:', e);
      toast.error('Could not load history');
    }
  };

  // Restore a version — set content directly into Quill via exposed helper
  const handleRestore = async (version) => {
    const confirmed = window.confirm(`Restore to v${version.versionNumber}?`);
    if (!confirmed) return;

    try {
      await updateDocument(id, {
        content: version.content,
        updatedBy: username,
      });

      // Bypass React state — set HTML directly into Quill
      if (quillRef.current?.setEditorContent) {
        quillRef.current.setEditorContent(version.content);
      }

      setContent(version.content);
      setShowHistory(false);
      toast.success(`Restored to v${version.versionNumber}`);
    } catch (e) {
      toast.error('Restore failed');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader" />
        <p>Loading document…</p>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <header className="doc-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Docs
        </button>

        <Toolbar
          quillRef={quillRef}
          documentTitle={title}
          onTitleChange={onTitleChange}
          onSaveVersion={handleSaveVersion}
          isSaving={isSaving}
        />

        <div className="header-right">
          {lastSaved && (
            <span className="last-saved">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}

          <button className="history-btn" onClick={handleShowHistory}>
            🕓 History
          </button>

          <UserList users={users} currentUser={username} />
        </div>
      </header>

      <main className="doc-main">
        <Editor
          key={id}
          documentId={id}
          username={username}
          initialContent={content}
          onContentChange={handleContentChange}
          quillRef={quillRef}
          cursors={cursors}
          setCursors={setCursors}
          setUsers={setUsers}
        />
      </main>

      {showHistory && (
        <VersionHistory
          versions={versions}
          onClose={() => setShowHistory(false)}
          onRestore={handleRestore}
        />
      )}
    </div>
  );
}
