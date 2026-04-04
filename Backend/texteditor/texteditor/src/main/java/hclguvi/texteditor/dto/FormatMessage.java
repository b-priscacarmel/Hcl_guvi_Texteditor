package hclguvi.texteditor.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormatMessage {

    private String documentId;
    private String user;
    private String type;    // e.g. "bold", "italic", "align"
    private Object value;   // e.g. true/false, "center", "right"
    private Range range;    // selection range when format was applied

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Range {
        private int index;
        private int length;
    }
}