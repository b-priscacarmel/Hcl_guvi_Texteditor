package hclguvi.texteditor.service;



import hclguvi.texteditor.dto.PresenceMessage;
import hclguvi.texteditor.model.UserSession;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class PresenceService {

    // documentId -> (username -> UserSession)
    private final Map<String, Map<String, UserSession>> documentUsers = new ConcurrentHashMap<>();

    private static final List<String> USER_COLORS = List.of(
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
        "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
        "#BB8FCE", "#85C1E9"
    );

    public UserSession addUser(String documentId, String username) {
        documentUsers.computeIfAbsent(documentId, k -> new ConcurrentHashMap<>());
        Map<String, UserSession> users = documentUsers.get(documentId);

        String color = assignColor(documentId, username);
        UserSession session = UserSession.builder()
                .username(username)
                .documentId(documentId)
                .color(color)
                .cursorPosition(0)
                .joinedAt(LocalDateTime.now())
                .build();

        users.put(username, session);
        return session;
    }

    public void removeUser(String documentId, String username) {
        if (documentUsers.containsKey(documentId)) {
            documentUsers.get(documentId).remove(username);
        }
    }

    public void updateCursor(String documentId, String username, int position) {
        if (documentUsers.containsKey(documentId)) {
            UserSession session = documentUsers.get(documentId).get(username);
            if (session != null) {
                session.setCursorPosition(position);
            }
        }
    }

    public List<UserSession> getActiveUsers(String documentId) {
        if (!documentUsers.containsKey(documentId)) return Collections.emptyList();
        return new ArrayList<>(documentUsers.get(documentId).values());
    }

    public List<PresenceMessage.UserInfo> getActiveUserInfos(String documentId) {
        return getActiveUsers(documentId).stream()
                .map(s -> PresenceMessage.UserInfo.builder()
                        .username(s.getUsername())
                        .color(s.getColor())
                        .cursorPosition(s.getCursorPosition())
                        .build())
                .collect(Collectors.toList());
    }

    public Optional<UserSession> getUser(String documentId, String username) {
        if (!documentUsers.containsKey(documentId)) return Optional.empty();
        return Optional.ofNullable(documentUsers.get(documentId).get(username));
    }

    private String assignColor(String documentId, String username) {
        // Re-use colour if user is returning
        if (documentUsers.containsKey(documentId)) {
            UserSession existing = documentUsers.get(documentId).get(username);
            if (existing != null) return existing.getColor();
            // Assign next unused color
            Set<String> usedColors = documentUsers.get(documentId).values()
                    .stream().map(UserSession::getColor).collect(Collectors.toSet());
            for (String c : USER_COLORS) {
                if (!usedColors.contains(c)) return c;
            }
        }
        // Fallback: pick by hash
        return USER_COLORS.get(Math.abs(username.hashCode()) % USER_COLORS.size());
    }
}

