package hclguvi.texteditor.service;


import hclguvi.texteditor.model.Document;
import hclguvi.texteditor.model.DocumentVersion;
import hclguvi.texteditor.repository.DocumentRepository;
import hclguvi.texteditor.repository.VersionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final VersionRepository versionRepository;

    @Transactional
    public Document createDocument(String title, String createdBy) {
        Document doc = Document.builder()
                .title(title)
                .content("")
                .createdBy(createdBy)
                .build();
        Document saved = documentRepository.save(doc);
        log.info("Created document {} by {}", saved.getId(), createdBy);
        return saved;
    }

    public Optional<Document> getDocument(Long id) {
        return documentRepository.findById(id);
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAllByOrderByUpdatedAtDesc();
    }

    @Transactional
    public Document updateContent(Long id, String content, String updatedBy) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));
        doc.setContent(content);
        return documentRepository.save(doc);
    }

    @Transactional
    public Document updateTitle(Long id, String title) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));
        doc.setTitle(title);
        return documentRepository.save(doc);
    }

    @Transactional
    public DocumentVersion saveVersion(Long documentId, String savedBy) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));

        int nextVersion = versionRepository
                .findTopByDocumentIdOrderByVersionNumberDesc(documentId)
                .map(v -> v.getVersionNumber() + 1)
                .orElse(1);

        DocumentVersion version = DocumentVersion.builder()
                .document(doc)
                .content(doc.getContent())
                .savedBy(savedBy)
                .versionNumber(nextVersion)
                .build();

        DocumentVersion saved = versionRepository.save(version);
        log.info("Saved version {} for document {}", nextVersion, documentId);
        return saved;
    }

    public List<DocumentVersion> getVersions(Long documentId) {
        return versionRepository.findByDocumentIdOrderByVersionNumberDesc(documentId);
    }

    @Transactional
    public void deleteDocument(Long id) {
        documentRepository.deleteById(id);
    }
}
