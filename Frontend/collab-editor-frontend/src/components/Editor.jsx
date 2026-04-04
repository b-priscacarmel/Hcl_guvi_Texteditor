import React, { useEffect, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useCollaboration } from '../hooks/useCollaboration';
import { debounce } from '../utils/debounce';
import CursorLayer from './CursorLayer';

const QUILL_MODULES = {
  toolbar: false,
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
  quillRef,
  cursors,
  setCursors,
  setUsers,
}) {
  const contentRef = useRef(initialContent || '');
  const isRemoteEdit = useRef(false);
  const initialSet = useRef(false);

  // Auto-save to parent (debounced)
  const debouncedParentUpdate = useRef(
    debounce((content) => onContentChange?.(content), 800)
  ).current;

  // ── Helper: set HTML content directly into Quill ──────────────
  const setQuillContent = useCallback((html) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    quill.clipboard.dangerouslyPasteHTML(html || '', 'silent');
    contentRef.current = html || '';
  }, [quillRef]);

  // ── Set initial content once Quill mounts ─────────────────────
  useEffect(() => {
    if (!initialContent || initialSet.current) return;
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    setQuillContent(initialContent);
    initialSet.current = true;
  }, [initialContent, quillRef, setQuillContent]);

  // ── Expose helpers on quillRef so DocumentPage & Toolbar can use them ──
  // quillRef.current.setEditorContent(html) → for version restore
  // quillRef.current.broadcastFormat(...)   → for toolbar sync
  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.setEditorContent = setQuillContent;
    }
  }, [quillRef, setQuillContent]);

  // ── Remote text edits ─────────────────────────────────────────
  const handleRemoteEdit = useCallback((msg) => {
    if (!msg.content) return;
    if (msg.content === contentRef.current) return;

    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const selection = quill.getSelection();
    isRemoteEdit.current = true;
    quill.clipboard.dangerouslyPasteHTML(msg.content, 'silent');
    contentRef.current = msg.content;
    isRemoteEdit.current = false;

    if (selection) {
      try { quill.setSelection(selection, 'silent'); } catch (_) {}
    }
  }, [quillRef]);

  const handlePresenceUpdate = useCallback((msg) => {
    if (!msg.activeUsers) return;
    setUsers(msg.activeUsers);
  }, [setUsers]);

  const handleCursorUpdate = useCallback((msg) => {
    if (!msg.user) return;
    setCursors(prev => ({
      ...prev,
      [msg.user]: {
        color: msg.color || '#888',
        position: msg.position,
      },
    }));
  }, [setCursors]);

  // ── Remote format changes ─────────────────────────────────────
  const handleFormatUpdate = useCallback((msg) => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !msg) return;
    if (msg.range) quill.setSelection(msg.range.index, msg.range.length, 'silent');
    quill.format(msg.type, msg.value, 'silent');
  }, [quillRef]);

  const { broadcastEdit, broadcastCursor, broadcastFormat, connected } = useCollaboration({
    documentId,
    username,
    onRemoteEdit: handleRemoteEdit,
    onPresenceUpdate: handlePresenceUpdate,
    onCursorUpdate: handleCursorUpdate,
    onFormatUpdate: handleFormatUpdate,
  });

  // Expose broadcastFormat on quillRef so Toolbar can access it
  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.broadcastFormat = broadcastFormat;
    }
  }, [broadcastFormat]);

  // ── Local typing ──────────────────────────────────────────────
  const handleChange = useCallback((value, delta, source) => {
    if (source !== 'user' || isRemoteEdit.current) return;

    // Skip format-only deltas (bold/italic/align) — handled by broadcastFormat
    const isFormatOnly =
      delta?.ops?.length > 0 &&
      delta.ops.every(op => op.retain !== undefined) &&
      delta.ops.some(op => op.attributes !== undefined);

    if (isFormatOnly) return;

    contentRef.current = value;
    broadcastEdit(value);
    debouncedParentUpdate(value);
  }, [broadcastEdit, debouncedParentUpdate]);

  // ── Cursor tracking ───────────────────────────────────────────
  const handleSelectionChange = useCallback((range) => {
    if (range) broadcastCursor(range.index);
  }, [broadcastCursor]);

  return (
    <div className="editor-wrapper">
      <div className={`connection-status ${connected ? 'online' : 'offline'}`}>
        <span className="status-dot" />
        {connected ? 'Live' : 'Reconnecting…'}
      </div>

      <CursorLayer
        cursors={cursors}
        currentUser={username}
        quillRef={quillRef}
      />

      {/* No value prop — uncontrolled Quill so React never resets formatting */}
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
