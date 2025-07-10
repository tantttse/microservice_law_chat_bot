// Traffic law detection and message analysis

import { VietnameseTextProcessor } from "./vietnamese-processor";
import { LegalAnalyzer } from "./legal-analyzer";
import { ConversationMessage } from "./types";

export class TrafficLawDetector {
  /**
   * Check if a question is related to traffic law
   */
  static isTrafficLawRelated(
    question: string,
    conversationHistory: ConversationMessage[] = []
  ): boolean {
    // Core traffic law keywords - focus on the most essential terms
    const coreTrafficKeywords = [
      // English terms
      "traffic",
      "driving",
      "speed",
      "limit",
      "license",
      "vehicle",
      "road",
      "highway",
      "parking",
      "violation",
      "fine",
      "penalty",
      "law",
      "regulation",
      "motorcycle",
      "car",
      "helmet",
      "seatbelt",
      "signal",
      "intersection",
      "overtaking",
      "drunk driving",
      "article",
      "clause",
      "decree",
      "circular",
      "decision",
      "speeding",
      "red light",
      "running red light",
      "alcohol",
      "breathalyzer",
      "blood alcohol",
      "dui",
      "dwi",
      "ticket",
      "citation",
      "fine amount",
      "penalty amount",
      "age requirement",
      "minimum age",
      "legal age",
      "driving age",
      "years old",
      "year old",
      "old enough",
      "how old",
      "drink and drive",
      "drinking and driving",
      "blood alcohol",
      "blood level",
      "safety equipment",
      "safety requirements",
      "equipment requirements",
      "safety gear",
      "protective equipment",
      "caught",
      "refuse",
      "night",
      "rush hour",
      "foreigners",
      "children",
      "learning",
      "start",
      "daughter",
      "son",
      "appeal",

      // Vietnamese core terms (both with and without tone marks)
      "giao thông",
      "giao thong",
      "lái xe",
      "lai xe",
      "tốc độ",
      "toc do",
      "bằng lái",
      "bang lai",
      "xe cộ",
      "xe co",
      "đường",
      "duong",
      "cao tốc",
      "cao toc",
      "đậu xe",
      "dau xe",
      "vi phạm",
      "vi pham",
      "phạt",
      "phat",
      "luật",
      "luat",
      "quy định",
      "quy dinh",
      "xe máy",
      "xe may",
      "ô tô",
      "o to",
      "mũ bảo hiểm",
      "mu bao hiem",
      "nón bảo hiểm",
      "non bao hiem",
      "dây an toàn",
      "day an toan",
      "tín hiệu",
      "tin hieu",
      "giao lộ",
      "giao lo",
      "vượt xe",
      "vuot xe",
      "say rượu",
      "say ruou",
      "tuổi",
      "tuoi",
      "điều",
      "dieu",
      "khoản",
      "khoan",
      "điểm",
      "diem",
      "nghị định",
      "nghi dinh",
      "nồng độ cồn",
      "nong do con",
      "độ cồn",
      "do con",
      "trong máu",
      "trong mau",
      "thiết bị an toàn",
      "thiet bi an toan",
      "thiết bị",
      "thiet bi",
      "an toàn",
      "an toan",
      "bảo hiểm",
      "bao hiem",
      "uống rượu",
      "uong ruou",
      "rượu bia",
      "ruou bia",
      "bị bắt",
      "bi bat",
      "từ chối",
      "tu choi",
      "trả",
      "tra",
      "đêm",
      "dem",
      "giờ cao điểm",
      "gio cao diem",
      "người nước ngoài",
      "nguoi nuoc ngoai",
      "trẻ em",
      "tre em",
      "học",
      "hoc",
      "bắt đầu",
      "bat dau",
      "con gái",
      "con gai",
      "con trai",
      "khiếu nại",
      "khieu nai",
      "quyết định",
      "quyet dinh",
      "địa điểm",
      "dia diem",

      // Traffic violations - common short phrases
      "vượt đèn đỏ",
      "vuot den do",
      "vượt đèn",
      "vuot den",
      "đèn đỏ",
      "den do",
      "đèn tín hiệu",
      "den tin hieu",
      "chạy quá tốc độ",
      "chay qua toc do",
      "quá tốc độ",
      "qua toc do",
      "không đội mũ",
      "khong doi mu",
      "không thắt dây",
      "khong that day",
      "uống rượu lái xe",
      "uong ruou lai xe",
      "say xỉn",
      "say xin",
      "bằng lái xe",
      "bang lai xe",
      "giấy phép lái xe",
      "giay phep lai xe",
      "đậu xe sai",
      "dau xe sai",
      "vi phạm giao thông",
      "vi pham giao thong",

      // Single word traffic terms that are clearly traffic related
      "đèn",
      "den",
      "rượu",
      "ruou",
      "bia",
      "cồn",
      "con",
      "mũ",
      "mu",
      "nón",
      "non",
      "lái",
      "lai",
      "xe",
      "vượt",
      "vuot",
      "phạt",
      "phat",
      "bằng",
      "bang",
      "giấy",
      "giay",
      "phép",
      "phep",

      // Numbers that commonly appear in traffic contexts
      "168",
      "100",
      "15",
      "18",
      "16",
      "điều",
      "dieu",
    ];

    // Check if it's a greeting first
    if (TrafficLawDetector.isGreetingMessage(question)) {
      return true; // Greetings are handled specially
    }

    // Check if it's a legal penalty query
    if (LegalAnalyzer.isLegalPenaltyQuery(question)) {
      return true;
    }

    const questionLower = question.toLowerCase();
    const questionNormalized =
      VietnameseTextProcessor.normalizeVietnamese(questionLower);

    // Check if question matches any core traffic keywords
    const hasTrafficKeywords = coreTrafficKeywords.some((keyword) => {
      const keywordLower = keyword.toLowerCase();
      const keywordNormalized =
        VietnameseTextProcessor.normalizeVietnamese(keywordLower);

      // For single-word keywords, use word boundary matching to avoid false positives
      if (keyword.indexOf(" ") === -1) {
        const wordBoundaryRegex = new RegExp(`\\b${keywordLower}\\b`, "i");
        const wordBoundaryRegexNormalized = new RegExp(
          `\\b${keywordNormalized}\\b`,
          "i"
        );
        return (
          wordBoundaryRegex.test(questionLower) ||
          wordBoundaryRegexNormalized.test(questionNormalized)
        );
      }

      // For multi-word keywords, use regular inclusion matching
      return (
        questionLower.includes(keywordLower) ||
        questionNormalized.includes(keywordNormalized)
      );
    });

    if (hasTrafficKeywords) {
      return true;
    }

    // Check for contextual traffic patterns (natural language questions)
    const trafficPatterns = [
      // Age-related driving questions
      /\b\d+\s+year\s+old.*drive/i,
      /how\s+old.*drive/i,
      /\b\d+\s+tuoi.*lai\s+xe/i,
      /bao\s+nhieu\s+tuoi.*lai/i,
      /\b\d+.*can.*start.*learning/i,
      /\b\d+.*co.*the.*bat.*dau.*hoc/i,

      // Alcohol and driving combinations
      /drink.*drive/i,
      /drinking.*driving/i,
      /alcohol.*driving/i,
      /ruou.*lai\s+xe/i,
      /uong.*lai\s+xe/i,

      // Safety equipment in context
      /safety.*equipment/i,
      /equipment.*requirement/i,
      /thiet\s+bi.*an\s+toan/i,

      // General driving context
      /drive.*vietnam/i,
      /driving.*vietnam/i,
      /lai\s+xe.*viet\s+nam/i,

      // Blood alcohol context
      /blood.*alcohol/i,
      /alcohol.*blood/i,
      /nong\s+do.*con/i,
      /con.*mau/i,

      // Implicit traffic situations
      /what.*happens.*if.*get.*caught/i,
      /neu.*bi.*bat.*thi.*sao/i,
      /much.*need.*pay/i,
      /phai.*tra.*bao.*nhieu/i,
      /what.*about.*night/i,
      /rush.*hour/i,
      /gio.*cao.*diem/i,
      /about.*foreigners/i,
      /nguoi.*nuoc.*ngoai/i,
      /about.*children/i,
      /tre.*em.*thi.*sao/i,
      /happens.*if.*refuse/i,
      /tu.*choi.*thi.*sao/i,
      /where.*pay.*fine/i,
      /dong.*phat.*o.*dau/i,

      // Simple traffic violation patterns
      /vuot.*den.*do/i,
      /vượt.*đèn.*đỏ/i,
      /den.*do/i,
      /đèn.*đỏ/i,
      /qua.*toc.*do/i,
      /quá.*tốc.*độ/i,
      /chay.*qua.*toc/i,
      /chạy.*quá.*tốc/i,
      /khong.*doi.*mu/i,
      /không.*đội.*mũ/i,
      /khong.*that.*day/i,
      /không.*thắt.*dây/i,
      /uong.*ruou.*lai/i,
      /uống.*rượu.*lái/i,
      /say.*ruou/i,
      /say.*rượu/i,
      /say.*xin/i,
      /say.*xỉn/i,
      /bang.*lai/i,
      /bằng.*lái/i,
      /giay.*phep/i,
      /giấy.*phép/i,
      /dau.*xe.*sai/i,
      /đậu.*xe.*sai/i,
      /vi.*pham/i,
      /vi.*phạm/i,

      // Single word patterns that are clearly traffic related
      /^vuot$/i,
      /^vượt$/i,
      /^den$/i,
      /^đèn$/i,
      /^ruou$/i,
      /^rượu$/i,
      /^mu$/i,
      /^mũ$/i,
      /^phat$/i,
      /^phạt$/i,
      /^lai$/i,
      /^lái$/i,
    ];

    const hasTrafficPattern = trafficPatterns.some(
      (pattern) =>
        pattern.test(questionLower) || pattern.test(questionNormalized)
    );

    if (hasTrafficPattern) {
      return true;
    }

    // Special handling for very short phrases that might be traffic violations
    const shortTrafficPhrases = [
      "vuot den do",
      "vượt đèn đỏ",
      "vuot den",
      "vượt đèn",
      "den do",
      "đèn đỏ",
      "qua toc do",
      "quá tốc độ",
      "chay qua toc",
      "chạy quá tốc",
      "khong doi mu",
      "không đội mũ",
      "khong that day",
      "không thắt dây",
      "uong ruou lai",
      "uống rượu lái",
      "say ruou",
      "say rượu",
      "say xin",
      "say xỉn",
      "bang lai",
      "bằng lái",
      "giay phep",
      "giấy phép",
      "dau xe sai",
      "đậu xe sai",
      "vi pham",
      "vi phạm",
      "phat tien",
      "phạt tiền",
      "muc phat",
      "mức phạt",
      "toc do",
      "tốc độ",
      "giao thong",
      "giao thông",
      "lai xe",
      "lái xe",
      "xe may",
      "xe máy",
      "o to",
      "ô tô",
      "mu bao hiem",
      "mũ bảo hiểm",
      "day an toan",
      "dây an toàn",
      "luat giao thong",
      "luật giao thông",
      "nghi dinh",
      "nghị định",
      "nong do con",
      "nồng độ cồn",
      "trong mau",
      "trong máu",
      "thiet bi an toan",
      "thiết bị an toàn",
    ];

    const questionWords = questionLower.split(/\s+/);
    const questionNormalizedWords = questionNormalized.split(/\s+/);

    // Check if the question contains any of the short traffic phrases
    const hasShortTrafficPhrase = shortTrafficPhrases.some((phrase) => {
      const phraseWords = phrase.split(/\s+/);
      const phraseNormalized =
        VietnameseTextProcessor.normalizeVietnamese(phrase);
      const phraseNormalizedWords = phraseNormalized.split(/\s+/);

      // Check if all words of the phrase are present in the question
      return (
        phraseWords.every((word) => questionWords.includes(word)) ||
        phraseNormalizedWords.every((word) =>
          questionNormalizedWords.includes(word)
        )
      );
    });

    if (hasShortTrafficPhrase) {
      return true;
    }

    // Check for follow-up questions with conversation context
    const followUpIndicators = [
      "vậy",
      "vay",
      "thế",
      "the",
      "còn",
      "con",
      "và",
      "va",
      "how about",
      "what about",
      "then",
      "so",
      "như thế nào",
      "nhu the nao",
      "sao",
      "tại sao",
      "tai sao",
      "why",
      "when",
      "khi nào",
      "khi nao",
      "bao nhiêu",
      "bao nhieu",
      "how much",
      "how many",
      "có được không",
      "co duoc khong",
      "được không",
      "duoc khong",
      "can I",
      "may I",
      "and",
      "at",
      "during",
      "trong",
      "khi",
      "lúc",
      "luc",
    ];

    const isFollowUp = followUpIndicators.some((indicator) => {
      const indicatorNormalized =
        VietnameseTextProcessor.normalizeVietnamese(indicator);
      return (
        questionLower.includes(indicator) ||
        questionNormalized.includes(indicatorNormalized)
      );
    });

    if (isFollowUp && conversationHistory.length > 0) {
      // Check if recent conversation was about traffic law
      const recentMessages = conversationHistory.slice(-3);
      return recentMessages.some(
        (msg) =>
          TrafficLawDetector.isTrafficLawRelated(msg.question, []) ||
          TrafficLawDetector.isTrafficLawRelated(msg.answer, [])
      );
    }

    return false;
  }

  /**
   * Check if a message is a greeting
   */
  static isGreetingMessage(question: string): boolean {
    const greetingPatterns = [
      // English greetings
      "hello",
      "hi",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "how are you",
      "what's up",
      "greetings",
      "nice to meet you",
      "howdy",
      "good day",
      "welcome",

      // Vietnamese greetings
      "xin chào",
      "chào",
      "chào bạn",
      "chào anh",
      "chào chị",
      "chào em",
      "bạn có khỏe không",
      "bạn thế nào",
      "hôm nay thế nào",
      "chúc ngày tốt lành",
      "chào buổi sáng",
      "chào buổi chiều",
      "chào buổi tối",
      "rất vui được gặp bạn",
      "xin chao",
      "chao",
      "chao ban",
      "chao anh",
      "chao chi",
      "chao em",
      "ban co khoe khong",
      "ban the nao",
      "hom nay the nao",
      "chuc ngay tot lanh",
      "chao buoi sang",
      "chao buoi chieu",
      "chao buoi toi",
      "rat vui duoc gap ban",
    ];

    const questionLower = question.toLowerCase().trim();
    const questionNormalized =
      VietnameseTextProcessor.normalizeVietnamese(questionLower);

    return greetingPatterns.some((greeting) => {
      const greetingLower = greeting.toLowerCase();
      const greetingNormalized =
        VietnameseTextProcessor.normalizeVietnamese(greetingLower);

      return (
        questionLower === greetingLower ||
        questionLower === greetingLower + "!" ||
        questionLower === greetingLower + "." ||
        questionLower === greetingLower + "?" ||
        questionNormalized === greetingNormalized ||
        questionNormalized === greetingNormalized + "!" ||
        questionNormalized === greetingNormalized + "." ||
        questionNormalized === greetingNormalized + "?" ||
        // Allow some simple follow-ups like "hello there", "hi how are you"
        (questionLower.startsWith(greetingLower + " ") &&
          questionLower.split(" ").length <= 4) ||
        (questionNormalized.startsWith(greetingNormalized + " ") &&
          questionNormalized.split(" ").length <= 4)
      );
    });
  }
}
