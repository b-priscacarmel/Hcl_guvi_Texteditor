package hclguvi.texteditor.dto;



import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EditMessage {
    private String documentId;
    private String content;     // full document content (OT simplified)
    private String user;
    private String delta;       // optional: JSON delta for future OT
    private long timestamp;
}
