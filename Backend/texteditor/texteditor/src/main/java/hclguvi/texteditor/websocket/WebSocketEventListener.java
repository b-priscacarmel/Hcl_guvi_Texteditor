package hclguvi.texteditor.websocket;

import hclguvi.texteditor.dto.PresenceMessage;
import hclguvi.texteditor.model.UserSession;
import hclguvi.texteditor.service.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.List;
import java.util.Map;

/**
 * Listens for WebSocket session disconnect events.
 *
 * When a tab is closed, the browser drops the TCP connection without
 * sending a STOMP SEND /app/presence LEFT frame. Spring detects the
 * broken connection and fires SessionDisconnectEvent — we use that to
 * remove the user from every document they were in and broadcast the
 * updated presence list to remaining subscribers.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttrs = accessor.getSessionAttributes();

        if (sessionAttrs == null) return;

        // We store username + documentId in session attributes on JOINED
        String username   = (String) sessionAttrs.get("username");
        String documentId = (String) sessionAttrs.get("documentId");

        if (username == null || documentId == null) return;

        log.info("WebSocket disconnected — removing {} from doc {}", username, documentId);

        // Remove from in-memory presence map
        presenceService.removeUser(documentId, username);

        // Broadcast updated user list to remaining subscribers
        List<PresenceMessage.UserInfo> activeUsers =
                presenceService.getActiveUserInfos(documentId);

        PresenceMessage update = PresenceMessage.builder()
                .documentId(documentId)
                .user(username)
                .status("LEFT")
                .activeUsers(activeUsers)
                .build();

        messagingTemplate.convertAndSend(
                "/topic/presence/" + documentId,
                update
        );
    }
}