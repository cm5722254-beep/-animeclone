const axios = require('axios');

class TranslationService {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
  }

  setApiKey(key) {
    this.apiKey = key;
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

    const prompt = `You are an award-winning Cambodian cinema dubbing director and dialogue scriptwriter.
Translate the following movie/video dialogue ${langNotice} directly into natural, deeply emotional, authentic, and theatrical spoken Khmer for voice dubbing.
Infuse the character's full dramatic emotional passion (anger, sorrow, romance, commanding authority, terror, or grief).
Use authentic Khmer cinema expressions and emotional intonations (such as: ឱ!, ឯង!, ឈប់ភ្លាម!, ហ៊ឺ..., ហេតុអ្វី?, មិនអាចទេ!, ព្រះអើយ!, ឆាប់ឡើង!).
Use punctuation (!, ?, ..., ~) to direct the voice actor's breathing and passionate delivery.
Only return the translated Khmer text without extra explanation or quotes.

Original Spoken Dialogue:
${sourceText}

Khmer Translation:`;

    for (const modelName of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;
        const res = await axios.post(url, {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }, { timeout: 25000 });

        const translated = res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (translated) return translated;
      } catch (err) {
        continue;
      }
    }
    return sourceText;
  }

  /**
   * Backward compatible alias for Chinese -> Khmer
   */
  async translateChineseToKhmer(chineseText, context = 'movie dialogue') {
    return this.translateToKhmer(chineseText, 'zh', context);
  }
}

module.exports = TranslationService;
