package hclguvi.texteditor.dto;



import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PresenceMessage {
    private String documentId;
    private String user;
    private String status;      // JOINED | LEFT | ACTIVE
    private String color;
    private List<UserInfo> activeUsers;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfo {
        private String username;
        private String color;
        private Integer cursorPosition;
    }
}
