import { useEffect, useRef, useCallback, useState } from 'react';
import {
  connectWebSocket,
  sendEdit,
  sendPresence,
  sendCursor,
  sendFormat,             // ✅ NEW
  disconnectWebSocket,
} from '../services/websocket';
import { debounce, throttle } from '../utils/debounce';

export function useCollaboration({
  documentId,
  username,
  onRemoteEdit,
  onPresenceUpdate,
  onCursorUpdate,
  onFormatUpdate,         // ✅ NEW
}) {
  const [connected, setConnected] = useState(false);
  const ignoreNextEditRef = useRef(false);

  const debouncedSendEdit = useRef(
    debounce((docId, content, user) => sendEdit(docId, content, user), 300)
  ).current;

  const throttledSendCursor = useRef(
    throttle((docId, user, pos) => sendCursor(docId, user, pos), 80)
  ).current;

  useEffect(() => {
    if (!documentId || !username) return;

    connectWebSocket({
      documentId,
      onEdit: (msg) => {
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
      // ✅ NEW: receive format from other users
      onFormat: (msg) => {
        if (msg.user !== username) {
          onFormatUpdate?.(msg);
        }
      },
      onConnect: () => {
        setConnected(true);
        sendPresence(documentId, username, 'JOINED');
      },
      onDisconnect: () => {
        setConnected(false);
      },
    });

    const sendLeft = () => {
      sendPresence(documentId, username, 'LEFT');
    };

    const handleBeforeUnload = () => {
      sendLeft();
      const payload = JSON.stringify({
        documentId: String(documentId),
        user: username,
        status: 'LEFT',
      });
      navigator.sendBeacon?.('/api/presence/leave',
        new Blob([payload], { type: 'application/json' })
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      sendLeft();
      debouncedSendEdit.cancel?.();
      disconnectWebSocket();
      setConnected(false);
    };
  }, [documentId, username]);

  const broadcastEdit = useCallback(
    (content) => {
      if (ignoreNextEditRef.current) {
        ignoreNextEditRef.current = false;
        return;
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

  // ✅ NEW: broadcast format change to other users
  const broadcastFormat = useCallback(
    (type, value, range) => {
      sendFormat(documentId, username, type, value, range);
    },
    [documentId, username]
  );

  return { broadcastEdit, broadcastCursor, broadcastFormat, connected, ignoreNextEditRef };
}
