// RAG (Retrieval Augmented Generation) scoring and retrieval

import { DocumentChunk } from "./types";
import { VietnameseTextProcessor } from "./vietnamese-processor";
import { LegalAnalyzer } from "./legal-analyzer";

export class RAGProcessor {
  /**
   * Score chunk relevance to user query with semantic understanding
   */
  static scoreChunkRelevance(
    chunk: DocumentChunk,
    query: string,
    keywords: string[]
  ): number {
    const chunkLower = chunk.content.toLowerCase();
    const queryLower = query.toLowerCase();
    const queryNormalized =
      VietnameseTextProcessor.normalizeVietnamese(queryLower);

    let score = 0;

    // HIGHEST PRIORITY: Legal article/clause matching
    const legalRef = LegalAnalyzer.extractLegalArticleReferences(query);
    if (legalRef.hasLegalReference) {
      score += RAGProcessor.scoreLegalReferences(chunk, legalRef);
    }

    // Semantic pattern matching
    score += RAGProcessor.scoreSemanticPatterns(chunk, queryLower);

    // Keyword matching with context awareness
    score += RAGProcessor.scoreKeywordMatches(chunk, keywords);

    // Context-aware scoring for specific violation types
    score += RAGProcessor.scoreContextualMatches(
      chunk,
      query,
      queryLower,
      queryNormalized
    );

    // Direct query phrase matching
    if (chunkLower.includes(queryLower)) {
      score += 15;
    }

    // Query words matching
    score += RAGProcessor.scoreWordMatches(chunk, queryLower);

    // Boost for legal content
    score += RAGProcessor.scoreLegalContent(chunk);

    return score;
  }

  /**
   * Score legal reference matches
   */
  private static scoreLegalReferences(
    chunk: DocumentChunk,
    legalRef: any
  ): number {
    let score = 0;

    // Check for exact article matches
    legalRef.articles.forEach((articleNum: number) => {
      const articlePattern = new RegExp(`điều\\s+${articleNum}\\b`, "gi");
      if (articlePattern.test(chunk.content)) {
        score += 50;
      }
    });

    // Check for exact clause matches
    legalRef.clauses.forEach((clauseNum: number) => {
      const clausePattern = new RegExp(`khoản\\s+${clauseNum}\\b`, "gi");
      if (clausePattern.test(chunk.content)) {
        score += 40;
      }
    });

    // Check for exact point matches
    legalRef.points.forEach((point: string) => {
      const pointPattern = new RegExp(`điểm\\s+${point}\\)`, "gi");
      if (pointPattern.test(chunk.content)) {
        score += 45;
      }
    });

    // Check for decree matches
    legalRef.decrees.forEach((decreeNum: number) => {
      const decreePattern = new RegExp(`nghị\\s*định\\s+${decreeNum}\\b`, "gi");
      if (decreePattern.test(chunk.content)) {
        score += 35;
      }
    });

    // Boost for combinations
    if (legalRef.articles.length > 0 && legalRef.clauses.length > 0) {
      score += 20;
    }
    if (legalRef.clauses.length > 0 && legalRef.points.length > 0) {
      score += 25;
    }

    return score;
  }

  /**
   * Score semantic pattern matches
   */
  private static scoreSemanticPatterns(
    chunk: DocumentChunk,
    queryLower: string
  ): number {
    const chunkLower = chunk.content.toLowerCase();
    let score = 0;

    const semanticPatterns: { [key: string]: string[] } = {
      "vượt đèn đỏ": [
        "không chấp hành hiệu lệnh của đèn tín hiệu",
        "vi phạm đèn tín hiệu",
        "đèn đỏ",
        "đèn tín hiệu",
      ],
      "chạy đèn đỏ": [
        "không chấp hành hiệu lệnh của đèn tín hiệu",
        "vi phạm đèn tín hiệu",
        "đèn đỏ",
      ],
      "vượt tốc độ": ["vượt quá tốc độ quy định", "tốc độ", "chạy quá tốc độ"],
      "say rượu": [
        "điều khiển phương tiện trong tình trạng say rượu",
        "nồng độ cồn",
        "ma túy",
        "chất kích thích",
      ],
      "không đội mũ bảo hiểm": [
        "không đội mũ bảo hiểm",
        "mũ bảo hiểm",
        "thiết bị bảo hộ",
      ],
      "vượt xe": ["vượt xe", "vượt ẩu", "vượt không đúng quy định"],
    };

    for (const [userIntent, relatedPhrases] of Object.entries(
      semanticPatterns
    )) {
      if (queryLower.includes(userIntent)) {
        for (const phrase of relatedPhrases) {
          if (chunkLower.includes(phrase.toLowerCase())) {
            score += 15;
          }
        }
      }
    }

    return score;
  }

  /**
   * Score keyword matches with weights
   */
  private static scoreKeywordMatches(
    chunk: DocumentChunk,
    keywords: string[]
  ): number {
    const chunkLower = chunk.content.toLowerCase();
    let score = 0;

    keywords.forEach((keyword) => {
      const keywordLower = keyword.toLowerCase();
      const exactMatches = (
        chunkLower.match(
          new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
        ) || []
      ).length;

      let weight = 2; // Default weight

      if (keyword.length > 10) {
        weight = 8; // Long specific phrases
      } else if (
        keywordLower.includes("phạt") ||
        keywordLower.includes("vi phạm")
      ) {
        weight = 5;
      } else if (
        keywordLower.includes("điều") ||
        keywordLower.includes("khoản")
      ) {
        weight = 4;
      }

      score += exactMatches * weight;
    });

    return score;
  }

  /**
   * Score contextual matches for specific violations
   */
  private static scoreContextualMatches(
    chunk: DocumentChunk,
    query: string,
    queryLower: string,
    queryNormalized: string
  ): number {
    const chunkLower = chunk.content.toLowerCase();
    let score = 0;

    // Red light query context
    const isRedLightQuery =
      queryLower.includes("vượt đèn đỏ") ||
      queryLower.includes("chạy đèn đỏ") ||
      queryNormalized.includes("vuot den do") ||
      queryNormalized.includes("chay den do");

    if (isRedLightQuery) {
      if (
        chunkLower.includes("đèn tín hiệu") ||
        chunkLower.includes("đèn đỏ") ||
        chunkLower.includes("không chấp hành hiệu lệnh")
      ) {
        score += 20;
      }
      // Penalize wrong context
      if (
        chunkLower.includes("vượt xe") &&
        !chunkLower.includes("đèn") &&
        !chunkLower.includes("tín hiệu")
      ) {
        score -= 10;
      }
    }

    // Overtaking query context
    const isOvertakingQuery =
      (queryLower.includes("vượt xe") || queryNormalized.includes("vuot xe")) &&
      !isRedLightQuery;

    if (isOvertakingQuery) {
      if (chunkLower.includes("vượt xe") || chunkLower.includes("vượt ẩu")) {
        score += 15;
      }
      if (
        chunkLower.includes("đèn tín hiệu") ||
        chunkLower.includes("đèn đỏ")
      ) {
        score -= 5;
      }
    }

    return score;
  }

  /**
   * Score word matches
   */
  private static scoreWordMatches(
    chunk: DocumentChunk,
    queryLower: string
  ): number {
    const chunkLower = chunk.content.toLowerCase();
    const queryWords = queryLower
      .split(/\s+/)
      .filter((word) => word.length > 2);

    let wordMatchScore = 0;
    queryWords.forEach((word) => {
      if (chunkLower.includes(word)) {
        wordMatchScore += 1;
      }
    });

    return wordMatchScore > 1 ? wordMatchScore * 2 : 0;
  }

  /**
   * Score legal content indicators
   */
  private static scoreLegalContent(chunk: DocumentChunk): number {
    let score = 0;

    // Legal article references
    if (
      /điều\s+\d+|khoản\s+\d+|nghị định\s+\d+|quyết định\s+\d+/i.test(
        chunk.content
      )
    ) {
      score += 5;
    }

    // Penalty amounts
    if (/\d+\.?\d*\s*(triệu|nghìn|đồng|vnđ)/i.test(chunk.content)) {
      score += 3;
    }

    return score;
  }

  /**
   * Retrieve relevant chunks using RAG
   */
  static retrieveRelevantChunks(
    allChunks: DocumentChunk[],
    query: string,
    keywords: string[],
    maxChunks: number = 5
  ): DocumentChunk[] {
    console.log(`Total chunks available: ${allChunks.length}`);

    // Score and sort chunks by relevance
    const scoredChunks = allChunks
      .map((chunk) => ({
        chunk,
        score: RAGProcessor.scoreChunkRelevance(chunk, query, keywords),
        preview: chunk.content.substring(0, 100) + "...",
      }))
      .filter((item) => item.score > 0);

    console.log(`Chunks with non-zero scores: ${scoredChunks.length}`);

    // Sort by score (highest first)
    scoredChunks.sort((a, b) => b.score - a.score);

    // Log top scoring chunks for debugging
    console.log("Top scoring chunks:");
    scoredChunks
      .slice(0, Math.min(5, scoredChunks.length))
      .forEach((item, index) => {
        console.log(
          `${index + 1}. Score: ${item.score}, Document: ${
            item.chunk.documentTitle
          }`
        );
        console.log(`   Preview: ${item.preview}`);
      });

    return scoredChunks.slice(0, maxChunks).map((item) => item.chunk);
  }
}
