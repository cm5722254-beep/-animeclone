const axios = require('axios');

class TranslationService {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  /**
   * Translate Chinese script to Khmer with cinematic dialogue adaptation
   */
  async translateChineseToKhmer(chineseText, context = 'movie dialogue') {
    if (!this.apiKey) {
      // If no API key is provided, provide a helpful note or fallback
      return `[បកប្រែ] ${chineseText}`;
    }

    const candidateModels = [
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.7-flash',
      'gemini-flash-latest',
      'gemini-3.6-flash'
    ];

    const prompt = `You are an award-winning Khmer movie dubbing director and dialogue scriptwriter.
Translate the following Chinese movie dialogue directly into natural, deeply emotional, and theatrical spoken Khmer for voice dubbing.
Infuse the character's full dramatic emotional passion (anger, sorrow, romance, commanding authority, terror, or grief).
Use authentic Khmer cinema expressions and emotional intonations (such as: ឱ!, ឯង!, ឈប់ភ្លាម!, ហ៊ឺ..., ហេតុអ្វី?, មិនអាចទេ!, ព្រះអើយ!).
Use punctuation (!, ?, ..., ~) to direct the voice actor's breathing and passionate delivery.
Only return the translated Khmer text without extra explanation or quotes.

Original Chinese:
${chineseText}

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
        // Try next model if 429 or 503
        continue;
      }
    }
    return chineseText;
  }
}

module.exports = TranslationService;
