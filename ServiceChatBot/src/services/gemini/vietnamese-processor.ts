// Vietnamese text processing utilities

export class VietnameseTextProcessor {
  private static readonly TONE_MAPPINGS: { [key: string]: string } = {
    // a vowels
    à: "a",
    á: "a",
    ạ: "a",
    ả: "a",
    ã: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ậ: "a",
    ẩ: "a",
    ẫ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ặ: "a",
    ẳ: "a",
    ẵ: "a",
    // e vowels
    è: "e",
    é: "e",
    ẹ: "e",
    ẻ: "e",
    ẽ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ệ: "e",
    ể: "e",
    ễ: "e",
    // i vowels
    ì: "i",
    í: "i",
    ị: "i",
    ỉ: "i",
    ĩ: "i",
    // o vowels
    ò: "o",
    ó: "o",
    ọ: "o",
    ỏ: "o",
    õ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ộ: "o",
    ổ: "o",
    ỗ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ợ: "o",
    ở: "o",
    ỡ: "o",
    // u vowels
    ù: "u",
    ú: "u",
    ụ: "u",
    ủ: "u",
    ũ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ự: "u",
    ử: "u",
    ữ: "u",
    // y vowels
    ỳ: "y",
    ý: "y",
    ỵ: "y",
    ỷ: "y",
    ỹ: "y",
    // đ consonant
    đ: "d",
    // uppercase versions
    À: "A",
    Á: "A",
    Ạ: "A",
    Ả: "A",
    Ã: "A",
    Â: "A",
    Ầ: "A",
    Ấ: "A",
    Ậ: "A",
    Ẩ: "A",
    Ẫ: "A",
    Ă: "A",
    Ằ: "A",
    Ắ: "A",
    Ặ: "A",
    Ẳ: "A",
    Ẵ: "A",
    È: "E",
    É: "E",
    Ẹ: "E",
    Ẻ: "E",
    Ẽ: "E",
    Ê: "E",
    Ề: "E",
    Ế: "E",
    Ệ: "E",
    Ể: "E",
    Ễ: "E",
    Ì: "I",
    Í: "I",
    Ị: "I",
    Ỉ: "I",
    Ĩ: "I",
    Ò: "O",
    Ó: "O",
    Ọ: "O",
    Ỏ: "O",
    Õ: "O",
    Ô: "O",
    Ồ: "O",
    Ố: "O",
    Ộ: "O",
    Ổ: "O",
    Ỗ: "O",
    Ơ: "O",
    Ờ: "O",
    Ớ: "O",
    Ợ: "O",
    Ở: "O",
    Ỡ: "O",
    Ù: "U",
    Ú: "U",
    Ụ: "U",
    Ủ: "U",
    Ũ: "U",
    Ư: "U",
    Ừ: "U",
    Ứ: "U",
    Ự: "U",
    Ử: "U",
    Ữ: "U",
    Ỳ: "Y",
    Ý: "Y",
    Ỵ: "Y",
    Ỷ: "Y",
    Ỹ: "Y",
    Đ: "D",
  };

  private static readonly VIETNAMESE_CHARS =
    /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;

  private static readonly VIETNAMESE_WORDS = [
    "xin",
    "chao",
    "ban",
    "anh",
    "chi",
    "em",
    "khoe",
    "khong",
    "the",
    "nao",
    "hom",
    "nay",
    "buoi",
    "sang",
    "chieu",
    "toi",
    "vui",
    "duoc",
    "gap",
    "chuc",
    "ngay",
    "tot",
    "lanh",
    "rat",
    "giao",
    "thong",
    "luat",
    "phat",
    "vi",
    "pham",
    "muc",
    "tien",
    "dong",
    "bao",
    "nhieu",
    "den",
    "do",
    "vuot",
    "cham",
    "toc",
    "do",
    "khong",
    "doi",
    "mu",
    "bao",
    "hiem",
  ];

  /**
   * Normalize Vietnamese text by removing tone marks for better matching
   */
  static normalizeVietnamese(text: string): string {
    if (!text) return "";

    return text
      .split("")
      .map((char) => VietnameseTextProcessor.TONE_MAPPINGS[char] || char)
      .join("");
  }

  /**
   * Detect if text is primarily Vietnamese
   */
  static isVietnameseText(text: string): boolean {
    const textLower = text.toLowerCase();

    // Check for Vietnamese characters
    if (VietnameseTextProcessor.VIETNAMESE_CHARS.test(text)) {
      return true;
    }

    // Check for Vietnamese words
    const words = textLower.split(/\s+/);
    const vietnameseWordCount = words.filter((word) =>
      VietnameseTextProcessor.VIETNAMESE_WORDS.includes(
        word.replace(/[^\w]/g, "")
      )
    ).length;

    // If more than 30% of words are Vietnamese, consider it Vietnamese
    return vietnameseWordCount > 0 && vietnameseWordCount / words.length > 0.3;
  }
}
