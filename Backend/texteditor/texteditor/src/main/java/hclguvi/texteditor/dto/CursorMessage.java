package hclguvi.texteditor.dto;



import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursorMessage {
    private String documentId;
    private String user;
    private Integer position;
    private String color;
}