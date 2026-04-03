package hclguvi.texteditor.websocket;





import hclguvi.texteditor.dto.CursorMessage;
import hclguvi.texteditor.dto.EditMessage;
import hclguvi.texteditor.dto.PresenceMessage;
import hclguvi.texteditor.model.UserSession;
import hclguvi.texteditor.service.DocumentService;
import hclguvi.texteditor.service.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
@Slf4j
public class EditMessageHandler {

    private final SimpMessagingTemplate messagingTemplate;
    private final DocumentService documentService;
    private final PresenceService presenceService;

    /**
     * Handles /app/edit
     * Broadcasts the updated content to /topic/document/{id}
     */
    @MessageMapping("/edit")
    public void handleEdit(@Payload EditMessage message) {
        log.debug("Edit from {} on doc {}", message.getUser(), message.getDocumentId());

        // Persist content to DB
        try {
            documentService.updateContent(
                Long.parseLong(message.getDocumentId()),
                message.getContent(),
                message.getUser()
            );
        } catch (Exception e) {
            log.error("Failed to persist edit: {}", e.getMessage());
        }

        // Broadcast to all subscribers of this document
        messagingTemplate.convertAndSend(
            "/topic/document/" + message.getDocumentId(),
            message
        );
    }

    /**
     * Handles /app/presence
     * Broadcasts presence updates to /topic/presence/{id}
     */
    @MessageMapping("/presence")
    public void handlePresence(@Payload PresenceMessage message) {
        log.debug("Presence {} for user {} on doc {}", message.getStatus(), message.getUser(), message.getDocumentId());

        if ("JOINED".equalsIgnoreCase(message.getStatus())) {
            UserSession session = presenceService.addUser(message.getDocumentId(), message.getUser());
            message.setColor(session.getColor());
        } else if ("LEFT".equalsIgnoreCase(message.getStatus())) {
            presenceService.removeUser(message.getDocumentId(), message.getUser());
        }

        // Attach current active users list
        List<PresenceMessage.UserInfo> activeUsers =
            presenceService.getActiveUserInfos(message.getDocumentId());
        message.setActiveUsers(activeUsers);

        messagingTemplate.convertAndSend(
            "/topic/presence/" + message.getDocumentId(),
            message
        );
    }

    /**
     * Handles /app/cursor
     * Broadcasts cursor positions to /topic/cursor/{id}
     */
    @MessageMapping("/cursor")
    public void handleCursor(@Payload CursorMessage message) {
        // Update in-memory cursor state
        presenceService.updateCursor(
            message.getDocumentId(),
            message.getUser(),
            message.getPosition() != null ? message.getPosition() : 0
        );

        // Attach colour if missing
        presenceService.getUser(message.getDocumentId(), message.getUser())
            .ifPresent(s -> message.setColor(s.getColor()));

        messagingTemplate.convertAndSend(
            "/topic/cursor/" + message.getDocumentId(),
            message
        );
    }
}
