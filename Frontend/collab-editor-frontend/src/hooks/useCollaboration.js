import { useEffect, useRef, useCallback, useState } from 'react';
import {
  connectWebSocket,
  sendEdit,
  sendPresence,
  sendCursor,
  disconnectWebSocket,
} from '../services/websocket';
import { debounce, throttle } from '../utils/debounce';

/**
 * useCollaboration
 *
 * Manages WebSocket lifecycle, presence, and cursor broadcasting
 * for a collaborative document session.
 */
export function useCollaboration({
  documentId,
  username,
  onRemoteEdit,
  onPresenceUpdate,
  onCursorUpdate,
}) {
  const [connected, setConnected] = useState(false);
  // Flag to skip re-broadcasting a remote edit back to the server
  const ignoreNextEditRef = useRef(false);

  // Debounced edit broadcaster (300ms) — avoids flooding on every keystroke
  const debouncedSendEdit = useRef(
    debounce((docId, content, user) => sendEdit(docId, content, user), 300)
  ).current;

  // Throttled cursor broadcaster (80ms)
  const throttledSendCursor = useRef(
    throttle((docId, user, pos) => sendCursor(docId, user, pos), 80)
  ).current;

  useEffect(() => {
    if (!documentId || !username) return;

    connectWebSocket({
      documentId,
      onEdit: (msg) => {
        // Don't apply our own edits echoed back
        if (msg.user !== username) {
          ignoreNextEditRef.current = true;
          onRemoteEdit?.(msg);
        }
      },
      onPresence: (msg) => {
        onPresenceUpdate?.(msg);
      },
      onCursor: (msg) => {
        if (msg.user !== username) {
          onCursorUpdate?.(msg);
        }
      },
      onConnect: () => {
        setConnected(true);
        // Announce arrival
        sendPresence(documentId, username, 'JOINED');
      },
      onDisconnect: () => {
        setConnected(false);
      },
    });

    // Cleanup: announce departure and close socket
    return () => {
      sendPresence(documentId, username, 'LEFT');
      debouncedSendEdit.cancel?.();
      disconnectWebSocket();
      setConnected(false);
    };
  }, [documentId, username]);

  const broadcastEdit = useCallback(
    (content) => {
      if (ignoreNextEditRef.current) {
        ignoreNextEditRef.current = false;
        return; // skip broadcasting a remote-sourced change
      }
      debouncedSendEdit(documentId, content, username);
    },
    [documentId, username, debouncedSendEdit]
  );

  const broadcastCursor = useCallback(
    (position) => {
      throttledSendCursor(documentId, username, position);
    },
    [documentId, username, throttledSendCursor]
  );

  return { broadcastEdit, broadcastCursor, connected, ignoreNextEditRef };
}
