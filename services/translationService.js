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
   * @param {string} sourceText
   * @param {string} sourceLang
   * @param {object|string} context - { genre: 'ancient'|'modern'|'xianxia'|'comedy', emotion: 'dramatic'|'deep_sorrow'|'fierce_battle'|'sweet_romance'|'heroic_command' }
   */
  async translateToKhmer(sourceText, sourceLang = 'auto', context = {}) {
    if (!this.apiKey) {
      return `[បកប្រែ] ${sourceText}`;
    }

    const candidateModels = [
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.7-flash',
      'gemini-flash-latest'
    ];

    const langNotice = (sourceLang === 'auto' || !sourceLang)
      ? 'from any spoken language (Chinese, English, Thai, Korean, Japanese, Vietnamese, French, Spanish, Hindi, etc.)'
      : `from ${sourceLang}`;

    // Extract genre and emotion settings
    const genre = (typeof context === 'object' && context.genre) ? context.genre : (typeof context === 'string' && context.includes('modern') ? 'modern' : 'ancient');
    const emotion = (typeof context === 'object' && context.emotion) ? context.emotion : 'dramatic';

    let genreGuideline = '';
    if (genre === 'modern') {
      genreGuideline = `SETTING: MODERN CONTEMPORARY / URBAN DRAMA / MODERN ROMANCE & ACTION.
- Tone: Modern Cambodian spoken vernacular.
- Pronouns & Titles: Use modern everyday address (បង, អូន, ឯង, ខ្ញុំ, លោក, អ្នកនាង, ចៅហ្វាយ, ប៉ូលីស, ពួកយើង...).
- STRICT: DO NOT use ancient royal/palace/dynasty terms (avoid: ទូលបង្គំ, ព្រះម្នាង, និកាយ).`;
    } else if (genre === 'comedy') {
      genreGuideline = `SETTING: COMEDY / LIGHTHEARTED ENTERTAINMENT.
- Tone: Funny, witty, theatrical conversational humor and entertaining exchanges.`;
    } else {
      // Default: Ancient / Xianxia / Wuxia / Imperial Palace
      genreGuideline = `SETTING: ANCIENT CHINESE DYNASTY / IMPERIAL PALACE / WUXIA & XIANXIA MARTIAL ARTS (រឿងចិនបុរាណ).
- Tone: Theatrical, poetic, royal, martial arts cinema style.
- Royal & Martial Titles: Strictly use authentic period honorifics (ទូលបង្គំ, ព្រះអង្គ, ព្រះរាជា, ព្រះម្នាង, លោកម្ចាស់, មេទ័ព, បងធំ, ចៅហ្វាយ, តាព្រឹទ្ធាចារ្យ, លោកយាយ, ចៅស្រី, សិស្សប្អូន, និកាយ, អ្នកក្លាហាន...).`;
    }

    let emotionGuideline = '';
    if (emotion === 'deep_sorrow') {
      emotionGuideline = `EMOTIONAL DELIVERY: DEEP SORROW, GRIEF & TEARS (មនោសញ្ចេតនាកម្សត់ ស្រក់ទឹកភ្នែក ឈឺចាប់ខ្លាំង).
- Infuse heartbreaking anguish, mournful cries, and gasping grief ("ឱព្រះអើយ!", "កុំចាកចោលខ្ញុំអី...", "ហ៊ឺ...", "ឈឺចាប់ខ្លាំងណាស់!", "ហេតុអ្វីទៅ?")`;
    } else if (emotion === 'fierce_battle') {
      emotionGuideline = `EMOTIONAL DELIVERY: FIERCE ANGER & BATTLE THREAT (ខឹងសម្បារ គំរាមកំហែង ច្បាំងប្រយុទ្ធ).
- Infuse fierce shouting, commanding fury, and intimidation ("ឈប់ភ្លាម!", "ឯងចង់ងាប់មែនទេ!", "កុំសង្ឃឹមថារួចខ្លួន!", "ឆាប់លើកដៃឡើង!")`;
    } else if (emotion === 'sweet_romance') {
      emotionGuideline = `EMOTIONAL DELIVERY: SWEET ROMANCE & TENDER PASSION (ស្នេហាផ្អែមល្ហែម ស្រទន់ រ៉ូមែនទិក).
- Infuse gentle, intimate, deeply affectionate whispers ("អូនសម្លាញ់...", "បងស្រឡាញ់អូនរហូត", "កុំភ័យអី បងនៅក្បែរអូនជានិច្ច")`;
    } else if (emotion === 'heroic_command') {
      emotionGuideline = `EMOTIONAL DELIVERY: HEROIC AUTHORITY & GENERAL COMMAND (អង់អាចក្លាហាន បញ្ជាកងទ័ព).
- Infuse commanding, fearless, resolute conviction.`;
    } else {
      emotionGuideline = `EMOTIONAL DELIVERY: TRUE THEATRICAL CINEMA ACTING (មនោសញ្ចេតនា និងអារម្មណ៍ពិតៗដូចរឿងកុន).
- Match the character's exact emotional urgency and genuine human feeling (anger, sorrow, romance, terror, or grief).
- Incorporate authentic emotional interjections: ឱ!, ឯង!, ឈប់ភ្លាម!, ហ៊ឺ..., ហេតុអ្វី?, មិនអាចទេ!, ព្រះអើយ!, ឆាប់ឡើង!`;
    }

    const prompt = `You are an elite, award-winning Cambodian cinema dubbing director and master dialogue translator.
Translate the following movie dialogue ${langNotice} directly into natural, deeply emotional, authentic, and theatrical spoken Khmer for voice dubbing.

${genreGuideline}

${emotionGuideline}

CRITICAL RULES:
1. INFUSE 100% GENUINE HUMAN EMOTION: The Khmer translation must sound like a real Cambodian veteran voice actor performing passionately, NEVER a robotic literal translation.
2. ACTOR BREATHING & RHYTHM: Use punctuation (!, ?, ..., ~) to direct the voice actor's breathing and passionate delivery.
3. ZERO FOREIGN RESIDUE: Absolutely NO Thai characters, NO Chinese characters, and NO English words. Only 100% pure spoken Khmer script.
4. Output ONLY the finalized Khmer dubbing line without explanation or markdown quotes.

Original Spoken Dialogue:
${sourceText}

Khmer Spoken Dubbing Translation:`;

    for (const modelName of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
        const res = await axios.post(url, {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }, {
          headers: { 'x-goog-api-key': this.apiKey, 'Content-Type': 'application/json' },
          timeout: 25000
        });

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
