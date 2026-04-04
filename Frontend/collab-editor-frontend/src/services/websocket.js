import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

const WS_BASE = import.meta.env.VITE_API_BASE || '';

export function connectWebSocket({ documentId, onEdit, onPresence, onCursor, onFormat, onConnect, onDisconnect }) {
  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${WS_BASE}/ws`),
    reconnectDelay: 5000,
    debug: (str) => {
      if (import.meta.env.DEV) console.debug('[STOMP]', str);
    },
    onConnect: () => {
      console.log('[WS] Connected');

      stompClient.subscribe(`/topic/document/${documentId}`, (message) => {
        try {
          const payload = JSON.parse(message.body);
          onEdit?.(payload);
        } catch (e) {
          console.error('[WS] Edit parse error', e);
        }
      });

      stompClient.subscribe(`/topic/presence/${documentId}`, (message) => {
        try {
          const payload = JSON.parse(message.body);
          onPresence?.(payload);
        } catch (e) {
          console.error('[WS] Presence parse error', e);
        }
      });

      stompClient.subscribe(`/topic/cursor/${documentId}`, (message) => {
        try {
          const payload = JSON.parse(message.body);
          onCursor?.(payload);
        } catch (e) {
          console.error('[WS] Cursor parse error', e);
        }
      });

      // ✅ NEW: Subscribe to format topic
      stompClient.subscribe(`/topic/format/${documentId}`, (message) => {
        try {
          const payload = JSON.parse(message.body);
          onFormat?.(payload);
        } catch (e) {
          console.error('[WS] Format parse error', e);
        }
      });

      onConnect?.();
    },
    onDisconnect: () => {
      console.log('[WS] Disconnected');
      onDisconnect?.();
    },
    onStompError: (frame) => {
      console.error('[WS] STOMP Error', frame);
    },
  });

  stompClient.activate();
  return stompClient;
}

export function sendEdit(documentId, content, user) {
  if (stompClient?.connected) {
    stompClient.publish({
      destination: '/app/edit',
      body: JSON.stringify({
        documentId: String(documentId),
        content,
        user,
        timestamp: Date.now(),
      }),
    });
  }
}

export function sendPresence(documentId, user, status) {
  if (stompClient?.connected) {
    stompClient.publish({
      destination: '/app/presence',
      body: JSON.stringify({
        documentId: String(documentId),
        user,
        status,
      }),
    });
  }
}

export function sendCursor(documentId, user, position) {
  if (stompClient?.connected) {
    stompClient.publish({
      destination: '/app/cursor',
      body: JSON.stringify({
        documentId: String(documentId),
        user,
        position,
      }),
    });
  }
}

// ✅ NEW: Send format change to other users
export function sendFormat(documentId, user, type, value, range) {
  if (stompClient?.connected) {
    stompClient.publish({
      destination: '/app/format',
      body: JSON.stringify({
        documentId: String(documentId),
        user,
        type,
        value,
        range,
      }),
    });
  }
}

export function disconnectWebSocket() {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
}

export function isConnected() {
  return stompClient?.connected ?? false;
}

