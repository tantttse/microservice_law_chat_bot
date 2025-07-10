// Document processing and RAG utilities

import { DocumentChunk, DocumentCache } from "./types";

export class DocumentProcessor {
  private readonly chunkSize: number;
  private readonly chunkOverlap: number;

  constructor(chunkSize: number = 1000, chunkOverlap: number = 200) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  /**
   * Chunk a document into smaller pieces for RAG
   */
  chunkDocument(
    documentId: number,
    title: string,
    content: string
  ): DocumentChunk[] {
    if (!content || content.trim().length === 0) {
      return [];
    }

    const chunks: DocumentChunk[] = [];
    let startIndex = 0;
    let chunkIndex = 0;

    while (startIndex < content.length) {
      const endIndex = Math.min(startIndex + this.chunkSize, content.length);
      let chunkContent = content.substring(startIndex, endIndex);

      // Try to break at sentence boundaries for better context
      if (endIndex < content.length) {
        const lastPeriod = chunkContent.lastIndexOf(".");
        const lastNewline = chunkContent.lastIndexOf("\n");
        const breakPoint = Math.max(lastPeriod, lastNewline);

        if (breakPoint > startIndex + this.chunkSize * 0.5) {
          chunkContent = content.substring(startIndex, breakPoint + 1);
          startIndex = breakPoint + 1;
        } else {
          startIndex = endIndex - this.chunkOverlap;
        }
      } else {
        startIndex = endIndex;
      }

      chunks.push({
        id: `${documentId}_chunk_${chunkIndex}`,
        documentId,
        documentTitle: title,
        content: chunkContent.trim(),
        chunkIndex,
        totalChunks: 0, // Will be updated after all chunks are created
      });

      chunkIndex++;
    }

    // Update total chunks count
    chunks.forEach((chunk) => (chunk.totalChunks = chunks.length));

    return chunks;
  }

  /**
   * Create document cache from active documents
   */
  createDocumentCache(activeDocuments: any[]): DocumentCache {
    const documentsWithChunks = activeDocuments.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      content: doc.content || "",
      chunks: this.chunkDocument(doc.id, doc.title, doc.content || ""),
    }));

    return {
      documents: documentsWithChunks,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get all chunks from document cache
   */
  getAllChunks(documentCache: DocumentCache): DocumentChunk[] {
    const allChunks: DocumentChunk[] = [];
    documentCache.documents.forEach((doc) => {
      allChunks.push(...doc.chunks);
    });
    return allChunks;
  }
}
