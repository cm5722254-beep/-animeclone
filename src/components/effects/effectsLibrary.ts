/**
 * CHEATZ DABBER PRO - 100+ Professional Effects, LUTs, Subtitle Styles & Audio Presets Library
 */

export interface LutPreset {
  id: string;
  label: string;
  category: 'Cinematic' | 'Anime & Drama' | 'Vintage & Film' | 'Atmospheric & Sci-Fi';
  cssFilter: string;
  icon?: string;
  description: string;
}

export interface SubtitlePreset {
  id: string;
  label: string;
  category: 'Donghua & Theatrical' | 'Modern & Streaming' | 'Anime & Neon' | 'Creative & Aesthetic';
  fontSize: number;
  fontFamily: string;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  backgroundColor: string;
  textShadow?: string;
  animation?: 'none' | 'pop' | 'karaoke';
  description: string;
}

export interface AudioEffectPreset {
  id: string;
  label: string;
  category: 'Vocal EQ' | 'Cinema & Ambience' | 'Special & Vintage';
  description: string;
  pitchAdjust: string;
  rateAdjust: string;
  volumeBoost: number;
}

// -------------------------------------------------------------
// 1. 40+ Color Grading LUTs & Visual Filter Presets
// -------------------------------------------------------------
export const LUT_PRESETS: LutPreset[] = [
  // Cinematic
  { id: 'none', label: 'ធម្មជាតិដើម (Default Natural)', category: 'Cinematic', cssFilter: 'none', description: 'Original unedited video stream' },
  { id: 'teal_orange', label: '🎬 Hollywood Teal & Orange', category: 'Cinematic', cssFilter: 'hue-rotate(15deg) contrast(115%) saturate(125%)', description: 'The gold standard Hollywood blockbuster grading' },
  { id: 'warm_film', label: '🌅 Warm 35mm Cinema', category: 'Cinematic', cssFilter: 'sepia(20%) saturate(120%) contrast(108%)', description: 'Rich golden cinema tones with subtle warmth' },
  { id: 'moody_noir', label: '🎞️ Moody Noir Mystery', category: 'Cinematic', cssFilter: 'grayscale(75%) contrast(145%) brightness(95%)', description: 'Dark, gritty, high-contrast detective drama' },
  { id: 'golden_hour', label: '🌇 Sunset Golden Hour', category: 'Cinematic', cssFilter: 'sepia(35%) saturate(140%) contrast(110%) brightness(105%)', description: 'Lush golden sunset lighting' },
  { id: 'dramatic_contrast', label: '💥 High-Contrast Action', category: 'Cinematic', cssFilter: 'contrast(135%) saturate(110%) brightness(98%)', description: 'Punchy action movie dynamics' },
  { id: 'nordic_cold', label: '❄️ Nordic Cold Thriller', category: 'Cinematic', cssFilter: 'hue-rotate(185deg) contrast(112%) saturate(90%)', description: 'Chilling Scandinavian thriller atmosphere' },
  { id: 'bleach_bypass', label: '⚔️ War Movie Bleach Bypass', category: 'Cinematic', cssFilter: 'contrast(140%) saturate(60%) brightness(96%)', description: 'Gritty Saving Private Ryan style' },
  { id: 'monochrome_epic', label: '🏛️ Epic Black & Silver', category: 'Cinematic', cssFilter: 'grayscale(100%) contrast(135%) brightness(105%)', description: 'Timeless cinematic monochrome' },
  { id: 'royal_palace', label: '👑 Imperial Palace Gold', category: 'Cinematic', cssFilter: 'sepia(30%) saturate(135%) contrast(115%) hue-rotate(5deg)', description: 'Luxurious Asian royal palace aesthetic' },

  // Anime & Drama
  { id: 'vibrant_anime', label: '✨ Vibrant 3D Donghua', category: 'Anime & Drama', cssFilter: 'saturate(155%) contrast(118%) brightness(104%)', description: 'Saturated, hyper-vivid anime colors' },
  { id: 'dreamy_pastel', label: '🌸 Dreamy Romance Pastel', category: 'Anime & Drama', cssFilter: 'saturate(115%) contrast(92%) brightness(110%)', description: 'Soft, airy, romantic K-drama glow' },
  { id: 'emerald_fantasy', label: '🐉 Emerald Spirit Dragon', category: 'Anime & Drama', cssFilter: 'hue-rotate(75deg) saturate(130%) contrast(110%)', description: 'Mystical jade fantasy realm' },
  { id: 'cherry_blossom', label: '🌺 Cherry Blossom Spring', category: 'Anime & Drama', cssFilter: 'hue-rotate(330deg) saturate(125%) brightness(106%)', description: 'Delicate pink and floral tones' },
  { id: 'shonen_power', label: '⚡ Shonen Battle Spark', category: 'Anime & Drama', cssFilter: 'contrast(128%) saturate(145%) brightness(102%)', description: 'High-energy fighting animation grading' },
  { id: 'velvet_crimson', label: '🌹 Crimson Romance Drama', category: 'Anime & Drama', cssFilter: 'hue-rotate(345deg) saturate(135%) contrast(112%)', description: 'Deep emotional drama with rich reds' },
  { id: 'pastel_sky', label: '☁️ Makoto Shinkai Sky', category: 'Anime & Drama', cssFilter: 'saturate(140%) contrast(108%) brightness(108%) hue-rotate(200deg)', description: 'Iconic anime blue sky and radiant clouds' },
  { id: 'dark_martial', label: '🥋 Wuxia Shadow Blade', category: 'Anime & Drama', cssFilter: 'contrast(130%) saturate(85%) brightness(92%)', description: 'Classic martial arts martial clan aura' },
  { id: 'golden_qi', label: '✨ Golden Qi Cultivation', category: 'Anime & Drama', cssFilter: 'sepia(40%) saturate(150%) brightness(108%) contrast(115%)', description: 'Spiritual power and ascension brilliance' },
  { id: 'ghost_lantern', label: '🏮 Lantern Night Festival', category: 'Anime & Drama', cssFilter: 'contrast(122%) saturate(130%) hue-rotate(15deg) brightness(98%)', description: 'Warm lantern-lit ancient night market' },

  // Vintage & Film
  { id: 'retro_vhs', label: '📼 1990s VHS Nostalgia', category: 'Vintage & Film', cssFilter: 'sepia(25%) contrast(115%) saturate(130%) hue-rotate(-10deg)', description: 'Warm videotape color bleeding' },
  { id: 'super8_film', label: '📽️ Super 8mm Home Movie', category: 'Vintage & Film', cssFilter: 'sepia(45%) saturate(110%) contrast(120%) brightness(102%)', description: 'Organic vintage 1970s film grain look' },
  { id: 'kodachrome', label: '📸 Kodachrome 64 Classic', category: 'Vintage & Film', cssFilter: 'saturate(135%) contrast(122%) hue-rotate(5deg)', description: 'Rich vintage national geographic colors' },
  { id: 'fuji_velvia', label: '🏔️ Fuji Velvia 50 Landscape', category: 'Vintage & Film', cssFilter: 'saturate(150%) contrast(125%)', description: 'Punchy greens, deep blues and rich reds' },
  { id: 'technicolor', label: '🎨 1950s Technicolor Glory', category: 'Vintage & Film', cssFilter: 'saturate(160%) contrast(118%) brightness(102%)', description: 'Hyper-real golden age of cinema' },
  { id: 'sepia_antique', label: '📜 Antique 1920s Sepia', category: 'Vintage & Film', cssFilter: 'sepia(85%) contrast(110%) brightness(94%)', description: 'Authentic 100-year-old silent era photograph' },
  { id: 'polaroid', label: '📷 Instant Polaroid Camera', category: 'Vintage & Film', cssFilter: 'contrast(108%) saturate(110%) sepia(18%) brightness(106%)', description: 'Nostalgic faded border tone' },
  { id: 'film_noir_pure', label: '🕵️ Classic 1940s Film Noir', category: 'Vintage & Film', cssFilter: 'grayscale(100%) contrast(155%) brightness(90%)', description: 'Deep shadows, bright streetlights' },
  { id: 'indie_film', label: '☕ Sundance Indie Warmth', category: 'Vintage & Film', cssFilter: 'sepia(15%) saturate(112%) contrast(106%)', description: 'Naturalistic independent film grading' },
  { id: 'hk_80s', label: '🇭🇰 Hong Kong Cinema 1980s', category: 'Vintage & Film', cssFilter: 'contrast(120%) saturate(135%) hue-rotate(10deg)', description: 'Wong Kar-wai neon melancholy' },

  // Atmospheric & Sci-Fi
  { id: 'cyberpunk_neon', label: '🌆 Cyberpunk Neon City', category: 'Atmospheric & Sci-Fi', cssFilter: 'hue-rotate(285deg) saturate(170%) contrast(130%)', description: 'High-tech neon purple and cyan' },
  { id: 'matrix_code', label: '🟢 Matrix Digital Stream', category: 'Atmospheric & Sci-Fi', cssFilter: 'hue-rotate(95deg) saturate(140%) contrast(125%) brightness(95%)', description: 'Surreal digital green universe' },
  { id: 'blade_runner', label: '🌧️ Dystopian Smog & Rain', category: 'Atmospheric & Sci-Fi', cssFilter: 'hue-rotate(170deg) contrast(120%) saturate(110%) brightness(90%)', description: 'Gloomy neon rain aesthetic' },
  { id: 'mars_colony', label: '🔴 Red Planet Martian Dust', category: 'Atmospheric & Sci-Fi', cssFilter: 'sepia(60%) hue-rotate(330deg) saturate(150%) contrast(115%)', description: 'Desolate red atmospheric dust' },
  { id: 'deep_abyss', label: '🌊 Deep Ocean Abyss', category: 'Atmospheric & Sci-Fi', cssFilter: 'hue-rotate(190deg) saturate(120%) contrast(125%) brightness(88%)', description: 'Mysterious dark underwater blue' },
  { id: 'horror_mist', label: '👻 Haunted Mist & Fog', category: 'Atmospheric & Sci-Fi', cssFilter: 'grayscale(50%) contrast(130%) brightness(85%) hue-rotate(180deg)', description: 'Creepy desaturated horror atmosphere' },
  { id: 'solar_flare', label: '☀️ Solar Flare Radiance', category: 'Atmospheric & Sci-Fi', cssFilter: 'sepia(35%) brightness(115%) contrast(110%) saturate(130%)', description: 'Overexposed blinding summer brilliance' },
  { id: 'hologram_cyan', label: '💎 Holographic HUD Screen', category: 'Atmospheric & Sci-Fi', cssFilter: 'hue-rotate(160deg) saturate(180%) brightness(105%) contrast(120%)', description: 'Futuristic sci-fi terminal projection' },
  { id: 'midnight_blue', label: '🌙 Velvet Midnight Moonlight', category: 'Atmospheric & Sci-Fi', cssFilter: 'hue-rotate(210deg) saturate(110%) contrast(120%) brightness(92%)', description: 'Cool cinematic night illumination' },
  { id: 'autumn_ember', label: '🍁 Autumn Leaves & Fireside', category: 'Atmospheric & Sci-Fi', cssFilter: 'sepia(35%) saturate(145%) contrast(112%) hue-rotate(10deg)', description: 'Cozy fireplace and falling foliage' }
];

// -------------------------------------------------------------
// 2. 40+ Subtitle Theatrical Styles & Typography Presets
// -------------------------------------------------------------
export const SUBTITLE_PRESETS: SubtitlePreset[] = [
  // Donghua & Theatrical
  {
    id: 'donghua_gold_3d',
    label: '👑 Donghua Imperial Gold 3D',
    category: 'Donghua & Theatrical',
    fontSize: 22,
    fontFamily: 'Moul',
    textColor: '#fef08a',
    strokeColor: '#78350f',
    strokeWidth: 3,
    backgroundColor: 'rgba(15, 10, 5, 0.75)',
    textShadow: '0 0 10px #f59e0b, 0 3px 6px #000000',
    description: 'Glorious gold typography for martial arts emperors'
  },
  {
    id: 'wuxia_silver_blade',
    label: '⚔️ Wuxia Silver Sword',
    category: 'Donghua & Theatrical',
    fontSize: 20,
    fontFamily: 'Koulen',
    textColor: '#f1f5f9',
    strokeColor: '#0f172a',
    strokeWidth: 3,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    textShadow: '0 0 8px #94a3b8',
    description: 'Crisp steel sword-glint typography'
  },
  {
    id: 'royal_khmer_moul',
    label: '🏛️ Khmer Royal Moul Heritage',
    category: 'Donghua & Theatrical',
    fontSize: 22,
    fontFamily: 'Moul',
    textColor: '#ffffff',
    strokeColor: '#b45309',
    strokeWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.85)',
    description: 'Traditional formal Cambodian temple script'
  },
  {
    id: 'fire_dragon',
    label: '🔥 Fire Phoenix Flame',
    category: 'Donghua & Theatrical',
    fontSize: 21,
    fontFamily: 'Bayon',
    textColor: '#fecdd3',
    strokeColor: '#991b1b',
    strokeWidth: 3,
    backgroundColor: 'rgba(69, 10, 10, 0.8)',
    textShadow: '0 0 12px #ef4444',
    description: 'Blazing dragon flame acting title'
  },
  {
    id: 'jade_empress',
    label: '🐉 Jade Empress Celestial',
    category: 'Donghua & Theatrical',
    fontSize: 20,
    fontFamily: 'Kantumruy Pro',
    textColor: '#a7f3d0',
    strokeColor: '#064e3b',
    strokeWidth: 2,
    backgroundColor: 'rgba(2, 44, 34, 0.85)',
    textShadow: '0 0 10px #10b981',
    description: 'Magical ancient jade talisman tone'
  },
  {
    id: 'celestial_thunder',
    label: '⚡ Celestial Thunder Shock',
    category: 'Donghua & Theatrical',
    fontSize: 21,
    fontFamily: 'Koulen',
    textColor: '#e0e7ff',
    strokeColor: '#3730a3',
    strokeWidth: 3,
    backgroundColor: 'rgba(30, 27, 75, 0.85)',
    textShadow: '0 0 14px #6366f1',
    description: 'Electric god tribulation energy'
  },
  {
    id: 'buddhist_lotus',
    label: '🪷 Sacred Lotus Meditation',
    category: 'Donghua & Theatrical',
    fontSize: 20,
    fontFamily: 'Kantumruy Pro',
    textColor: '#fde047',
    strokeColor: '#451a03',
    strokeWidth: 2,
    backgroundColor: 'rgba(20, 10, 2, 0.75)',
    description: 'Peaceful temple master wisdom dialogue'
  },
  {
    id: 'blood_clan',
    label: '🩸 Shadow Demon Vampire',
    category: 'Donghua & Theatrical',
    fontSize: 21,
    fontFamily: 'Bayon',
    textColor: '#fca5a5',
    strokeColor: '#450a0a',
    strokeWidth: 3,
    backgroundColor: 'rgba(0,0,0,0.9)',
    textShadow: '0 0 8px #dc2626',
    description: 'Dark villain and assassin dialogue'
  },
  {
    id: 'divine_frost',
    label: '❄️ Divine Frost Glacier',
    category: 'Donghua & Theatrical',
    fontSize: 20,
    fontFamily: 'Koulen',
    textColor: '#bae6fd',
    strokeColor: '#075985',
    strokeWidth: 2,
    backgroundColor: 'rgba(3, 105, 161, 0.25)',
    textShadow: '0 0 10px #38bdf8',
    description: 'Sub-zero spiritual maiden beauty'
  },
  {
    id: 'ancient_scroll',
    label: '📜 Bamboo Scroll Dynasty',
    category: 'Donghua & Theatrical',
    fontSize: 19,
    fontFamily: 'Kantumruy Pro',
    textColor: '#fef3c7',
    strokeColor: '#78350f',
    strokeWidth: 1.5,
    backgroundColor: 'rgba(41, 23, 12, 0.85)',
    description: 'Historical royal dynasty manuscript'
  },

  // Modern & Streaming
  {
    id: 'netflix_sans',
    label: '🎬 Netflix Clean Modern',
    category: 'Modern & Streaming',
    fontSize: 19,
    fontFamily: 'Kantumruy Pro',
    textColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    description: 'Crystal-clear readability across all devices'
  },
  {
    id: 'youtube_bold',
    label: '▶️ YouTube Viral Yellow',
    category: 'Modern & Streaming',
    fontSize: 22,
    fontFamily: 'Outfit',
    textColor: '#facc15',
    strokeColor: '#000000',
    strokeWidth: 3,
    backgroundColor: 'rgba(0,0,0,0.8)',
    textShadow: '0 3px 6px #000000',
    description: 'High CTR attention grabber for recaps'
  },
  {
    id: 'tiktok_pop',
    label: '📱 TikTok / Reels Bouncy',
    category: 'Modern & Streaming',
    fontSize: 23,
    fontFamily: 'Bayon',
    textColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 4,
    backgroundColor: 'transparent',
    textShadow: '0 4px 8px rgba(0,0,0,0.9)',
    animation: 'pop',
    description: 'Punchy stroke for vertical short films'
  },
  {
    id: 'cinema_scope',
    label: '📽️ 2.39:1 Cinema Letterbox',
    category: 'Modern & Streaming',
    fontSize: 18,
    fontFamily: 'Kantumruy Pro',
    textColor: '#f8fafc',
    strokeColor: '#000000',
    strokeWidth: 1.5,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    description: 'Sleek film festival subtitling'
  },
  {
    id: 'glass_frost',
    label: '🪟 Frosted Glassmorphism',
    category: 'Modern & Streaming',
    fontSize: 19,
    fontFamily: 'Kantumruy Pro',
    textColor: '#ffffff',
    strokeColor: 'rgba(255,255,255,0.3)',
    strokeWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    textShadow: '0 4px 12px rgba(0,0,0,0.5)',
    description: 'Ultra-modern translucent iOS aesthetic'
  },
  {
    id: 'apple_tv_soft',
    label: '🍏 Apple TV Plus Elegant',
    category: 'Modern & Streaming',
    fontSize: 18,
    fontFamily: 'Outfit',
    textColor: '#ffffff',
    strokeColor: '#1e293b',
    strokeWidth: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    description: 'Subtle typography with perfect letter spacing'
  },
  {
    id: 'karaoke_gold',
    label: '🎤 Live Karaoke Dynamic',
    category: 'Modern & Streaming',
    fontSize: 21,
    fontFamily: 'Bayon',
    textColor: '#38bdf8',
    strokeColor: '#0284c7',
    strokeWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.8)',
    animation: 'karaoke',
    description: 'Word-by-word active rhythm display'
  },
  {
    id: 'dark_mode_cyan',
    label: '🌌 Dark Mode Cyan Glow',
    category: 'Modern & Streaming',
    fontSize: 20,
    fontFamily: 'Kantumruy Pro',
    textColor: '#67e8f9',
    strokeColor: '#0e7490',
    strokeWidth: 2,
    backgroundColor: 'rgba(8, 20, 32, 0.85)',
    textShadow: '0 0 10px #06b6d4',
    description: 'Eye-friendly deep contrast'
  },
  {
    id: 'pure_minimal',
    label: '🕊️ Pure Ghost Minimal',
    category: 'Modern & Streaming',
    fontSize: 18,
    fontFamily: 'Kantumruy Pro',
    textColor: '#ffffff',
    strokeColor: 'transparent',
    strokeWidth: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    description: 'Zero borders, pure cinematic transparency'
  },
  {
    id: 'prime_video',
    label: '📺 Prime Broadcast Amber',
    category: 'Modern & Streaming',
    fontSize: 19,
    fontFamily: 'Kantumruy Pro',
    textColor: '#fbbf24',
    strokeColor: '#000000',
    strokeWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.7)',
    description: 'Standard TV broadcaster golden yellow'
  },

  // Anime & Neon
  {
    id: 'cyber_neon_cyan',
    label: '⚡ Cyberpunk Neon Glow',
    category: 'Anime & Neon',
    fontSize: 21,
    fontFamily: 'Koulen',
    textColor: '#22d3ee',
    strokeColor: '#083344',
    strokeWidth: 3,
    backgroundColor: 'rgba(8, 51, 68, 0.8)',
    textShadow: '0 0 12px #06b6d4, 0 0 24px #0891b2',
    description: 'Blinding sci-fi neon pulse'
  },
  {
    id: 'tokyo_magenta',
    label: '🌸 Tokyo Neon Pink',
    category: 'Anime & Neon',
    fontSize: 21,
    fontFamily: 'Bayon',
    textColor: '#f472b6',
    strokeColor: '#831843',
    strokeWidth: 3,
    backgroundColor: 'rgba(76, 5, 25, 0.85)',
    textShadow: '0 0 12px #ec4899',
    description: 'Shinjuku nightlife cyberpunk pink'
  },
  {
    id: 'comic_manga_bold',
    label: '💥 Manga Action Comic',
    category: 'Anime & Neon',
    fontSize: 23,
    fontFamily: 'Bayon',
    textColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 4,
    backgroundColor: '#facc15',
    textShadow: '0 4px 0 #000000',
    description: 'Comic speech bubble impact'
  },
  {
    id: 'acid_green',
    label: '🧪 Toxic Cyber Acid',
    category: 'Anime & Neon',
    fontSize: 21,
    fontFamily: 'Koulen',
    textColor: '#4ade80',
    strokeColor: '#14532d',
    strokeWidth: 3,
    backgroundColor: 'rgba(2, 44, 18, 0.85)',
    textShadow: '0 0 12px #22c55e',
    description: 'Futuristic radioactive power glow'
  },
  {
    id: 'vaporwave_sunset',
    label: '🌴 1984 Vaporwave Ombre',
    category: 'Anime & Neon',
    fontSize: 21,
    fontFamily: 'Koulen',
    textColor: '#fb7185',
    strokeColor: '#4c0519',
    strokeWidth: 2,
    backgroundColor: 'rgba(24, 8, 48, 0.85)',
    textShadow: '0 0 14px #a855f7',
    description: 'Retro 80s synthesizer nostalgia'
  },
  {
    id: 'pixel_retro_8bit',
    label: '👾 Retro 8-Bit Arcade',
    category: 'Anime & Neon',
    fontSize: 18,
    fontFamily: 'Koulen',
    textColor: '#fef08a',
    strokeColor: '#1e1b4b',
    strokeWidth: 3,
    backgroundColor: 'rgba(49, 46, 129, 0.9)',
    description: 'Old school game console dialog box'
  },
  {
    id: 'electric_blue',
    label: '⚡ Electric Plasma Blue',
    category: 'Anime & Neon',
    fontSize: 21,
    fontFamily: 'Koulen',
    textColor: '#60a5fa',
    strokeColor: '#1e3a8a',
    strokeWidth: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    textShadow: '0 0 14px #3b82f6',
    description: 'Lightning speed superhero powers'
  },
  {
    id: 'mecha_gold',
    label: '🤖 Gundam Mecha Gold',
    category: 'Anime & Neon',
    fontSize: 20,
    fontFamily: 'Outfit',
    textColor: '#fef08a',
    strokeColor: '#854d0e',
    strokeWidth: 2,
    backgroundColor: 'rgba(30, 20, 10, 0.85)',
    description: 'Cockpit HUD tactical subtitles'
  },
  {
    id: 'ghostly_spirit',
    label: '👻 Ethereal Ghost Soul',
    category: 'Anime & Neon',
    fontSize: 20,
    fontFamily: 'Kantumruy Pro',
    textColor: '#e2e8f0',
    strokeColor: '#334155',
    strokeWidth: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    textShadow: '0 0 16px #cbd5e1',
    description: 'Spiritual phantom whisper tone'
  },
  {
    id: 'solar_flare_sub',
    label: '☀️ Solar Flare Core',
    category: 'Anime & Neon',
    fontSize: 21,
    fontFamily: 'Bayon',
    textColor: '#fed7aa',
    strokeColor: '#7c2d12',
    strokeWidth: 3,
    backgroundColor: 'rgba(67, 20, 7, 0.85)',
    textShadow: '0 0 12px #f97316',
    description: 'Supernova explosion magnitude'
  },

  // Creative & Aesthetic
  {
    id: 'romantic_pastel',
    label: '💖 Soft Romance Love',
    category: 'Creative & Aesthetic',
    fontSize: 19,
    fontFamily: 'Kantumruy Pro',
    textColor: '#fce7f3',
    strokeColor: '#831843',
    strokeWidth: 1.5,
    backgroundColor: 'rgba(131, 24, 67, 0.3)',
    textShadow: '0 0 8px #f472b6',
    description: 'Sweet, tender confession scenes'
  },
  {
    id: 'gothic_noir',
    label: '🦇 Victorian Gothic Dark',
    category: 'Creative & Aesthetic',
    fontSize: 20,
    fontFamily: 'Moul',
    textColor: '#e2e8f0',
    strokeColor: '#020617',
    strokeWidth: 3,
    backgroundColor: 'rgba(2, 6, 23, 0.95)',
    description: 'Haunted castles and dark mysteries'
  },
  {
    id: 'emerald_forest',
    label: '🌿 Celtic Emerald Forest',
    category: 'Creative & Aesthetic',
    fontSize: 20,
    fontFamily: 'Kantumruy Pro',
    textColor: '#dcfce7',
    strokeColor: '#14532d',
    strokeWidth: 2,
    backgroundColor: 'rgba(20, 83, 45, 0.65)',
    description: 'Natural greenery, peace and life'
  },
  {
    id: 'autumn_amber',
    label: '🍂 Autumn Maple Warmth',
    category: 'Creative & Aesthetic',
    fontSize: 19,
    fontFamily: 'Kantumruy Pro',
    textColor: '#fed7aa',
    strokeColor: '#7c2d12',
    strokeWidth: 2,
    backgroundColor: 'rgba(67, 20, 7, 0.7)',
    description: 'Gentle nostalgic memories'
  },
  {
    id: 'sunset_peach',
    label: '🍑 Sunset Peach Dream',
    category: 'Creative & Aesthetic',
    fontSize: 20,
    fontFamily: 'Kantumruy Pro',
    textColor: '#ffedd5',
    strokeColor: '#9a3412',
    strokeWidth: 2,
    backgroundColor: 'rgba(154, 52, 18, 0.45)',
    description: 'Warm evening aesthetic'
  },
  {
    id: 'hologram_diamond',
    label: '💎 Diamond Prism Sparkle',
    category: 'Creative & Aesthetic',
    fontSize: 20,
    fontFamily: 'Koulen',
    textColor: '#ffffff',
    strokeColor: '#0284c7',
    strokeWidth: 2,
    backgroundColor: 'rgba(12, 74, 110, 0.7)',
    textShadow: '0 0 10px #7dd3fc',
    description: 'High-class luxury crystal shimmer'
  },
  {
    id: 'deep_space',
    label: '🪐 Cosmic Galaxy Violet',
    category: 'Creative & Aesthetic',
    fontSize: 20,
    fontFamily: 'Outfit',
    textColor: '#e9d5ff',
    strokeColor: '#581c87',
    strokeWidth: 2,
    backgroundColor: 'rgba(38, 12, 60, 0.85)',
    textShadow: '0 0 12px #c084fc',
    description: 'Starlight exploration of outer space'
  },
  {
    id: 'ink_calligraphy',
    label: '🖋️ Chinese Ink Brush',
    category: 'Creative & Aesthetic',
    fontSize: 21,
    fontFamily: 'Moul',
    textColor: '#fafafa',
    strokeColor: '#18181b',
    strokeWidth: 3,
    backgroundColor: 'rgba(24, 24, 27, 0.9)',
    description: 'Traditional poetic brush stroke'
  },
  {
    id: 'candy_pop',
    label: '🍭 Candy Pop Sweet',
    category: 'Creative & Aesthetic',
    fontSize: 21,
    fontFamily: 'Bayon',
    textColor: '#fdf4ff',
    strokeColor: '#86198f',
    strokeWidth: 3,
    backgroundColor: 'rgba(192, 38, 211, 0.65)',
    description: 'Playful comedy and children animation'
  },
  {
    id: 'brass_steampunk',
    label: '⚙️ Brass Steampunk Gear',
    category: 'Creative & Aesthetic',
    fontSize: 20,
    fontFamily: 'Koulen',
    textColor: '#fde68a',
    strokeColor: '#78350f',
    strokeWidth: 2.5,
    backgroundColor: 'rgba(69, 26, 3, 0.85)',
    description: 'Clockwork Victorian mechanical world'
  }
];

// -------------------------------------------------------------
// 3. 20+ Theatrical Audio & Vocal Effects Presets
// -------------------------------------------------------------
export const AUDIO_EFFECT_PRESETS: AudioEffectPreset[] = [
  // Vocal EQ
  { id: 'natural', label: '🎙️ Original Natural Voice', category: 'Vocal EQ', description: 'Pure balanced voice without alteration', pitchAdjust: '+0Hz', rateAdjust: '+0%', volumeBoost: 1.0 },
  { id: 'vocal_boost', label: '📢 Dialogue Clarity Boost', category: 'Vocal EQ', description: 'Cuts through background music with crisp presence', pitchAdjust: '+2Hz', rateAdjust: '+0%', volumeBoost: 1.25 },
  { id: 'cinema_trailer_bass', label: '🎬 Movie Trailer Deep Bass', category: 'Vocal EQ', description: 'Deep resonant chest voice for epic narrators', pitchAdjust: '-6Hz', rateAdjust: '-5%', volumeBoost: 1.3 },
  { id: 'heroic_bold', label: '👑 Heroic Adult Lead', category: 'Vocal EQ', description: 'Commanding male lead presence', pitchAdjust: '-2Hz', rateAdjust: '+2%', volumeBoost: 1.15 },
  { id: 'gentle_maiden', label: '🌸 Gentle Maiden Softness', category: 'Vocal EQ', description: 'Warm and delicate female romantic lead', pitchAdjust: '+4Hz', rateAdjust: '-3%', volumeBoost: 1.1 },
  { id: 'child_playful', label: '👧 Playful Youthful Spark', category: 'Vocal EQ', description: 'Light, quick, lively child pitch', pitchAdjust: '+12Hz', rateAdjust: '+10%', volumeBoost: 1.1 },
  { id: 'wise_elder', label: '👴 Ancient Master Wisdom', category: 'Vocal EQ', description: 'Slow deliberate elder pacing', pitchAdjust: '-8Hz', rateAdjust: '-12%', volumeBoost: 1.2 },

  // Cinema & Ambience
  { id: 'palace_hall', label: '🏛️ Imperial Throne Hall', category: 'Cinema & Ambience', description: 'Grand stone palace reverberation', pitchAdjust: '+0Hz', rateAdjust: '-2%', volumeBoost: 1.2 },
  { id: 'battlefield_roar', label: '⚔️ Battlefield General Command', category: 'Cinema & Ambience', description: 'Powerful commanding shout across armies', pitchAdjust: '-4Hz', rateAdjust: '+6%', volumeBoost: 1.35 },
  { id: 'whisper_intimate', label: '🤫 Intimate Secret Whisper', category: 'Cinema & Ambience', description: 'Close-mic ASMR confidential tone', pitchAdjust: '+0Hz', rateAdjust: '-8%', volumeBoost: 0.9 },
  { id: 'cave_echo', label: '🏔️ Mountain Cavern Echo', category: 'Cinema & Ambience', description: 'Spiritual mountain training cave', pitchAdjust: '-2Hz', rateAdjust: '-5%', volumeBoost: 1.15 },
  { id: 'heaven_ascension', label: '✨ Heavenly Immortal Radiance', category: 'Cinema & Ambience', description: 'Shimmering celestial voice presence', pitchAdjust: '+6Hz', rateAdjust: '+0%', volumeBoost: 1.2 },
  { id: 'underwater_realm', label: '🌊 Underwater Dragon Palace', category: 'Cinema & Ambience', description: 'Muffled fluid acoustic resonance', pitchAdjust: '-4Hz', rateAdjust: '-10%', volumeBoost: 1.0 },

  // Special & Vintage
  { id: 'radio_military', label: '📻 Military Field Walkie-Talkie', category: 'Special & Vintage', description: 'High-pass communications radio', pitchAdjust: '+4Hz', rateAdjust: '+5%', volumeBoost: 1.1 },
  { id: 'vintage_gramophone', label: '🎙️ 1930s Old Gramophone Radio', category: 'Special & Vintage', description: 'Warm nostalgic broadcast warmth', pitchAdjust: '+0Hz', rateAdjust: '-3%', volumeBoost: 1.05 },
  { id: 'loudspeaker_square', label: '📢 City Square Loudspeaker', category: 'Special & Vintage', description: 'Echoing announcement horn', pitchAdjust: '+2Hz', rateAdjust: '+4%', volumeBoost: 1.4 },
  { id: 'robot_cyber_mech', label: '🤖 Cybernetic Mecha Voice', category: 'Special & Vintage', description: 'Robotic synthetic modulation', pitchAdjust: '-8Hz', rateAdjust: '+8%', volumeBoost: 1.2 },
  { id: 'phantom_demon', label: '👹 Possessed Demon Beast', category: 'Special & Vintage', description: 'Terrifying underworld growl', pitchAdjust: '-14Hz', rateAdjust: '-8%', volumeBoost: 1.3 },
  { id: 'dream_memory', label: '💭 Faded Childhood Memory', category: 'Special & Vintage', description: 'Soft nostalgic flashback tone', pitchAdjust: '+2Hz', rateAdjust: '-10%', volumeBoost: 0.95 },
  { id: 'telephone_call', label: '☎️ Smartphone Handset Call', category: 'Special & Vintage', description: 'Clean phone receiver speaker', pitchAdjust: '+2Hz', rateAdjust: '+0%', volumeBoost: 1.0 }
];


// -------------------------------------------------------------
// 4. 110+ 3D Visual Effects, Spatial Overlays & 3D Typography Library
// -------------------------------------------------------------
export interface Effect3DItem {
  id: string;
  label: string;
  category: '3D Spatial & Transforms' | '3D Particles & Atmosphere' | '3D Titles & Typography' | '3D Dynamic Motion & Camera';
  description: string;
  icon?: string;
  transform3d?: string;
  filter3d?: string;
  perspective?: number;
  overlayType?: 'none' | 'cyber_grid' | 'starfield' | 'embers' | 'god_rays' | 'matrix_cube' | 'anaglyph' | 'lens_flare' | 'sakura_depth' | 'snow_depth' | 'portal_ring' | 'hologram_rings';
  motionClass?: string;
  titleStylePreset?: string;
}

export const EFFECT_3D_PRESETS: Effect3DItem[] = [
  // ==========================================
  // Category 1: 3D Spatial & Transforms (28 Presets)
  // ==========================================
  {
    id: '3d_isometric_studio',
    label: '📐 Isometric Studio 3D',
    category: '3D Spatial & Transforms',
    description: 'ប្លង់ 3D Isometric ជ្រុង 12° ដូចស្ទូឌីយោអាជីព',
    transform3d: 'rotateX(12deg) rotateY(-18deg) scale(0.95)',
    perspective: 1000
  },
  {
    id: '3d_dolly_push',
    label: '🎬 Cinematic Dolly Push 3D',
    category: '3D Spatial & Transforms',
    description: 'រុញទស្សនីយភាព 3D ចូលមុខជាមួយជម្រៅកាមេរ៉ា',
    transform3d: 'scale3d(1.05, 1.05, 1.05) translateZ(25px)',
    perspective: 900
  },
  {
    id: '3d_curved_imax',
    label: '📽️ Curved IMAX Screen 3D',
    category: '3D Spatial & Transforms',
    description: 'ផ្ទាំងកោងកុន IMAX 3D កោងកណ្តាលស្អាតប្លែក',
    transform3d: 'perspective(750px) rotateX(4deg) scale(1.02)',
    perspective: 750
  },
  {
    id: '3d_holo_terminal',
    label: '🛸 Holo Terminal Projection 3D',
    category: '3D Spatial & Transforms',
    description: 'ផ្ទាំង Projection 3D បាញ់ចេញដូចយានអវកាស Sci-Fi',
    transform3d: 'rotateX(16deg) rotateY(10deg)',
    perspective: 850
  },
  {
    id: '3d_anaglyph_stereo',
    label: '🕶️ Anaglyph Red/Cyan Stereo 3D',
    category: '3D Spatial & Transforms',
    description: 'បែបវ៉ែនតា 3D ក្រហមខៀវ បំបែករូបភាព 3 វិមាត្រពិតៗ',
    overlayType: 'anaglyph',
    transform3d: 'scale(1.01)',
    perspective: 900
  },
  {
    id: '3d_vr_sphere_depth',
    label: '🥽 VR Headset Spatial Depth',
    category: '3D Spatial & Transforms',
    description: 'កោងរង្វង់ VR 360 ដឺក្រេ បង្កើនជម្រៅមើលទៅជិតភ្នែក',
    transform3d: 'perspective(600px) rotateX(5deg) scale(1.03)',
    perspective: 600
  },
  {
    id: '3d_parallax_card_float',
    label: '🃏 Parallax Floating Cinema Card',
    category: '3D Spatial & Transforms',
    description: 'ផ្ទាំងកាតភាពយន្តអណ្តែត 3D ជាមួយស្រមោលជ្រៅ',
    transform3d: 'rotateX(8deg) rotateY(-8deg) translateZ(30px)',
    perspective: 950
  },
  {
    id: '3d_dramatic_tilt_left',
    label: '↖️ Dramatic Left Perspective 3D',
    category: '3D Spatial & Transforms',
    description: 'ងាកជ្រុងខាងឆ្វេង 14° បង្កើនភាពអស្ចារ្យនៃការប្រយុទ្ធ',
    transform3d: 'rotateY(-14deg) rotateZ(-1.5deg)',
    perspective: 850
  },
  {
    id: '3d_dramatic_tilt_right',
    label: '↗️ Dramatic Right Perspective 3D',
    category: '3D Spatial & Transforms',
    description: 'ងាកជ្រុងខាងស្តាំ 14° បង្កើនភាពរស់រវើកនៃសាច់រឿង',
    transform3d: 'rotateY(14deg) rotateZ(1.5deg)',
    perspective: 850
  },
  {
    id: '3d_horizon_roll',
    label: '🌅 Horizon Tilt Roll 3D',
    category: '3D Spatial & Transforms',
    description: 'ផ្អៀងជើងមេឃ 3D បង្កើតបរិយាកាសស្ងប់ស្ងាត់ និងស្រស់ស្អាត',
    transform3d: 'rotateX(7deg) rotateZ(2.5deg)',
    perspective: 1100
  },
  {
    id: '3d_mirror_floor_reflection',
    label: '🪞 Glass Floor Reflection 3D',
    category: '3D Spatial & Transforms',
    description: 'ផ្ទាំងឆ្លុះកញ្ចក់លើឥដ្ឋ 3D ដ៏ប្រណិត',
    transform3d: 'rotateX(14deg) scale(0.97)',
    perspective: 900
  },
  {
    id: '3d_miniature_tilt_shift',
    label: '🏙️ Tilt-Shift Miniature 3D',
    category: '3D Spatial & Transforms',
    description: 'ប្លង់តូចក្រឡុកកែវពង្រីក Miniature Diorama',
    transform3d: 'rotateX(10deg)',
    filter3d: 'contrast(115%) saturate(120%)',
    perspective: 950
  },
  {
    id: '3d_kinetic_popout',
    label: '💥 Kinetic Pop-Out 3D',
    category: '3D Spatial & Transforms',
    description: 'ផ្ទុះចេញពីអេក្រង់ 3D Pop-out ដូចរោងកុនទំនើប',
    transform3d: 'scale3d(1.08, 1.08, 1.08) translateZ(40px)',
    perspective: 800
  },
  {
    id: '3d_cylinder_wrap',
    label: '🌀 Panoramic Cylinder 3D',
    category: '3D Spatial & Transforms',
    description: 'រុំទស្សនីយភាពជុំវិញស៊ីឡាំង Panoramic 3D',
    transform3d: 'rotateY(-6deg) scale(1.02)',
    perspective: 700
  },
  {
    id: '3d_portal_warp',
    label: '🌌 Spatial Portal Warp 3D',
    category: '3D Spatial & Transforms',
    description: 'ទ្វារច្រកលំហអាកាស 3D Portal កួចចូលកណ្តាល',
    overlayType: 'portal_ring',
    transform3d: 'scale(1.03)',
    perspective: 800
  },
  {
    id: '3d_comic_book_pop',
    label: '🗯️ Action Manga 3D Extrusion',
    category: '3D Spatial & Transforms',
    description: 'កម្រាស់ក្រដាសតុក្កតា Manga លេចចេញ 3 វិមាត្រ',
    transform3d: 'rotateX(6deg) rotateY(-10deg) scale(1.02)',
    perspective: 900
  },
  {
    id: '3d_tablet_display',
    label: '📱 Floating Tablet Glass 3D',
    category: '3D Spatial & Transforms',
    description: 'បន្ទះ iPad/Tablet កញ្ចក់អណ្តែត 3D លើអាកាស',
    transform3d: 'rotateX(18deg) scale(0.94)',
    perspective: 850
  },
  {
    id: '3d_cockpit_hud',
    label: '🛩️ Stealth Cockpit HUD 3D',
    category: '3D Spatial & Transforms',
    description: 'ផ្ទាំងកញ្ចក់មុខយន្តហោះចម្បាំង HUD 3D',
    transform3d: 'rotateX(12deg) scale(1.01)',
    perspective: 920
  },
  {
    id: '3d_deep_trench',
    label: '🏜️ Deep Canyon Trench 3D',
    category: '3D Spatial & Transforms',
    description: 'ជម្រៅជ្រលងភ្នំជ្រៅ 3D មើលទៅមានវិមាត្រវែងឆ្ងាយ',
    transform3d: 'perspective(650px) rotateX(8deg) scale(1.04)',
    perspective: 650
  },
  {
    id: '3d_wide_scope',
    label: '🕶️ Ultra Panavision 3D',
    category: '3D Spatial & Transforms',
    description: 'ទស្សនីយភាពកុនខ្នាតធំ Panavision 3D',
    transform3d: 'scaleX(1.03) rotateX(4deg)',
    perspective: 1000
  },
  {
    id: '3d_prism_refract',
    label: '💎 Prism Crystal Refraction 3D',
    category: '3D Spatial & Transforms',
    description: 'ចំណាំងប្លាតគ្រីស្តាល់ 3D ភ្លឺផ្លេក',
    transform3d: 'rotateY(8deg) rotateZ(1deg)',
    perspective: 900
  },
  {
    id: '3d_skew_velocity',
    label: '⚡ Warp Velocity Skew 3D',
    category: '3D Spatial & Transforms',
    description: 'ល្បឿនលឿនទាញផ្អៀង 3D Skew បែប Action រត់ប្រណាំង',
    transform3d: 'skewX(-4deg) rotateY(6deg)',
    perspective: 950
  },
  {
    id: '3d_floating_stage',
    label: '🎭 Theatrical Floating Stage 3D',
    category: '3D Spatial & Transforms',
    description: 'វេទិការោងមហោស្រពអណ្តែតលើអាកាស 3D',
    transform3d: 'rotateX(10deg) scale(0.96)',
    perspective: 950
  },
  {
    id: '3d_diamond_angle',
    label: '🔷 Diamond Rhombus 3D',
    category: '3D Spatial & Transforms',
    description: 'ជ្រុងពេជ្រ 3 វិមាត្រ Diamond Geometric Angle',
    transform3d: 'rotateX(6deg) rotateY(-8deg)',
    perspective: 900
  },
  {
    id: '3d_canting_dutch',
    label: '🎬 Dutch Angle Cinematic 3D',
    category: '3D Spatial & Transforms',
    description: 'ប្លង់កាមេរ៉ាកុន Dutch Angle បង្កើតភាពតានតឹង',
    transform3d: 'rotateZ(-3.5deg) scale(1.04)',
    perspective: 1100
  },
  {
    id: '3d_underbelly_hero',
    label: '👑 Hero Low-Angle 3D Tilt',
    category: '3D Spatial & Transforms',
    description: 'ប្លង់ងើយពីក្រោមឡើងលើ ស័ក្តិសមសម្រាប់តួឯកវីរបុរស',
    transform3d: 'rotateX(-8deg) scale(1.02)',
    perspective: 850
  },
  {
    id: '3d_skyview_bird',
    label: '🦅 Bird-Eye High Angle 3D',
    category: '3D Spatial & Transforms',
    description: 'ប្លង់ទម្លាក់ពីលើចុះក្រោម Bird-Eye View 3D',
    transform3d: 'rotateX(14deg) scale(0.96)',
    perspective: 850
  },
  {
    id: '3d_zero_g_tilt',
    label: '🛰️ Zero-G Space Weightless 3D',
    category: '3D Spatial & Transforms',
    description: 'សភាពគ្មានទំនាញផែនដី អណ្តែតវិលតិចៗ 3D',
    transform3d: 'rotateX(4deg) rotateY(-4deg) rotateZ(1.5deg)',
    perspective: 1000
  },

  // ==========================================
  // Category 2: 3D Particles & Atmosphere (28 Presets)
  // ==========================================
  {
    id: '3d_starfield_warp',
    label: '✨ Cosmic Starfield Warp 3D',
    category: '3D Particles & Atmosphere',
    description: 'ផ្កាយហោះកាត់ក្នុងលំហ 3D Starfield Warp Speed',
    overlayType: 'starfield'
  },
  {
    id: '3d_cyber_grid_floor',
    label: '🌐 Tron Matrix Cyber Grid 3D',
    category: '3D Particles & Atmosphere',
    description: 'ក្រឡាចត្រង្គអគ្គិសនី Neon Cyberpunk លើឥដ្ឋ 3D',
    overlayType: 'cyber_grid'
  },
  {
    id: '3d_golden_sparks_qi',
    label: '✨ Golden Spiritual Qi Sparks 3D',
    category: '3D Particles & Atmosphere',
    description: 'កម្ទេចពន្លឺមាស និងខ្យល់ថាមពលយុទ្ធសិល្ប៍ 3D',
    overlayType: 'embers',
    filter3d: 'sepia(30%) saturate(140%)'
  },
  {
    id: '3d_volumetric_godrays',
    label: '☀️ Volumetric God Rays 3D',
    category: '3D Particles & Atmosphere',
    description: 'កាំរស្មីព្រះអាទិត្យចាំងកាត់ពពក 3D Heavenly Sunbeam',
    overlayType: 'god_rays'
  },
  {
    id: '3d_fire_ember_storm',
    label: '🔥 Blazing Fire Embers 3D',
    category: '3D Particles & Atmosphere',
    description: 'ផ្កាភ្លើងអណ្តែតហោះ 3D អំឡុងពេលឈុតសង្គ្រាម',
    overlayType: 'embers'
  },
  {
    id: '3d_sakura_petals',
    label: '🌸 Falling Sakura Petals 3D',
    category: '3D Particles & Atmosphere',
    description: 'ស្រទាប់ផ្កាសាគូរ៉ាហោះរសាត់តាមជម្រៅ 3D',
    overlayType: 'sakura_depth'
  },
  {
    id: '3d_snow_blizzard',
    label: '❄️ Sub-Zero Blizzard Snow 3D',
    category: '3D Particles & Atmosphere',
    description: 'ព្រិលធ្លាក់មានស្រទាប់ជិតឆ្ងាយ 3D Winter Blizzard',
    overlayType: 'snow_depth'
  },
  {
    id: '3d_matrix_code_rain',
    label: '🟢 Matrix Digital Rain 3D',
    category: '3D Particles & Atmosphere',
    description: 'កូដឌីជីថលពណ៌បៃតងធ្លាក់តាមជម្រៅ 3 វិមាត្រ',
    overlayType: 'matrix_cube'
  },
  {
    id: '3d_hologram_rings',
    label: '🎯 Target Hologram Rings 3D',
    category: '3D Particles & Atmosphere',
    description: 'រង្វង់ស្កេនគោលដៅ Hologram HUD 3D',
    overlayType: 'hologram_rings'
  },
  {
    id: '3d_underwater_caustics',
    label: '🌊 Deep Dragon Palace Caustics 3D',
    category: '3D Particles & Atmosphere',
    description: 'រលកពន្លឺចាំងផ្លាតបាតសមុទ្រ 3D Underwater Caustics',
    filter3d: 'hue-rotate(185deg) contrast(110%)',
    overlayType: 'none'
  },
  {
    id: '3d_bokeh_depth_orbs',
    label: '🔮 Floating Bokeh Depth Orbs 3D',
    category: '3D Particles & Atmosphere',
    description: 'ដុំពន្លឺ Bokeh អណ្តែតជិតឆ្ងាយ បង្កើនភាពរ៉ូមែនទិក',
    overlayType: 'none'
  },
  {
    id: '3d_scifi_scanner_beam',
    label: '📡 Sci-Fi Scanning Grid 3D',
    category: '3D Particles & Atmosphere',
    description: 'ខ្សែឡាស៊ែរស្កេនទិន្នន័យលើវីដេអូ 3 វិមាត្រ',
    overlayType: 'cyber_grid'
  },
  {
    id: '3d_plasma_lightning',
    label: '⚡ Celestial Thunder Shock 3D',
    category: '3D Particles & Atmosphere',
    description: 'រន្ទះផ្គររន្ទះសេឡេស្ទាលចាំងពេញផ្ទៃអេក្រង់ 3D',
    overlayType: 'none'
  },
  {
    id: '3d_autumn_leaves',
    label: '🍁 Autumn Leaves Floating 3D',
    category: '3D Particles & Atmosphere',
    description: 'ស្លឹកឈើជ្រុះរដូវស្លឹកឈើជ្រុះ 3 វិមាត្រកក់ក្តៅ',
    overlayType: 'sakura_depth'
  },
  {
    id: '3d_crystal_shards',
    label: '💎 Floating Crystal Shards 3D',
    category: '3D Particles & Atmosphere',
    description: 'កម្ទេចត្បូងពេជ្រអណ្តែតភ្លឺចាំងជុំវិញវីដេអូ',
    overlayType: 'none'
  },
  {
    id: '3d_mystic_fog',
    label: '🌫️ Mystic Mountain Fog 3D',
    category: '3D Particles & Atmosphere',
    description: 'អ័ព្ទព្រៃភ្នំក្រាស់ 3D បង្កើតបរិយាកាសអាថ៌កំបាំង',
    overlayType: 'none'
  },
  {
    id: '3d_cinema_lens_flare',
    label: '🔆 Anamorphic Blue Flare 3D',
    category: '3D Particles & Atmosphere',
    description: 'ពន្លឺ Anamorphic Lens Flare បែបកុនហូលីវូដ',
    overlayType: 'lens_flare'
  },
  {
    id: '3d_neon_ceiling_grid',
    label: '💡 Cyber Neon Ceiling 3D',
    category: '3D Particles & Atmosphere',
    description: 'ពិដានពន្លឺ Neon 3D បែបក្លឹបរាត្រីអនាគត',
    overlayType: 'cyber_grid'
  },
  {
    id: '3d_rain_depth_glass',
    label: '🌧️ Cinematic Rain On Glass 3D',
    category: '3D Particles & Atmosphere',
    description: 'ដំណក់ទឹកភ្លៀងហូរលើកញ្ចក់ 3D កម្សត់រំជួលចិត្ត',
    overlayType: 'none'
  },
  {
    id: '3d_dust_motes_sunlight',
    label: '☀️ Dust Motes in Sunbeam 3D',
    category: '3D Particles & Atmosphere',
    description: 'ធូលីល្អិតហោះរាំក្នុងពន្លឺថ្ងៃ 3D ធម្មជាតិសុទ្ធ',
    overlayType: 'none'
  },
  {
    id: '3d_divine_halo',
    label: '🪷 Divine Golden Halo 3D',
    category: '3D Particles & Atmosphere',
    description: 'រស្មីព្រះពុទ្ធ និងអាទិទេពចាំងរស្មី 3D ពោរពេញដោយបារមី',
    overlayType: 'god_rays'
  },
  {
    id: '3d_demon_flame_aura',
    label: '👹 Demonic Shadow Aura 3D',
    category: '3D Particles & Atmosphere',
    description: 'អ័ព្ទខ្មៅ និងភ្លើងបិសាច 3D ឈុតតួចិត្តអាក្រក់',
    overlayType: 'embers'
  },
  {
    id: '3d_circuit_pulse',
    label: '🤖 Microchip Cyber Pulse 3D',
    category: '3D Particles & Atmosphere',
    description: 'សៀគ្វីអេឡិចត្រូនិកបញ្ចេញពន្លឺ 3 វិមាត្រ',
    overlayType: 'cyber_grid'
  },
  {
    id: '3d_magic_rune_circle',
    label: '🔮 Arcane Magic Rune Circle 3D',
    category: '3D Particles & Atmosphere',
    description: 'រង្វង់យ័ន្តមន្តអាគមបាលី 3D បង្វិលយឺតៗ',
    overlayType: 'hologram_rings'
  },
  {
    id: '3d_starlight_nebula',
    label: '🌌 Galaxy Nebula Dust 3D',
    category: '3D Particles & Atmosphere',
    description: 'ពពកកាឡាក់ស៊ីពណ៌ស្វាយ និងផ្កាយព្រិចៗ 3D',
    overlayType: 'starfield'
  },
  {
    id: '3d_emerald_fireflies',
    label: '🪲 Emerald Spirit Fireflies 3D',
    category: '3D Particles & Atmosphere',
    description: 'អំពិលអំពែកពណ៌បៃតងត្បូងមរកតហោះរាំ 3D',
    overlayType: 'embers'
  },
  {
    id: '3d_bubbles_prism',
    label: '🫧 Iridescent Prismatic Bubbles 3D',
    category: '3D Particles & Atmosphere',
    description: 'ពពុះសាប៊ូឆ្លុះឥន្ទធនូហោះអណ្តែត 3D គួរឱ្យស្រលាញ់',
    overlayType: 'none'
  },
  {
    id: '3d_supernova_burst',
    label: '💥 Supernova Starlight Burst 3D',
    category: '3D Particles & Atmosphere',
    description: 'ការផ្ទុះផ្កាយ Supernova ចាំងពន្លឺខ្លាំងក្លា 3D',
    overlayType: 'lens_flare'
  },

  // ==========================================
  // Category 3: 3D Titles & Typography (36 Presets)
  // ==========================================
  {
    id: '3d_text_gold3d',
    label: '🌟 3D Imperial Gold Bevel',
    category: '3D Titles & Typography',
    description: 'អក្សរមាសរលោង 3D មានកម្រាស់ Bevel ភ្លឺថ្លាអធិរាជ',
    titleStylePreset: 'gold3d'
  },
  {
    id: '3d_text_cyberpunk',
    label: '⚡ 3D Cyberpunk Neon Tubes',
    category: '3D Titles & Typography',
    description: 'អំពូលនីអុង 3D ពណ៌ខៀវផ្កាឈូក រំលេចអក្សរច្បាស់',
    titleStylePreset: 'cyberpunk'
  },
  {
    id: '3d_text_silver_blade',
    label: '⚔️ 3D Wuxia Silver Blade',
    category: '3D Titles & Typography',
    description: 'អក្សរផ្លែដាវប្រាក់ 3D ចាំងពន្លឺមុខកាំបិតមុតស្រួច',
    titleStylePreset: 'silver_blade'
  },
  {
    id: '3d_text_lava_dragon',
    label: '🔥 3D Molten Lava Dragon',
    category: '3D Titles & Typography',
    description: 'កម្អែលភ្នំភ្លើងនាគរាជ 3D ពណ៌ក្រហមទឹកក្រូចក្តៅគគុក',
    titleStylePreset: 'fire'
  },
  {
    id: '3d_text_diamond_prism',
    label: '💎 3D Diamond Prism Reflection',
    category: '3D Titles & Typography',
    description: 'ត្បូងពេជ្រចាំងពន្លឺ 3D ដ៏មានតម្លៃបំផុត',
    titleStylePreset: 'diamond_prism'
  },
  {
    id: '3d_text_jade_celestial',
    label: '🐉 3D Jade Empress Celestial',
    category: '3D Titles & Typography',
    description: 'ត្បូងកណ្តៀងបៃតងរាជវង្ស 3D ត្រជាក់ភ្នែក',
    titleStylePreset: 'jade_celestial'
  },
  {
    id: '3d_text_mecha_chrome',
    label: '🤖 3D Mecha Titanium Chrome',
    category: '3D Titles & Typography',
    description: 'ដែកទីតាញ៉ូមក្រូម 3D បែបមនុស្សយន្តអនាគត',
    titleStylePreset: 'mecha_chrome'
  },
  {
    id: '3d_text_crimson_shadow',
    label: '🩸 3D Blood Crimson Shadow',
    category: '3D Titles & Typography',
    description: 'អក្សរឈាមក្រហម 3D សម្រាប់ឈុតរឿងភ័យរន្ធត់ ឬវាយប្រហារ',
    titleStylePreset: 'crimson_shadow'
  },
  {
    id: '3d_text_glacier_ice',
    label: '🧊 3D Deep Glacier Ice Crystal',
    category: '3D Titles & Typography',
    description: 'ផ្ទាំងទឹកកកគ្រីស្តាល់ 3D ត្រជាក់ស្រេង',
    titleStylePreset: 'glacier_ice'
  },
  {
    id: '3d_text_ancient_stone',
    label: '📜 3D Ancient Stone Inscription',
    category: '3D Titles & Typography',
    description: 'ឆ្លាក់ថ្មប្រាសាទបុរាណ 3D អាយុកាលរាប់ពាន់ឆ្នាំ',
    titleStylePreset: 'ancient_stone'
  },
  {
    id: '3d_text_synthwave_80s',
    label: '🌇 3D Retro 1980s Synthwave',
    category: '3D Titles & Typography',
    description: 'ស្ទាយអក្សរភ្លើង Retro ទសវត្សរ៍ ៨០ ដ៏ទាក់ទាញ',
    titleStylePreset: 'synthwave_80s'
  },
  {
    id: '3d_text_khmer_royal',
    label: '👑 3D Royal Cambodian Moul',
    category: '3D Titles & Typography',
    description: 'អក្សរមូលខ្មែររាជវាំងមាស 3D វប្បធម៌ខ្មែរដ៏រុងរឿង',
    titleStylePreset: 'khmer_royal'
  },
  {
    id: '3d_text_comic_popart',
    label: '💥 3D Comic Pop-Art Extrusion',
    category: '3D Titles & Typography',
    description: 'អក្សរកំប្លែងលេចចេញ 3D ជាមួយគែមខ្មៅក្រាស់បែប Comics',
    titleStylePreset: 'comic_popart'
  },
  {
    id: '3d_text_cosmic_nebula',
    label: '🪐 3D Cosmic Nebula Stardust',
    category: '3D Titles & Typography',
    description: 'កាឡាក់ស៊ីផ្កាយរាយប៉ាយ 3D ពណ៌ស្វាយផ្កាឈូក',
    titleStylePreset: 'cosmic_nebula'
  },
  {
    id: '3d_text_toxic_acid',
    label: '🧪 3D Toxic Acid Glow',
    category: '3D Titles & Typography',
    description: 'សារធាតុវិទ្យុសកម្មភ្លឺបៃតងច្បាស់ 3D',
    titleStylePreset: 'toxic_acid'
  },
  {
    id: '3d_text_glass_frost',
    label: '🪟 3D Ultra Glassmorphism Float',
    category: '3D Titles & Typography',
    description: 'កញ្ចក់ថ្លាអណ្តែត 3D ទំនើបបែប Apple iOS',
    titleStylePreset: 'glass'
  },
  {
    id: '3d_text_velvet_red',
    label: '🌹 3D Velvet Red Carpet',
    category: '3D Titles & Typography',
    description: 'កម្រាលព្រំក្រហមវ៉ាលវីត 3D ដ៏មានកិត្តិយស',
    titleStylePreset: 'velvet_red'
  },
  {
    id: '3d_text_steampunk_brass',
    label: '⚙️ 3D Brass Steampunk Gears',
    category: '3D Titles & Typography',
    description: 'ស្ពាន់លង្ហិនយន្តការនាឡិកា 3D បែបវិចតូរៀ',
    titleStylePreset: 'steampunk_brass'
  },
  {
    id: '3d_text_plasma_shock',
    label: '⚡ 3D Electric Plasma Shock',
    category: '3D Titles & Typography',
    description: 'បន្ទុកអគ្គិសនីផ្លាស្មា 3D ពណ៌ខៀវស្រាលរស់រវើក',
    titleStylePreset: 'neon'
  },
  {
    id: '3d_text_sakura_bloom',
    label: '🌸 3D Sakura Blossom Float',
    category: '3D Titles & Typography',
    description: 'អក្សរផ្កាសាគូរ៉ាទន់ភ្លន់ 3D សម្រាប់រឿងស្នេហា',
    titleStylePreset: 'sakura_bloom'
  },
  {
    id: '3d_text_hollywood_bold',
    label: '🕶️ 3D Hollywood Blockbuster Bold',
    category: '3D Titles & Typography',
    description: 'អក្សរភាពយន្តធំៗបែប Hollywood 3D Blockbuster',
    titleStylePreset: 'cinema'
  },
  {
    id: '3d_text_arcade_8bit',
    label: '👾 3D Arcade 8-Bit Pixel Depth',
    category: '3D Titles & Typography',
    description: 'អក្សរហ្គេម Arcade ភីកសែល 3 វិមាត្រសប្បាយៗ',
    titleStylePreset: 'arcade_8bit'
  },
  {
    id: '3d_text_harvest_qi',
    label: '🌾 3D Golden Harvest Qi',
    category: '3D Titles & Typography',
    description: 'អក្សរវាលស្រែពណ៌មាស 3D ធម្មជាតិ និងភាពចម្រុងចម្រើន',
    titleStylePreset: 'harvest_qi'
  },
  {
    id: '3d_text_space_void',
    label: '🌌 3D Deep Space Void Glow',
    category: '3D Titles & Typography',
    description: 'អក្សរពន្លឺលំហអាកាសដ៏ជ្រាលជ្រៅ 3D',
    titleStylePreset: 'space_void'
  },
  {
    id: '3d_text_lotus_sacred',
    label: '🪷 3D Sacred Lotus Bloom',
    category: '3D Titles & Typography',
    description: 'ផ្កាឈូកសួគ៌ា 3D បរិសុទ្ធ សម្រាប់រឿងព្រះធម៌ ឬប្រវត្តិសាស្ត្រ',
    titleStylePreset: 'lotus_sacred'
  },
  {
    id: '3d_text_castle_granite',
    label: '🏰 3D Medieval Castle Stone',
    category: '3D Titles & Typography',
    description: 'ថ្មប្រាសាទរាជវាំងអឺរ៉ុប 3D រឹងមាំដូចបន្ទាយ',
    titleStylePreset: 'castle_granite'
  },
  {
    id: '3d_text_choco_gloss',
    label: '🍫 3D Sweet Choco Gloss',
    category: '3D Titles & Typography',
    description: 'សូកូឡារលោង 3D គួរឱ្យចង់ញ៉ាំ សម្រាប់វីដេអូ Cute/Comedy',
    titleStylePreset: 'choco_gloss'
  },
  {
    id: '3d_text_emerald_leaf',
    label: '🌿 3D Emerald Forest Leaf',
    category: '3D Titles & Typography',
    description: 'ស្លឹកឈើព្រៃព្រឹក្សា 3D បៃតងស្រស់បំព្រង',
    titleStylePreset: 'emerald_leaf'
  },
  {
    id: '3d_text_ocean_wave',
    label: '🌊 3D Deep Ocean Waves',
    category: '3D Titles & Typography',
    description: 'រលកសមុទ្រពណ៌ខៀវក្រម៉ៅ 3D ស្រស់ស្រាយ',
    titleStylePreset: 'sapphire'
  },
  {
    id: '3d_text_amethyst_purple',
    label: '🍇 3D Royal Purple Amethyst',
    category: '3D Titles & Typography',
    description: 'ត្បូងទទឹមស្វាយអាមេធីស 3D ដ៏ប្រណិតថ្លៃថ្នូរ',
    titleStylePreset: 'amethyst_purple'
  },
  {
    id: '3d_text_peacock_iridescent',
    label: '🦚 3D Peacock Feather Iridescent',
    category: '3D Titles & Typography',
    description: 'រោមសត្វក្ងោកចាំងពណ៌ប្រែប្រួល 3D ដ៏អស្ចារ្យ',
    titleStylePreset: 'peacock_iridescent'
  },
  {
    id: '3d_text_silver_moonlight',
    label: '🌕 3D Lunar Silver Moonlight',
    category: '3D Titles & Typography',
    description: 'ពន្លឺព្រះចន្ទពេញបូណ៌មីពណ៌ប្រាក់ 3D ត្រជាក់ភ្នែក',
    titleStylePreset: 'silver_moonlight'
  },
  {
    id: '3d_text_spartan_shield',
    label: '🛡️ 3D Spartan Bronze Shield',
    category: '3D Titles & Typography',
    description: 'ខែលសំរឹទ្ធទាហានបុរាណ 3D បង្ហាញពីភាពក្លាហាន',
    titleStylePreset: 'spartan_shield'
  },
  {
    id: '3d_text_firework_spark',
    label: '🧨 3D Fireworks Spark Splash',
    category: '3D Titles & Typography',
    description: 'កាំជ្រួចអបអរសាទរ 3D ចម្រុះពណ៌ភ្លឺចែងចាំង',
    titleStylePreset: 'firework_spark'
  },
  {
    id: '3d_text_hologram_rainbow',
    label: '🌈 3D Holographic Rainbow Foil',
    category: '3D Titles & Typography',
    description: 'បន្ទះហូឡូក្រាមចាំងពណ៌ឥន្ទធនូ 3 វិមាត្រទំនើប',
    titleStylePreset: 'hologram_rainbow'
  },
  {
    id: '3d_text_carbon_fiber',
    label: '🏎️ 3D Carbon Fiber Sport',
    category: '3D Titles & Typography',
    description: 'ក្រណាត់កាបោនស្ព័រ 3D ស័ក្តិសមសម្រាប់វីដេអូឡានទំនើប',
    titleStylePreset: 'carbon_fiber'
  },

  // ==========================================
  // Category 3 Extended: Extra 3D Typography (64 More = 100+ Total)
  // ==========================================
  { id: '3d_text_rose_gold', label: '🌹 3D Rose Gold Luxury', category: '3D Titles & Typography', description: 'Rose Gold 3D ម Luxury', titleStylePreset: 'rose_gold' },
  { id: '3d_text_midnight_black', label: '🌑 3D Midnight Obsidian Black', category: '3D Titles & Typography', description: 'Obsidian 3D ខ ម', titleStylePreset: 'midnight_black' },
  { id: '3d_text_copper_rust', label: '🪙 3D Copper Oxidized Rust', category: '3D Titles & Typography', description: 'Copper Rust 3D ស ម', titleStylePreset: 'copper_rust' },
  { id: '3d_text_aurora_borealis', label: '🌌 3D Aurora Borealis Lights', category: '3D Titles & Typography', description: 'Aurora ពន 3D ស ម', titleStylePreset: 'aurora_borealis' },
  { id: '3d_text_neon_pink_cyber', label: '💗 3D Hot Neon Pink Cyberpunk', category: '3D Titles & Typography', description: 'Neon Pink 3D Tokyo', titleStylePreset: 'neon_pink_cyber' },
  { id: '3d_text_thunder_gold', label: '⚡ 3D Thunder Strike Gold', category: '3D Titles & Typography', description: 'Thunder Gold 3D ម', titleStylePreset: 'thunder_gold' },
  { id: '3d_text_forest_spirit', label: '🌲 3D Enchanted Forest Spirit', category: '3D Titles & Typography', description: 'Forest Spirit 3D ស ម', titleStylePreset: 'forest_spirit' },
  { id: '3d_text_volcano_lava', label: '🌋 3D Volcano Eruption Lava', category: '3D Titles & Typography', description: 'Volcano Lava 3D ម', titleStylePreset: 'volcano_lava' },
  { id: '3d_text_ice_queen', label: '👸 3D Ice Queen Frozen', category: '3D Titles & Typography', description: 'Ice Queen 3D ត ម', titleStylePreset: 'ice_queen' },
  { id: '3d_text_blood_moon', label: '🌑 3D Blood Moon Eclipse', category: '3D Titles & Typography', description: 'Blood Moon 3D ម', titleStylePreset: 'blood_moon' },
  { id: '3d_text_sand_dune', label: '🏜️ 3D Desert Sand Dune', category: '3D Titles & Typography', description: 'Sand Dune 3D ម', titleStylePreset: 'sand_dune' },
  { id: '3d_text_bamboo_zen', label: '🎋 3D Bamboo Zen Garden', category: '3D Titles & Typography', description: 'Bamboo Zen 3D ម', titleStylePreset: 'bamboo_zen' },
  { id: '3d_text_coral_reef', label: '🪸 3D Tropical Coral Reef', category: '3D Titles & Typography', description: 'Coral Reef 3D ម', titleStylePreset: 'coral_reef' },
  { id: '3d_text_golden_pagoda', label: '🛕 3D Golden Khmer Pagoda', category: '3D Titles & Typography', description: 'Golden Pagoda 3D ម', titleStylePreset: 'golden_pagoda' },
  { id: '3d_text_cherry_wood', label: '🌸 3D Cherry Blossom Wood', category: '3D Titles & Typography', description: 'Cherry Wood 3D ម', titleStylePreset: 'cherry_wood' },
  { id: '3d_text_neon_orange', label: '🟠 3D Neon Orange Sunset', category: '3D Titles & Typography', description: 'Neon Orange 3D ម', titleStylePreset: 'neon_orange' },
  { id: '3d_text_ink_wash', label: '🖌️ 3D Traditional Ink Wash', category: '3D Titles & Typography', description: 'Ink Wash 3D ម', titleStylePreset: 'ink_wash' },
  { id: '3d_text_turquoise_sea', label: '🌀 3D Turquoise Maldives Sea', category: '3D Titles & Typography', description: 'Turquoise Sea 3D ម', titleStylePreset: 'turquoise_sea' },
  { id: '3d_text_royal_purple', label: '💜 3D Royal Dynasty Purple', category: '3D Titles & Typography', description: 'Royal Purple 3D ម', titleStylePreset: 'royal_purple' },
  { id: '3d_text_magma_core', label: '🔴 3D Magma Core Inferno', category: '3D Titles & Typography', description: 'Magma Core 3D ម', titleStylePreset: 'magma_core' },
  { id: '3d_text_chrome_mirror', label: '🪞 3D Chrome Mirror Polish', category: '3D Titles & Typography', description: 'Chrome Mirror 3D ម', titleStylePreset: 'chrome_mirror' },
  { id: '3d_text_desert_gold', label: '🌅 3D Desert Mirage Gold', category: '3D Titles & Typography', description: 'Desert Gold 3D ម', titleStylePreset: 'desert_gold' },
  { id: '3d_text_obsidian_edge', label: '🗡️ 3D Obsidian Dark Edge', category: '3D Titles & Typography', description: 'Obsidian Edge 3D ម', titleStylePreset: 'obsidian_edge' },
  { id: '3d_text_pastel_dream', label: '☁️ 3D Pastel Dream Clouds', category: '3D Titles & Typography', description: 'Pastel Dream 3D ម', titleStylePreset: 'pastel_dream' },
  { id: '3d_text_jade_dragon', label: '🐉 3D Jade Dragon Emperor', category: '3D Titles & Typography', description: 'Jade Dragon 3D ម', titleStylePreset: 'jade_dragon' },
  { id: '3d_text_burning_phoenix', label: '🦅 3D Burning Phoenix Rise', category: '3D Titles & Typography', description: 'Burning Phoenix 3D ម', titleStylePreset: 'burning_phoenix' },
  { id: '3d_text_titanium_alloy', label: '🔩 3D Titanium Alloy Matrix', category: '3D Titles & Typography', description: 'Titanium Alloy 3D ម', titleStylePreset: 'titanium_alloy' },
  { id: '3d_text_crystal_cave', label: '💠 3D Crystal Cave Cavern', category: '3D Titles & Typography', description: 'Crystal Cave 3D ម', titleStylePreset: 'crystal_cave' },
  { id: '3d_text_lavender_field', label: '💜 3D Lavender Provence Field', category: '3D Titles & Typography', description: 'Lavender Field 3D ម', titleStylePreset: 'lavender_field' },
  { id: '3d_text_midnight_galaxy', label: '🌌 3D Midnight Galaxy Cluster', category: '3D Titles & Typography', description: 'Midnight Galaxy 3D ម', titleStylePreset: 'midnight_galaxy' },
  { id: '3d_text_thunder_strike', label: '⚡ 3D Thunder Sky Strike', category: '3D Titles & Typography', description: 'Thunder Strike 3D ម', titleStylePreset: 'thunder_strike' },
  { id: '3d_text_pirate_gold', label: '☠️ 3D Pirate Treasure Gold', category: '3D Titles & Typography', description: 'Pirate Gold 3D ម', titleStylePreset: 'pirate_gold' },
  { id: '3d_text_neon_matrix', label: '🟩 3D Neon Matrix Code', category: '3D Titles & Typography', description: 'Neon Matrix 3D ម', titleStylePreset: 'neon_matrix' },
  { id: '3d_text_sakura_night', label: '🌸 3D Sakura Night Festival', category: '3D Titles & Typography', description: 'Sakura Night 3D ម', titleStylePreset: 'sakura_night' },
  { id: '3d_text_warrior_iron', label: '⚔️ 3D Ancient Iron Warrior', category: '3D Titles & Typography', description: 'Iron Warrior 3D ម', titleStylePreset: 'warrior_iron' },
  { id: '3d_text_hologram_blue', label: '💙 3D Hologram Blue Portal', category: '3D Titles & Typography', description: 'Hologram Blue 3D ម', titleStylePreset: 'hologram_blue' },
  { id: '3d_text_red_carpet', label: '🎬 3D Red Carpet Hollywood', category: '3D Titles & Typography', description: 'Red Carpet 3D ម', titleStylePreset: 'red_carpet' },
  { id: '3d_text_emerald_palace', label: '🏯 3D Emerald Imperial Palace', category: '3D Titles & Typography', description: 'Emerald Palace 3D ម', titleStylePreset: 'emerald_palace' },
  { id: '3d_text_solar_storm', label: '☀️ 3D Solar Storm Flare', category: '3D Titles & Typography', description: 'Solar Storm 3D ម', titleStylePreset: 'solar_storm' },
  { id: '3d_text_marble_white', label: '🤍 3D Carrara Marble White', category: '3D Titles & Typography', description: 'Marble White 3D ម', titleStylePreset: 'marble_white' },
  { id: '3d_text_sakura_gold', label: '🌸 3D Sakura Petal Gold', category: '3D Titles & Typography', description: 'Sakura Gold 3D ម', titleStylePreset: 'sakura_gold' },
  { id: '3d_text_dragon_fire', label: '🐉 3D Dragon Fire Breath', category: '3D Titles & Typography', description: 'Dragon Fire 3D ម', titleStylePreset: 'dragon_fire' },
  { id: '3d_text_wuxia_ink', label: '🖋️ 3D Wuxia Ink Brush', category: '3D Titles & Typography', description: 'Wuxia Ink 3D ម', titleStylePreset: 'wuxia_ink' },
  { id: '3d_text_angel_white', label: '👼 3D Angel Heaven White', category: '3D Titles & Typography', description: 'Angel Heaven 3D ម', titleStylePreset: 'angel_white' },
  { id: '3d_text_neon_yellow', label: '💛 3D Neon Taxi Yellow', category: '3D Titles & Typography', description: 'Neon Yellow 3D ម', titleStylePreset: 'neon_yellow' },
  { id: '3d_text_arctic_frost', label: '🏔️ 3D Arctic Frost Peak', category: '3D Titles & Typography', description: 'Arctic Frost 3D ម', titleStylePreset: 'arctic_frost' },
  { id: '3d_text_samurai_steel', label: '🗡️ 3D Samurai Steel Blade', category: '3D Titles & Typography', description: 'Samurai Steel 3D ម', titleStylePreset: 'samurai_steel' },
  { id: '3d_text_sunflower_bright', label: '🌻 3D Sunflower Bright Summer', category: '3D Titles & Typography', description: 'Sunflower 3D ម', titleStylePreset: 'sunflower_bright' },
  { id: '3d_text_matrix_green', label: '💚 3D Matrix Deep Green', category: '3D Titles & Typography', description: 'Matrix Green 3D ម', titleStylePreset: 'matrix_green' },
  { id: '3d_text_velvet_night', label: '🌙 3D Velvet Night Moonrise', category: '3D Titles & Typography', description: 'Velvet Night 3D ម', titleStylePreset: 'velvet_night' },
  { id: '3d_text_tiger_stripe', label: '🐯 3D Golden Tiger Stripe', category: '3D Titles & Typography', description: 'Tiger Stripe 3D ម', titleStylePreset: 'tiger_stripe' },
  { id: '3d_text_sunset_rose', label: '🌅 3D Sunset Rose Horizon', category: '3D Titles & Typography', description: 'Sunset Rose 3D ម', titleStylePreset: 'sunset_rose' },
  { id: '3d_text_frozen_world', label: '🌨️ 3D Frozen Winter World', category: '3D Titles & Typography', description: 'Frozen World 3D ម', titleStylePreset: 'frozen_world' },
  { id: '3d_text_venom_dark', label: '🖤 3D Venom Dark Symbiote', category: '3D Titles & Typography', description: 'Venom Dark 3D ម', titleStylePreset: 'venom_dark' },
  { id: '3d_text_platinum_elite', label: '🤍 3D Platinum Elite Award', category: '3D Titles & Typography', description: 'Platinum Elite 3D ម', titleStylePreset: 'platinum_elite' },
  { id: '3d_text_koi_fish', label: '🐟 3D Koi Fish Silk', category: '3D Titles & Typography', description: 'Koi Fish 3D ម', titleStylePreset: 'koi_fish' },
  { id: '3d_text_moonstone', label: '🌙 3D Moonstone Glow', category: '3D Titles & Typography', description: 'Moonstone 3D ម', titleStylePreset: 'moonstone' },
  { id: '3d_text_lapis_lazuli', label: '💎 3D Lapis Lazuli Persian', category: '3D Titles & Typography', description: 'Lapis Lazuli 3D ម', titleStylePreset: 'lapis_lazuli' },
  { id: '3d_text_blood_crystal', label: '🩸 3D Blood Crystal Dark', category: '3D Titles & Typography', description: 'Blood Crystal 3D ម', titleStylePreset: 'blood_crystal' },
  { id: '3d_text_peach_blossom', label: '🍑 3D Peach Blossom Silk', category: '3D Titles & Typography', description: 'Peach Blossom 3D ម', titleStylePreset: 'peach_blossom' },
  { id: '3d_text_volcanic_ash', label: '🌋 3D Volcanic Ash Dark', category: '3D Titles & Typography', description: 'Volcanic Ash 3D ម', titleStylePreset: 'volcanic_ash' },
  { id: '3d_text_golden_dragon_khmer', label: '🇰🇭 3D Khmer Golden Dragon', category: '3D Titles & Typography', description: 'Khmer Dragon 3D ម', titleStylePreset: 'golden_dragon_khmer' },
  { id: '3d_text_silver_lightning', label: '⚡ 3D Silver Lightning Storm', category: '3D Titles & Typography', description: 'Silver Lightning 3D ម', titleStylePreset: 'silver_lightning' },
  { id: '3d_text_emerald_potion', label: '🧪 3D Emerald Magic Potion', category: '3D Titles & Typography', description: 'Emerald Potion 3D ម', titleStylePreset: 'emerald_potion' },
  { id: '3d_text_starlight_silver', label: '⭐ 3D Starlight Silver Dust', category: '3D Titles & Typography', description: 'Starlight Silver 3D ម', titleStylePreset: 'starlight_silver' },
  { id: '3d_text_red_phoenix', label: '🔴 3D Red Phoenix Blazing', category: '3D Titles & Typography', description: 'Red Phoenix 3D ម', titleStylePreset: 'red_phoenix' },
  { id: '3d_text_ocean_sapphire', label: '🔵 3D Ocean Sapphire Depth', category: '3D Titles & Typography', description: 'Ocean Sapphire 3D ម', titleStylePreset: 'ocean_sapphire' },

  // ==========================================
  // Category 4: 3D Dynamic Motion & Camera (26 Presets)
  // ==========================================
  {
    id: '3d_motion_breathe',
    label: '🫁 Smooth Breathing Float 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'ចលនាដកដង្ហើមអណ្តែត 3D យឺតៗទន់ភ្លន់ដូចកាមេរ៉ាមានជីវិត',
    motionClass: 'animate-3d-breathe'
  },
  {
    id: '3d_motion_push_tilt',
    label: '🎥 Cinematic Push & Tilt 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'កាមេរ៉ារុញចូលបណ្តើរ ងាកជ្រុង 3D បន្តិចបន្តួចបណ្តើរ',
    motionClass: 'animate-3d-push'
  },
  {
    id: '3d_motion_orbit_loop',
    label: '🔄 Dynamic Orbit Rotation 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'កាមេរ៉ាវិលជុំវិញវីដេអូ 3D Orbit Loop ស្រាលៗ',
    motionClass: 'animate-3d-orbit'
  },
  {
    id: '3d_motion_vertigo_dolly',
    label: '🌀 Vertigo Hitchcock Zoom 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'បច្ចេកទេស Dolly Zoom បង្កើតអារម្មណ៍ស្រឡាំងកាំង 3D',
    motionClass: 'animate-3d-vertigo'
  },
  {
    id: '3d_motion_rumble_quake',
    label: '🌋 Earthquake Impact Rumble 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'រំញ័រដីកក្រើក 3D ពេលមានការផ្ទុះ ឬការវាយប្រយុទ្ធខ្លាំង',
    motionClass: 'animate-3d-rumble'
  },
  {
    id: '3d_motion_flythrough',
    label: '🦅 Drone Sweeping Fly-Through 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'ដ្រូនហោះហើរលឿនកាត់តាមលំហ 3 វិមាត្រ',
    motionClass: 'animate-3d-flythrough'
  },
  {
    id: '3d_motion_roll_snap',
    label: '🔄 Cinematic Roll & Snap 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'ផ្អៀងបង្វិលកាមេរ៉ា 3D យ៉ាងរលូន',
    motionClass: 'animate-3d-roll'
  },
  {
    id: '3d_motion_bullet_time',
    label: '⏱️ Bullet-Time Slomo Matrix 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'ចលនាយឺតៗបែបគ្រាប់កាំភ្លើងហោះ Matrix Slomo 3D',
    motionClass: 'animate-3d-bullet'
  },
  {
    id: '3d_motion_heartbeat_depth',
    label: '💓 Heartbeat Pulse Depth 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'លោតតាមចង្វាក់បេះដូង 3D Pulse ឈុតភ័យអរ',
    motionClass: 'animate-3d-heartbeat'
  },
  {
    id: '3d_motion_zero_gravity',
    label: '🛸 Zero-G Space Drift 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'រអិលអណ្តែតក្នុងទីអវកាសគ្មានទម្ងន់ 3D Drift',
    motionClass: 'animate-3d-zerog'
  },
  {
    id: '3d_motion_flip_horizon',
    label: '🎴 Flip Card Transition 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'ត្រឡប់ផ្ទាំងវីដេអូដូចសន្លឹកបៀ 3D Card Flip',
    motionClass: 'animate-3d-flip'
  },
  {
    id: '3d_motion_spring_whip',
    label: '⚡ Spring Whip Action 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'កន្ត្រាក់ជ្រុងលឿនបែប Action Whip Pan 3D',
    motionClass: 'animate-3d-whip'
  },
  {
    id: '3d_motion_hero_low_angle',
    label: '👑 Hero Low-Angle Swivel 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'កាមេរ៉ាងើយមើលតួឯកពីក្រោម 3D Hero Pan',
    motionClass: 'animate-3d-heropan'
  },
  {
    id: '3d_motion_bird_eye',
    label: '🕊️ Bird Perspective Glide 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'ហោះរំលងពីលើចុះក្រោម Glide Smooth 3D',
    motionClass: 'animate-3d-birdglide'
  },
  {
    id: '3d_motion_glitch_displace',
    label: '📺 Digital Glitch Spatial Shift 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'ញាក់កន្ត្រាក់ឌីជីថល 3D Glitch Displacement',
    motionClass: 'animate-3d-glitch'
  },
  {
    id: '3d_motion_wave_ripple',
    label: '🌊 Liquid Surface Wave 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'រលកទឹករំញ័រលើផ្ទៃ 3D Water Undulation',
    motionClass: 'animate-3d-wave'
  },
  {
    id: '3d_motion_fisheye_convex',
    label: '🐟 Fisheye Dynamic Bubble 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'កែវភ្នែកត្រីប៉ោងចេញ 3D Fisheye Bubble',
    motionClass: 'animate-3d-fisheye'
  },
  {
    id: '3d_motion_prism_kaleido',
    label: '🔮 Kaleidoscopic Crystal Turn 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'កញ្ចក់ឆ្លុះច្រើនជ្រុង 3D Kaleidoscope Spin',
    motionClass: 'animate-3d-kaleido'
  },
  {
    id: '3d_motion_warp_drive',
    label: '🚀 Hyperspace Warp Drive 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'ស្ទុះចូលក្នុងល្បឿនពន្លឺ Warp Drive Starlight 3D',
    motionClass: 'animate-3d-warpdrive'
  },
  {
    id: '3d_motion_vortex_swirl',
    label: '🌀 Vortex Swirl Spiral 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'កួចគូទខ្យល់ចូលកណ្តាល 3D Spiral Swirl',
    motionClass: 'animate-3d-vortex'
  },
  {
    id: '3d_motion_jcut_tilt',
    label: '📐 J-Cut Cinematic Tilt 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'កាត់ជ្រុងភាពយន្ត J-Cut 3D Angle',
    motionClass: 'animate-3d-jcut'
  },
  {
    id: '3d_motion_shutter_strobe',
    label: '📽️ Film Shutter Strobe Depth 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'ភ្លើងហ្វីលលោតតាមចង្វាក់ 3D Projector Strobe',
    motionClass: 'animate-3d-strobe'
  },
  {
    id: '3d_motion_sea_breeze',
    label: '⛵ Gentle Nautical Sea Sway 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'ទូកយោលយឺតៗតាមទឹករលក 3D Sea Breeze',
    motionClass: 'animate-3d-seasway'
  },
  {
    id: '3d_motion_cyber_sweep',
    label: '🤖 Cyber Laser Sweep 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'ខ្សែស្កេនឡាស៊ែរកាត់អេក្រង់ 3D Laser Sweep',
    motionClass: 'animate-3d-cybersweep'
  },
  {
    id: '3d_motion_mirage_echo',
    label: '👻 Flashback Mirage Ghost 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'ស្រមោលអតីតកាលព្រិលៗ Mirage Ghost Echo 3D',
    motionClass: 'animate-3d-mirage'
  },
  {
    id: '3d_motion_pendulum_swing',
    label: '🕰️ Clock Pendulum Swing 3D',
    category: '3D Dynamic Motion & Camera',
    description: 'យោលដូចប៉ោលនាឡិកាបុរាណ 3D Pendulum',
    motionClass: 'animate-3d-pendulum'
  }
];
