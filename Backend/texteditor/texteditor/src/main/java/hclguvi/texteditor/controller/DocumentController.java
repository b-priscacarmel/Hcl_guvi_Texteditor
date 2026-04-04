package hclguvi.texteditor.controller;


import  hclguvi.texteditor.model.Document;
import  hclguvi.texteditor.model.DocumentVersion;
import  hclguvi.texteditor.service.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Slf4j
public class DocumentController {

    private final DocumentService documentService;


    @PostMapping
    public ResponseEntity<Document> createDocument(@RequestBody Map<String, String> body) {
        String title = body.getOrDefault("title", "Untitled Document");
        String createdBy = body.getOrDefault("createdBy", "anonymous");
        Document doc = documentService.createDocument(title, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }

    /**
     * GET /api/documents
     * Returns all documents (for document list page)
     */
    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    /**
     * GET /api/documents/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocument(@PathVariable Long id) {
        return documentService.getDocument(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Document> updateDocument(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String content = body.get("content");
        String title = body.get("title");
        String updatedBy = body.getOrDefault("updatedBy", "anonymous");

        Document doc = documentService.getDocument(id)
                .orElse(null);

        if (doc == null) return ResponseEntity.notFound().build();

        if (content != null) {
            doc = documentService.updateContent(id, content, updatedBy);
        }
        if (title != null) {
            doc = documentService.updateTitle(id, title);
        }

        return ResponseEntity.ok(doc);
    }

    /**
     * DELETE /api/documents/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────
    // VERSION HISTORY
    // ─────────────────────────────────────────────

    /**
     * POST /api/documents/{id}/versions
     * Body: { "savedBy": "romia" }
     */
    @PostMapping("/{id}/versions")
    public ResponseEntity<DocumentVersion> saveVersion(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String savedBy = body.getOrDefault("savedBy", "anonymous");
        DocumentVersion version = documentService.saveVersion(id, savedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(version);
    }

    /**
     * GET /api/documents/{id}/versions
     */
    @GetMapping("/{id}/versions")
    public ResponseEntity<List<DocumentVersion>> getVersions(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getVersions(id));
    }
    @PutMapping("/{documentId}/restore/{versionId}")
    public ResponseEntity<Document> restoreVersion(
            @PathVariable Long documentId,
            @PathVariable Long versionId) {

        return ResponseEntity.ok(
                documentService.restoreVersion(documentId, versionId)
        );
    }
}
