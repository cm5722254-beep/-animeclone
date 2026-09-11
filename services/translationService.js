const axios = require('axios');

class TranslationService {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  /**
   * Cleans translation output: removes remaining Chinese/Thai characters, quotes, and markdown artifacts
   */
  cleanKhmerOutput(text) {
    if (!text) return '';
    let cleaned = text
      .replace(/[\u4e00-\u9fa5]/g, '')     // Strip Chinese characters
      .replace(/[\u0e00-\u0e7f]/g, '')     // Strip Thai characters
      .replace(/["“”«»`]/g, '')            // Strip surrounding quotes
      .replace(/^\[.*?\]/g, '')            // Strip [brackets]
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned || text.trim();
  }

  /**
   * Universal translation: Translate dialogue from ANY language (Chinese, English, Thai, Korean, Japanese, etc.) into authentic cinematic Khmer
   */
  async translateToKhmer(sourceText, sourceLang = 'auto', context = 'movie dialogue') {
    if (!this.apiKey) {
      return `[បកប្រែ] ${sourceText}`;
    }

    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-3.5-flash-lite',
      'gemini-flash-latest'
    ];

    const langNotice = (sourceLang === 'auto' || !sourceLang)
      ? 'from any spoken language (Chinese, English, Thai, Korean, Japanese, Vietnamese, French, Spanish, Hindi, etc.)'
      : `from ${sourceLang}`;

    const prompt = `You are an elite, award-winning Cambodian cinema dubbing director and master dialogue translator.
Translate the following movie/video dialogue ${langNotice} directly into natural, deeply emotional, authentic, and theatrical spoken Khmer for voice dubbing.

CRITICAL RULES:
1. INFUSE HIGH DRAMATIC PASSION: Match the character's exact emotional urgency (anger, sorrow, romance, commanding authority, terror, or grief).
2. USE AUTHENTIC KHMER CINEMA EXPRESSIONS: Incorporate authentic Cambodian cinema interjections and titles:
   - Interjections: ឱ!, ឯង!, ឈប់ភ្លាម!, ហ៊ឺ..., ហេតុអ្វី?, មិនអាចទេ!, ព្រះអើយ!, ឆាប់ឡើង!, កុំមកប៉ះពាល់!, ទេ...!, លាហើយ!
   - Royal/Martial Honorifics: ព្រះរាជា, ព្រះម្នាង, លោកម្ចាស់, មេទ័ព, បងធំ, ចៅហ្វាយ, តាព្រឹទ្ធាចារ្យ, លោកយាយ, ចៅស្រី, អ្នកក្លាហាន.
3. ADAPT FOR NATURAL ACTOR BREATHING: Use punctuation (!, ?, ..., ~) to direct the voice actor's breathing and passionate delivery.
4. ZERO FOREIGN RESIDUE: Absolutely NO Thai characters, NO Chinese characters, and NO English words. Only 100% pure spoken Khmer script.
5. Do NOT include explanations, markdown tags, or quotes. Output ONLY the finalized Khmer dubbing line.

Original Spoken Dialogue:
${sourceText}

Khmer Spoken Dubbing Translation:`;

    for (const modelName of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;
        const res = await axios.post(url, {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }, { timeout: 25000 });

        const rawTranslated = res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (rawTranslated) {
          return this.cleanKhmerOutput(rawTranslated);
        }
      } catch (err) {
        continue;
      }
    }
    return this.cleanKhmerOutput(sourceText);
  }

  /**
   * Backward compatible alias for Chinese -> Khmer
   */
  async translateChineseToKhmer(chineseText, context = 'movie dialogue') {
    return this.translateToKhmer(chineseText, 'zh', context);
  }
}

module.exports = TranslationService;
