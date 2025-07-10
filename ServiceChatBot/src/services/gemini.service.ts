// Main Gemini Service - Refactored and Modular

import { GoogleGenerativeAI } from "@google/generative-ai";
import { APIError } from "../common/errors/app-errors";
import { DocumentService } from "./document.service";

// Import modular components
import {
  DocumentChunk,
  DocumentCache,
  ConversationMessage,
  DEFAULT_GEMINI_CONFIG,
} from "./gemini/types";
import { VietnameseTextProcessor } from "./gemini/vietnamese-processor";
import { DocumentProcessor } from "./gemini/document-processor";
import { LegalAnalyzer } from "./gemini/legal-analyzer";
import { TrafficLawDetector } from "./gemini/traffic-law-detector";
import { RAGProcessor } from "./gemini/rag-processor";
import { ResponseGenerator } from "./gemini/response-generator";

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private documentService: DocumentService;
  private documentCache: DocumentCache | null = null;
  private documentProcessor: DocumentProcessor;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new APIError(
        "GEMINI_API_KEY_MISSING",
        500,
        "Gemini API key is required"
      );
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.documentService = new DocumentService();
    this.documentProcessor = new DocumentProcessor(
      DEFAULT_GEMINI_CONFIG.chunkSize,
      DEFAULT_GEMINI_CONFIG.chunkOverlap
    );

    // Set up dependency injection
    this.documentService.setGeminiService(this);

    // Initialize document cache on startup
    this.initializeDocumentCache();
  }

  /**
   * Initialize document cache on startup
   */
  private async initializeDocumentCache(): Promise<void> {
    try {
      await this.refreshDocumentCache();
    } catch (error) {
      console.error("Failed to initialize document cache:", error);
    }
  }

  /**
   * Refresh document cache from database
   */
  private async refreshDocumentCache(): Promise<void> {
    try {
      const activeDocuments =
        await this.documentService.getActiveDocumentsWithContent();
      this.documentCache =
        this.documentProcessor.createDocumentCache(activeDocuments);

      console.log(
        `Document cache refreshed with ${this.documentCache.documents.length} documents`
      );
    } catch (error) {
      console.error("Failed to refresh document cache:", error);
      throw error;
    }
  }

  /**
   * Build system instruction with RAG or full document content
   */
  private async buildSystemInstruction(userPrompt: string): Promise<string> {
    let documentContent = "";

    // Check if this is a legal/penalty query that needs comprehensive answer
    if (LegalAnalyzer.isLegalPenaltyQuery(userPrompt)) {
      // For legal queries, use full document content to ensure comprehensive answers
      const activeDocuments =
        await this.documentService.getActiveDocumentsWithContent();
      documentContent = activeDocuments
        .map(
          (doc: any) => `Document: ${doc.title}\nContent: ${doc.content || ""}`
        )
        .join("\n\n");

      console.log("Using full document content for legal query");
    } else {
      // For general queries, use RAG to retrieve relevant chunks
      const relevantChunks = await this.retrieveRelevantChunks(userPrompt, 8);

      if (relevantChunks.length > 0) {
        documentContent = relevantChunks
          .map(
            (chunk) =>
              `Document: ${chunk.documentTitle}\nContent: ${chunk.content}`
          )
          .join("\n\n");

        console.log(`Using RAG with ${relevantChunks.length} relevant chunks`);
      } else {
        // Fallback to full content if no relevant chunks found
        const activeDocuments =
          await this.documentService.getActiveDocumentsWithContent();
        documentContent = activeDocuments
          .map(
            (doc: any) =>
              `Document: ${doc.title}\nContent: ${doc.content || ""}`
          )
          .join("\n\n");

        console.log(
          "Fallback to full document content - no relevant chunks found"
        );
      }
    }

    return ResponseGenerator.buildSystemInstruction(
      userPrompt,
      documentContent
    );
  }

  /**
   * Retrieve relevant chunks using RAG with semantic understanding
   */
  private async retrieveRelevantChunks(
    query: string,
    maxChunks: number = 5
  ): Promise<DocumentChunk[]> {
    // Ensure cache is available
    if (!this.documentCache) {
      await this.refreshDocumentCache();
    }

    if (!this.documentCache || this.documentCache.documents.length === 0) {
      console.log("No documents in cache for RAG retrieval");
      return [];
    }

    // Check if this is a legal article search query
    const isLegalArticleSearch = LegalAnalyzer.isLegalArticleSearchQuery(query);
    if (isLegalArticleSearch) {
      console.log("Legal article search detected");
      maxChunks = 15; // Increase chunk limit for legal article searches
    }

    // Extract keywords from query
    const keywords = LegalAnalyzer.extractLegalKeywords(query);
    console.log(`Extracted keywords for query "${query}":`, keywords);

    // Get all chunks from cache
    const allChunks = this.documentProcessor.getAllChunks(this.documentCache);

    // Use RAG processor to retrieve relevant chunks
    const selectedChunks = RAGProcessor.retrieveRelevantChunks(
      allChunks,
      query,
      keywords,
      maxChunks
    );

    console.log(`Selected ${selectedChunks.length} chunks for RAG retrieval`);
    return selectedChunks;
  }

  /**
   * Public method to refresh document cache
   */
  async refreshCache(): Promise<void> {
    await this.refreshDocumentCache();
  }

  /**
   * Send message to Gemini API
   */
  async sendToGemini(
    userPrompt: string,
    conversationHistory: ConversationMessage[] = []
  ): Promise<string> {
    try {
      const systemInstruction = await this.buildSystemInstruction(userPrompt);

      const model = this.genAI.getGenerativeModel({
        model: DEFAULT_GEMINI_CONFIG.model,
        systemInstruction: systemInstruction,
      });

      // Build conversation history for context
      const chatHistory = conversationHistory.flatMap((msg) => [
        { role: "user" as const, parts: [{ text: msg.question }] },
        { role: "model" as const, parts: [{ text: msg.answer }] },
      ]);

      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          temperature: DEFAULT_GEMINI_CONFIG.temperature,
          maxOutputTokens: DEFAULT_GEMINI_CONFIG.maxOutputTokens,
        },
      });

      const result = await chat.sendMessage(userPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new APIError(
        "GEMINI_API_ERROR",
        500,
        "Failed to get response from AI assistant"
      );
    }
  }

  /**
   * Send streaming message to Gemini API
   */
  async sendToGeminiStream(
    userPrompt: string,
    onToken: (token: string) => void,
    conversationHistory: ConversationMessage[] = []
  ): Promise<void> {
    try {
      const systemInstruction = await this.buildSystemInstruction(userPrompt);

      const model = this.genAI.getGenerativeModel({
        model: DEFAULT_GEMINI_CONFIG.model,
        systemInstruction: systemInstruction,
      });

      // Build conversation history for context
      const chatHistory = conversationHistory.flatMap((msg) => [
        { role: "user" as const, parts: [{ text: msg.question }] },
        { role: "model" as const, parts: [{ text: msg.answer }] },
      ]);

      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          temperature: DEFAULT_GEMINI_CONFIG.temperature,
          maxOutputTokens: DEFAULT_GEMINI_CONFIG.maxOutputTokens,
        },
      });

      const result = await chat.sendMessageStream(userPrompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          // Split by words while preserving spaces
          const words = chunkText.split(/(\s+)/);
          for (const word of words) {
            if (word) {
              onToken(word);
              await new Promise((resolve) => setTimeout(resolve, 10));
            }
          }
        }
      }
    } catch (error) {
      console.error("Gemini API Stream Error:", error);
      throw new APIError(
        "GEMINI_API_ERROR",
        500,
        "Failed to get streaming response from AI assistant"
      );
    }
  }

  /**
   * Generate traffic law response
   */
  async generateTrafficLawResponse(
    question: string,
    conversationHistory: ConversationMessage[] = []
  ): Promise<string> {
    // Check if it's a greeting message
    if (TrafficLawDetector.isGreetingMessage(question)) {
      return ResponseGenerator.generateGreetingResponse(question);
    }

    // Check if it's traffic law related
    const isTrafficRelated = TrafficLawDetector.isTrafficLawRelated(
      question,
      conversationHistory
    );

    if (!isTrafficRelated) {
      return ResponseGenerator.generateNonTrafficResponse(question);
    }

    return this.sendToGemini(question, conversationHistory);
  }

  /**
   * Generate streaming traffic law response
   */
  async generateTrafficLawResponseStream(
    question: string,
    onToken: (token: string) => void,
    conversationHistory: ConversationMessage[] = []
  ): Promise<void> {
    // Check if it's a greeting message
    if (TrafficLawDetector.isGreetingMessage(question)) {
      const greetingMessage =
        ResponseGenerator.generateGreetingResponse(question);
      await ResponseGenerator.streamMessage(greetingMessage, onToken);
      return;
    }

    // Check if it's traffic law related
    if (
      !TrafficLawDetector.isTrafficLawRelated(question, conversationHistory)
    ) {
      const errorMessage =
        ResponseGenerator.generateNonTrafficResponse(question);
      await ResponseGenerator.streamMessage(errorMessage, onToken, 100);
      return;
    }

    return this.sendToGeminiStream(question, onToken, conversationHistory);
  }

  // Expose utility methods for backward compatibility
  isVietnameseText(text: string): boolean {
    return VietnameseTextProcessor.isVietnameseText(text);
  }

  isGreetingMessage(question: string): boolean {
    return TrafficLawDetector.isGreetingMessage(question);
  }

  isTrafficLawRelated(
    question: string,
    conversationHistory: ConversationMessage[] = []
  ): boolean {
    return TrafficLawDetector.isTrafficLawRelated(
      question,
      conversationHistory
    );
  }
}
