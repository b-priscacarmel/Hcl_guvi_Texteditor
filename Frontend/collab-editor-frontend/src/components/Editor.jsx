import React, { useEffect, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useCollaboration } from '../hooks/useCollaboration';
import { debounce } from '../utils/debounce';
import CursorLayer from './CursorLayer';

const QUILL_MODULES = {
  toolbar: false, // We use our own Toolbar component
  history: {
    delay: 1000,
    maxStack: 100,
    userOnly: true,
  },
};

const QUILL_FORMATS = [
  'bold', 'italic', 'underline', 'strike',
  'header', 'list', 'align',
  'color', 'background',
  'link', 'blockquote', 'code-block',
];

export default function Editor({
  documentId,
  username,
  initialContent,
  onContentChange,
  cursors,
  setCursors,
  setUsers,
}) {
  const quillRef = useRef(null);
  const contentRef = useRef(initialContent || '');
  const isRemoteEdit = useRef(false);

  // Auto-save to parent debounced
  const debouncedParentUpdate = useRef(
    debounce((content) => onContentChange?.(content), 800)
  ).current;

  const handleRemoteEdit = useCallback((msg) => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !msg.content) return;

    const selection = quill.getSelection();
    isRemoteEdit.current = true;

    // Simple OT: last-write-wins on full content
    // (For production: use Yjs CRDT or full OT deltas)
    if (quill.root.innerHTML !== msg.content) {
      quill.root.innerHTML = msg.content;
      contentRef.current = msg.content;
    }

    isRemoteEdit.current = false;

    // Restore cursor position after remote update
    if (selection) {
      try { quill.setSelection(selection); } catch (_) {}
    }
  }, []);

  const handlePresenceUpdate = useCallback((msg) => {
    if (!msg.activeUsers) return;
    setUsers(msg.activeUsers);
  }, [setUsers]);

  const handleCursorUpdate = useCallback((msg) => {
    if (!msg.user) return;
    setCursors(prev => ({
      ...prev,
      [msg.user]: { color: msg.color || '#888', position: msg.position },
    }));
  }, [setCursors]);

  const { broadcastEdit, broadcastCursor, connected } = useCollaboration({
    documentId,
    username,
    onRemoteEdit: handleRemoteEdit,
    onPresenceUpdate: handlePresenceUpdate,
    onCursorUpdate: handleCursorUpdate,
  });

  // Set initial content once quill mounts
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (quill && initialContent) {
      quill.root.innerHTML = initialContent;
      contentRef.current = initialContent;
    }
  }, [initialContent]);

  const handleChange = useCallback((value, delta, source) => {
    if (source !== 'user' || isRemoteEdit.current) return;
    contentRef.current = value;
    broadcastEdit(value);
    debouncedParentUpdate(value);
  }, [broadcastEdit, debouncedParentUpdate]);

  const handleSelectionChange = useCallback((range) => {
    if (range) {
      broadcastCursor(range.index);
    }
  }, [broadcastCursor]);

  return (
    <div className="editor-wrapper">
      {/* Connection status indicator */}
      <div className={`connection-status ${connected ? 'online' : 'offline'}`}>
        <span className="status-dot" />
        {connected ? 'Live' : 'Reconnecting…'}
      </div>

      {/* Remote cursors overlay */}
      <CursorLayer cursors={cursors} currentUser={username} />

      <ReactQuill
        ref={quillRef}
        theme="snow"
        modules={QUILL_MODULES}
        formats={QUILL_FORMATS}
        onChange={handleChange}
        onChangeSelection={handleSelectionChange}
        placeholder="Start typing… your changes sync in real time."
        className="quill-editor"
      />
    </div>
  );
}
