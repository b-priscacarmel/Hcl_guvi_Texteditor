import React from 'react';

export default function Toolbar({ quillRef, onSaveVersion, isSaving, documentTitle, onTitleChange }) {
  const format = (type, value = true) => {
    const quill = quillRef?.current?.getEditor();
    if (!quill) return;
    const format = quill.getFormat();
    quill.format(type, !format[type]);
    quill.focus();
  };

  const formatAlign = (value) => {
    const quill = quillRef?.current?.getEditor();
    if (!quill) return;
    quill.format('align', value);
    quill.focus();
  };

  return (
    <div className="toolbar">
      {/* Title */}
      <input
        className="doc-title-input"
        value={documentTitle}
        onChange={(e) => onTitleChange?.(e.target.value)}
        placeholder="Untitled Document"
        spellCheck={false}
      />

      <div className="toolbar-divider" />

      {/* Text formatting */}
      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={() => format('bold')} title="Bold (Ctrl+B)">
          <b>B</b>
        </button>
        <button className="toolbar-btn italic-btn" onClick={() => format('italic')} title="Italic (Ctrl+I)">
          <i>I</i>
        </button>
        <button className="toolbar-btn underline-btn" onClick={() => format('underline')} title="Underline (Ctrl+U)">
          <u>U</u>
        </button>
        <button className="toolbar-btn strike-btn" onClick={() => format('strike')} title="Strikethrough">
          <s>S</s>
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Heading */}
      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={() => format('header', 1)} title="Heading 1">
          H1
        </button>
        <button className="toolbar-btn" onClick={() => format('header', 2)} title="Heading 2">
          H2
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Lists */}
      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={() => format('list', 'ordered')} title="Ordered List">
          ≡
        </button>
        <button className="toolbar-btn" onClick={() => format('list', 'bullet')} title="Bullet List">
          •≡
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Alignment */}
      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={() => formatAlign(false)} title="Align Left">⬛</button>
        <button className="toolbar-btn" onClick={() => formatAlign('center')} title="Center">☰</button>
        <button className="toolbar-btn" onClick={() => formatAlign('right')} title="Align Right">▰</button>
      </div>

      <div className="toolbar-spacer" />

      {/* Save Version */}
      <button
        className={`save-btn ${isSaving ? 'saving' : ''}`}
        onClick={onSaveVersion}
        disabled={isSaving}
        title="Save a version snapshot"
      >
        {isSaving ? '⏳ Saving…' : '💾 Save Version'}
      </button>
    </div>
  );
}
