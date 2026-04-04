package hclguvi.texteditor.controller;

import hclguvi.texteditor.dto.PresenceMessage;
import hclguvi.texteditor.service.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Receives the navigator.sendBeacon() POST fired when a browser tab closes.
 * This is the most reliable way to handle abrupt disconnects on the frontend
 * since sendBeacon fires even when the page is unloading.
 */
@RestController
@RequestMapping("/api/presence")
@RequiredArgsConstructor
@Slf4j
public class PresenceLeaveController {

    private final PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/leave")
    public ResponseEntity<Void> leave(@RequestBody Map<String, String> body) {
        String username   = body.get("user");
        String documentId = body.get("documentId");

        if (username == null || documentId == null) {
            return ResponseEntity.badRequest().build();
        }

        log.info("Beacon leave: {} from doc {}", username, documentId);

        presenceService.removeUser(documentId, username);

        // Broadcast updated list to remaining users
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

        return ResponseEntity.ok().build();
    }
}