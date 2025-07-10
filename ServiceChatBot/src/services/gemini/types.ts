// Shared interfaces and types for the Gemini service modules

export interface DocumentChunk {
  id: string;
  documentId: number;
  documentTitle: string;
  content: string;
  chunkIndex: number;
  totalChunks: number;
}

export interface DocumentCache {
  documents: Array<{
    id: number;
    title: string;
    content: string;
    chunks: DocumentChunk[];
  }>;
  lastUpdated: Date;
}

export interface LegalArticleReference {
  articles: number[];
  clauses: number[];
  points: string[];
  decrees: number[];
  circulars: number[];
  decisions: number[];
  hasLegalReference: boolean;
}

export interface ConversationMessage {
  question: string;
  answer: string;
}

export interface GeminiConfig {
  model: string;
  chunkSize: number;
  chunkOverlap: number;
  maxOutputTokens: number;
  temperature: number;
}

export const DEFAULT_GEMINI_CONFIG: GeminiConfig = {
  model: "gemini-2.0-flash-exp",
  chunkSize: 1000,
  chunkOverlap: 200,
  maxOutputTokens: 1000,
  temperature: 0.7,
};
