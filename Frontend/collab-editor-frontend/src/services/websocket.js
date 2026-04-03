import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

/**
 * Connect to the STOMP WebSocket and subscribe to document topics.
 */
export function connectWebSocket({ documentId, onEdit, onPresence, onCursor, onConnect, onDisconnect }) {
  stompClient = new Client({
    webSocketFactory: () => new SockJS('/ws'),
    reconnectDelay: 5000,
    debug: (str) => {
      if (import.meta.env.DEV) console.debug('[STOMP]', str);
    },
    onConnect: () => {
      console.log('[WS] Connected');

      // Subscribe to document edits
      stompClient.subscribe(`/topic/document/${documentId}`, (message) => {
        try {
          const payload = JSON.parse(message.body);
          onEdit?.(payload);
        } catch (e) {
          console.error('[WS] Edit parse error', e);
        }
      });

      // Subscribe to presence updates
      stompClient.subscribe(`/topic/presence/${documentId}`, (message) => {
        try {
          const payload = JSON.parse(message.body);
          onPresence?.(payload);
        } catch (e) {
          console.error('[WS] Presence parse error', e);
        }
      });

      // Subscribe to cursor updates
      stompClient.subscribe(`/topic/cursor/${documentId}`, (message) => {
        try {
          const payload = JSON.parse(message.body);
          onCursor?.(payload);
        } catch (e) {
          console.error('[WS] Cursor parse error', e);
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

/**
 * Send an edit message to /app/edit
 */
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

/**
 * Send a presence message to /app/presence
 * status: 'JOINED' | 'LEFT' | 'ACTIVE'
 */
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

/**
 * Send a cursor position message to /app/cursor
 */
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

/**
 * Disconnect the STOMP client
 */
export function disconnectWebSocket() {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
}

export function isConnected() {
  return stompClient?.connected ?? false;
}
