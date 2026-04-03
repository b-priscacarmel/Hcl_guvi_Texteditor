// src/yjs/yjsConfig.js
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

let ydoc = null;
let provider = null;

export function initYjs(documentId, username) {
  // Create a new Yjs document
  ydoc = new Y.Doc();

  // Connect to your Spring Boot WebSocket backend
  // Note: y-websocket needs its own WS server — use the awareness API only,
  // and sync content via your existing STOMP /app/edit channel.
  // For a 1-day build, yjsConfig.js acts as the in-memory CRDT layer.

  const yText = ydoc.getText('content');

  return { ydoc, yText };
}

export function getYDoc() {
  return ydoc;
}

export function destroyYjs() {
  provider?.destroy();
  ydoc?.destroy();
  ydoc = null;
  provider = null;
}

// Convert Yjs delta to plain string (for sending over STOMP)
export function yTextToString(yText) {
  return yText.toString();
}