// Legal keyword extraction and traffic law detection

import { VietnameseTextProcessor } from "./vietnamese-processor";
import { LegalArticleReference } from "./types";

export class LegalAnalyzer {
  /**
   * Extract legal keywords and phrases from user query with flexible normalization
   */
  static extractLegalKeywords(query: string): string[] {
    const queryLower = query.toLowerCase();
    const queryNormalized =
      VietnameseTextProcessor.normalizeVietnamese(queryLower);

    // Core legal and traffic keywords (Vietnamese and English)
    const coreKeywords = [
      // Vietnamese penalty related
      "phạt",
      "phạt tiền",
      "mức phạt",
      "xử phạt",
      "chế tài",
      "mức xử phạt",
      "tiền phạt",
      "bị phạt",
      "phạt bao nhiêu",
      "phạt bao nhiều",

      // English penalty related
      "fine",
      "penalty",
      "fine amount",
      "penalty amount",
      "punish",
      "punishment",
      "how much fine",
      "how much penalty",
      "sanction",
      "penalty fee",
      "ticket",
      "traffic ticket",
      "speeding ticket",
      "violation fee",
      "citation",

      // Vietnamese legal articles and regulations
      "điều",
      "khoản",
      "nghị định",
      "thông tư",
      "quyết định",
      "luật",
      "quy định",
      "theo quy định",
      "căn cứ",
      "pháp luật",

      // English legal articles and regulations
      "article",
      "clause",
      "decree",
      "circular",
      "decision",
      "law",
      "regulation",
      "according to regulation",
      "based on",
      "legal provision",
      "statute",
      "code",
      "traffic code",
      "motor vehicle code",
      "highway code",

      // Vietnamese traffic violations
      "không chấp hành hiệu lệnh của đèn tín hiệu giao thông",
      "vi phạm đèn tín hiệu",
      "đèn tín hiệu",
      "đèn đỏ",
      "đèn vàng",
      "đèn xanh",
      "vượt quá tốc độ quy định",
      "tốc độ",
      "chạy quá tốc độ",
      "điều khiển phương tiện trong tình trạng say rượu",
      "nồng độ cồn",
      "ma túy",
      "chất kích thích",
      "không đội mũ bảo hiểm",
      "mũ bảo hiểm",
      "thiết bị bảo hộ",
      "không thắt dây an toàn",
      "dây an toàn",
      "vượt xe",
      "vượt ẩu",
      "vượt không đúng quy định",
      "đi ngược chiều",
      "chạy ngược chiều",
      "lấn làn",
      "không đúng làn đường",
      "đậu xe sai quy định",
      "đỗ xe sai",
      "vi phạm đậu đỗ",

      // English traffic violations
      "running red light",
      "red light violation",
      "traffic light",
      "red light",
      "yellow light",
      "green light",
      "speeding",
      "speed limit",
      "over speed limit",
      "drunk driving",
      "alcohol concentration",
      "drug",
      "stimulant",
      "helmet violation",
      "not wearing helmet",
      "safety equipment",
      "seatbelt violation",
      "seat belt",
      "overtaking",
      "illegal overtaking",
      "wrong direction",
      "lane violation",
      "parking violation",
      "illegal parking",
      "no parking",
      "reckless driving",
      "careless driving",
      "dangerous driving",
      "improper driving",
      "traffic offense",
      "moving violation",
      "non-moving violation",
      "dui",
      "dwi",
      "breathalyzer",
      "blood alcohol",
      "bac",
      "alcohol level",
      "intoxicated driving",
      "impaired driving",

      // Vehicles and licenses (Vietnamese)
      "bằng lái xe",
      "giấy phép lái xe",
      "chứng chỉ lái xe",
      "xe máy",
      "ô tô",
      "xe hơi",
      "phương tiện",
      "xe cộ",
      "giao thông vận tải",

      // Vehicles and licenses (English)
      "driving license",
      "driver's license",
      "driver license",
      "motorcycle",
      "car",
      "vehicle",
      "traffic",
      "transportation",
      "motor vehicle",
      "automobile",
      "motorbike",
      "scooter",
      "moped",
      "truck",
      "bus",
      "commercial vehicle",

      // Age and license requirements (Vietnamese)
      "tuổi",
      "năm",
      "tuổi lái xe",
      "độ tuổi",
      "tối thiểu",
      "tối đa",
      "được phép",
      "không được phép",
      "đủ tuổi",
      "chưa đủ tuổi",

      // Age and license requirements (English)
      "age",
      "year",
      "years old",
      "driving age",
      "minimum age",
      "maximum age",
      "legal age",
      "old enough",
      "not old enough",
      "age requirement",
      "age limit",
      "eligible",
      "qualified",
      "permitted",
      "allowed",
      "authorized",

      // Common legal terms (Vietnamese)
      "tước quyền",
      "tạm giữ",
      "tịch thu",
      "buộc phải",
      "bắt buộc",
      "được phép",
      "không được phép",
      "cấm",
      "hạn chế",
      "vi phạm",
      "an toàn",
      "tai nạn",

      // Common legal terms (English)
      "revoke",
      "suspend",
      "confiscate",
      "mandatory",
      "required",
      "allowed",
      "not allowed",
      "prohibited",
      "restricted",
      "violation",
      "safety",
      "accident",
      "suspension",
      "revocation",
      "confiscation",
      "seizure",
      "impound",
      "forfeit",
    ];

    const foundKeywords: string[] = [];

    // Check for legal article references first
    const legalRef = LegalAnalyzer.extractLegalArticleReferences(query);
    if (legalRef.hasLegalReference) {
      legalRef.articles.forEach((num) => foundKeywords.push(`điều ${num}`));
      legalRef.clauses.forEach((num) => foundKeywords.push(`khoản ${num}`));
      legalRef.points.forEach((point) => foundKeywords.push(`điểm ${point}`));
      legalRef.decrees.forEach((num) => foundKeywords.push(`nghị định ${num}`));
      legalRef.circulars.forEach((num) =>
        foundKeywords.push(`thông tư ${num}`)
      );
      legalRef.decisions.forEach((num) =>
        foundKeywords.push(`quyết định ${num}`)
      );
    }

    // Extract core keywords that match the query (with automatic normalization)
    const matchingKeywords = coreKeywords.filter((keyword) => {
      const keywordLower = keyword.toLowerCase();
      const keywordNormalized =
        VietnameseTextProcessor.normalizeVietnamese(keywordLower);
      return (
        queryLower.includes(keywordLower) ||
        queryNormalized.includes(keywordNormalized)
      );
    });

    foundKeywords.push(...matchingKeywords);

    // Special handling for specific violation types
    LegalAnalyzer.addSpecialViolationKeywords(
      query,
      queryLower,
      queryNormalized,
      foundKeywords
    );

    // Remove duplicates and return
    return [...new Set(foundKeywords)];
  }

  /**
   * Add special violation-specific keywords
   */
  private static addSpecialViolationKeywords(
    query: string,
    queryLower: string,
    queryNormalized: string,
    foundKeywords: string[]
  ): void {
    // Traffic light violations
    if (
      queryNormalized.includes("vuot den do") ||
      queryLower.includes("vượt đèn đỏ") ||
      queryNormalized.includes("chay den do") ||
      queryLower.includes("chạy đèn đỏ") ||
      queryLower.includes("running red light") ||
      queryLower.includes("red light violation")
    ) {
      foundKeywords.push(
        "không chấp hành hiệu lệnh của đèn tín hiệu giao thông",
        "vi phạm đèn tín hiệu",
        "đèn tín hiệu",
        "đèn đỏ",
        "running red light",
        "red light violation",
        "traffic light"
      );
    }

    // Alcohol violations
    if (
      queryNormalized.includes("nong do con") ||
      queryLower.includes("nồng độ cồn") ||
      queryNormalized.includes("say ruou") ||
      queryLower.includes("say rượu") ||
      queryLower.includes("drunk driving") ||
      queryLower.includes("dui")
    ) {
      foundKeywords.push(
        "điều khiển phương tiện trong tình trạng say rượu",
        "nồng độ cồn",
        "ma túy",
        "chất kích thích",
        "drunk driving",
        "alcohol concentration",
        "blood alcohol"
      );
    }

    // Speed violations
    if (
      queryNormalized.includes("vuot toc do") ||
      queryLower.includes("vượt tốc độ") ||
      queryLower.includes("speeding") ||
      queryLower.includes("speed limit")
    ) {
      foundKeywords.push(
        "vượt quá tốc độ quy định",
        "tốc độ",
        "chạy quá tốc độ",
        "speeding",
        "speed limit",
        "over speed limit"
      );
    }

    // Helmet violations
    if (
      queryNormalized.includes("mu bao hiem") ||
      queryLower.includes("mũ bảo hiểm") ||
      queryLower.includes("helmet") ||
      queryLower.includes("not wearing helmet")
    ) {
      foundKeywords.push(
        "không đội mũ bảo hiểm",
        "mũ bảo hiểm",
        "thiết bị bảo hộ",
        "helmet violation",
        "not wearing helmet",
        "safety equipment"
      );
    }
  }

  /**
   * Extract legal article references from query
   */
  static extractLegalArticleReferences(query: string): LegalArticleReference {
    const articles: number[] = [];
    const clauses: number[] = [];
    const points: string[] = [];
    const decrees: number[] = [];
    const circulars: number[] = [];
    const decisions: number[] = [];

    // Vietnamese patterns
    const articlePattern = /điều\s+(\d+)/gi;
    const clausePattern = /khoản\s+(\d+)/gi;
    const pointPattern = /điểm\s+([a-z])\)/gi;
    const decreePattern = /nghị\s*định\s+(\d+)/gi;
    const circularPattern = /thông\s*tư\s+(\d+)/gi;
    const decisionPattern = /quyết\s*định\s+(\d+)/gi;

    // English patterns
    const articlePatternEn = /article\s+(\d+)/gi;
    const clausePatternEn = /clause\s+(\d+)/gi;
    const decreePatternEn = /decree\s+(\d+)/gi;

    // Extract matches
    let match;
    while ((match = articlePattern.exec(query)) !== null) {
      articles.push(parseInt(match[1]));
    }
    while ((match = articlePatternEn.exec(query)) !== null) {
      articles.push(parseInt(match[1]));
    }
    while ((match = clausePattern.exec(query)) !== null) {
      clauses.push(parseInt(match[1]));
    }
    while ((match = clausePatternEn.exec(query)) !== null) {
      clauses.push(parseInt(match[1]));
    }
    while ((match = pointPattern.exec(query)) !== null) {
      points.push(match[1]);
    }
    while ((match = decreePattern.exec(query)) !== null) {
      decrees.push(parseInt(match[1]));
    }
    while ((match = decreePatternEn.exec(query)) !== null) {
      decrees.push(parseInt(match[1]));
    }
    while ((match = circularPattern.exec(query)) !== null) {
      circulars.push(parseInt(match[1]));
    }
    while ((match = decisionPattern.exec(query)) !== null) {
      decisions.push(parseInt(match[1]));
    }

    return {
      articles: [...new Set(articles)],
      clauses: [...new Set(clauses)],
      points: [...new Set(points)],
      decrees: [...new Set(decrees)],
      circulars: [...new Set(circulars)],
      decisions: [...new Set(decisions)],
      hasLegalReference:
        articles.length > 0 ||
        clauses.length > 0 ||
        points.length > 0 ||
        decrees.length > 0 ||
        circulars.length > 0 ||
        decisions.length > 0,
    };
  }

  /**
   * Check if query is a legal/penalty related question
   */
  static isLegalPenaltyQuery(query: string): boolean {
    const queryLower = query.toLowerCase();
    const queryNormalized =
      VietnameseTextProcessor.normalizeVietnamese(queryLower);

    if (LegalAnalyzer.isLegalArticleSearchQuery(query)) {
      return true;
    }

    const penaltyIndicators = [
      "phạt",
      "mức phạt",
      "xử phạt",
      "tiền phạt",
      "bị phạt",
      "chế tài",
      "fine",
      "penalty",
      "punishment",
      "sanction",
      "ticket",
      "citation",
    ];

    const legalIndicators = [
      "điều",
      "khoản",
      "nghị định",
      "thông tư",
      "quyết định",
      "luật",
      "quy định",
      "article",
      "clause",
      "decree",
      "circular",
      "decision",
      "law",
      "regulation",
    ];

    const hasPenaltyIndicators = penaltyIndicators.some((indicator) => {
      const indicatorNormalized =
        VietnameseTextProcessor.normalizeVietnamese(indicator);
      return (
        queryLower.includes(indicator) ||
        queryNormalized.includes(indicatorNormalized)
      );
    });

    const hasLegalIndicators = legalIndicators.some((indicator) => {
      const indicatorNormalized =
        VietnameseTextProcessor.normalizeVietnamese(indicator);
      return (
        queryLower.includes(indicator) ||
        queryNormalized.includes(indicatorNormalized)
      );
    });

    return hasPenaltyIndicators || hasLegalIndicators;
  }

  /**
   * Check if query is a legal article search
   */
  static isLegalArticleSearchQuery(query: string): boolean {
    const legalRef = LegalAnalyzer.extractLegalArticleReferences(query);
    return legalRef.hasLegalReference;
  }
}
