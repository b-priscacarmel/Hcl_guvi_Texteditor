package hclguvi.texteditor.websocket;

import hclguvi.texteditor.dto.CursorMessage;
import hclguvi.texteditor.dto.EditMessage;
import hclguvi.texteditor.dto.FormatMessage;
import hclguvi.texteditor.dto.PresenceMessage;
import hclguvi.texteditor.model.UserSession;
import hclguvi.texteditor.service.DocumentService;
import hclguvi.texteditor.service.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

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

        try {
            documentService.updateContent(
                Long.parseLong(message.getDocumentId()),
                message.getContent(),
                message.getUser()
            );
        } catch (Exception e) {
            log.error("Failed to persist edit: {}", e.getMessage());
        }

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
    public void handlePresence(
            @Payload PresenceMessage message,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        log.debug("Presence {} for user {} on doc {}",
                message.getStatus(), message.getUser(), message.getDocumentId());

        if ("JOINED".equalsIgnoreCase(message.getStatus())) {
            UserSession session = presenceService.addUser(
                    message.getDocumentId(), message.getUser());
            message.setColor(session.getColor());

            Map<String, Object> attrs = headerAccessor.getSessionAttributes();
            if (attrs != null) {
                attrs.put("username",   message.getUser());
                attrs.put("documentId", message.getDocumentId());
            }

        } else if ("LEFT".equalsIgnoreCase(message.getStatus())) {
            presenceService.removeUser(message.getDocumentId(), message.getUser());
        }

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
     */
    @MessageMapping("/cursor")
    public void handleCursor(@Payload CursorMessage message) {
        presenceService.updateCursor(
            message.getDocumentId(),
            message.getUser(),
            message.getPosition() != null ? message.getPosition() : 0
        );

        presenceService.getUser(message.getDocumentId(), message.getUser())
            .ifPresent(s -> message.setColor(s.getColor()));

        messagingTemplate.convertAndSend(
            "/topic/cursor/" + message.getDocumentId(),
            message
        );
    }

    /**
     * Handles /app/format
     * Broadcasts toolbar format changes (bold, italic, align, etc.)
     * to /topic/format/{id} so all other users apply the same format.
     */
    @MessageMapping("/format")
    public void handleFormat(@Payload FormatMessage message) {
        log.debug("Format '{}' = {} from {} on doc {}",
                message.getType(), message.getValue(),
                message.getUser(), message.getDocumentId());

        messagingTemplate.convertAndSend(
            "/topic/format/" + message.getDocumentId(),
            message
        );
    }
}
