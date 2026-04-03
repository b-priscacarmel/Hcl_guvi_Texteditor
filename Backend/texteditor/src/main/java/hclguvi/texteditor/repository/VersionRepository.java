package hclguvi.texteditor.repository;



import hclguvi.texteditor.model.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VersionRepository extends JpaRepository<DocumentVersion, Long> {

    /**
     * Get all versions for a document, newest first.
     * Used by GET /api/documents/{id}/versions
     */
    List<DocumentVersion> findByDocumentIdOrderByVersionNumberDesc(Long documentId);

    /**
     * Get the latest version for a document.
     * Used by DocumentService to determine the next version number.
     */
    Optional<DocumentVersion> findTopByDocumentIdOrderByVersionNumberDesc(Long documentId);

    /**
     * Count how many versions a document has.
     */
    long countByDocumentId(Long documentId);

    /**
     * Delete all versions for a document.
     * Called when a document itself is deleted (cascade handles this via JPA,
     * but this is useful for manual cleanup).
     */
    void deleteByDocumentId(Long documentId);

    /**
     * Get a specific version by document ID and version number.
     */
    @Query("SELECT v FROM DocumentVersion v WHERE v.document.id = :docId AND v.versionNumber = :versionNum")
    Optional<DocumentVersion> findByDocumentIdAndVersionNumber(
            @Param("docId") Long documentId,
            @Param("versionNum") Integer versionNumber
    );
}

