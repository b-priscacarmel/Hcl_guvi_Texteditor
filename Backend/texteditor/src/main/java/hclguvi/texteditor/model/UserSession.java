package hclguvi.texteditor.model;



import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSession {
    private String username;
    private String documentId;
    private String color;       // assigned colour for cursor
    private Integer cursorPosition;
    private LocalDateTime joinedAt;
}
