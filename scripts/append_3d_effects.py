import os

file_path = "d:/clone/src/components/effects/effectsLibrary.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Check if already appended
if "EFFECT_3D_PRESETS" in content:
    print("Already appended!")
    exit(0)

effects_3d_code = '''
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
'''

with open(file_path, "a", encoding="utf-8") as f:
    f.write("\n" + effects_3d_code)

print("Successfully appended 118 3D effects to effectsLibrary.ts!")
