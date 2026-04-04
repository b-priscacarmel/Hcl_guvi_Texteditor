package hclguvi.texteditor.controller;



import hclguvi.texteditor.dto.PresenceMessage;
import hclguvi.texteditor.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class PresenceController {

    private final PresenceService presenceService;

    /**
     * GET /api/documents/{id}/users
     * REST fallback for active users list
     */
    @GetMapping("/{id}/users")
    public ResponseEntity<List<PresenceMessage.UserInfo>> getActiveUsers(@PathVariable String id) {
        List<PresenceMessage.UserInfo> users = presenceService.getActiveUserInfos(id);
        return ResponseEntity.ok(users);
    }
}
