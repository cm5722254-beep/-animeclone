import { VideoEffects } from '../types';

export interface GenerateOverlayOptions {
  width: number;
  height: number;
  videoEffects?: VideoEffects;
}

/**
 * Renders a transparent PNG overlay representing all active video titles,
 * 3D thumbnail text, badges, watermarks, and cinematic borders.
 * This overlay is sent to FFmpeg to be burned permanently into the video.
 */
export function generateVideoOverlayImage(options: GenerateOverlayOptions): string | null {
  const { width = 1920, height = 1080, videoEffects } = options;
  if (!videoEffects) return null;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Clear to complete transparency
  ctx.clearRect(0, 0, width, height);

  let hasDrawnAnything = false;
  const scale = width / 1280;

  // 1. Cinematic Letterbox (Black cinema bars)
  if (videoEffects.letterbox) {
    hasDrawnAnything = true;
    ctx.fillStyle = '#000000';
    const barHeight = height * 0.1;
    ctx.fillRect(0, 0, width, barHeight);
    ctx.fillRect(0, height - barHeight, width, barHeight);
  }

  // 2. Cinematic Vignette
  if (videoEffects.vignette) {
    hasDrawnAnything = true;
    const vig = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.25,
      width / 2,
      height / 2,
      width * 0.72
    );
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);
  }

  // 3. Watermark / Channel Name
  if (videoEffects.watermark?.enabled && videoEffects.watermark.text) {
    hasDrawnAnything = true;
    ctx.save();
    const wm = videoEffects.watermark;
    const fontSize = Math.round((wm.fontSize || 16) * scale);
    ctx.font = `bold ${fontSize}px "${wm.fontFamily || 'Outfit'}", "Kantumruy Pro", sans-serif`;
    ctx.globalAlpha = (wm.opacity || 85) / 100;
    ctx.fillStyle = wm.textColor || '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = Math.round(8 * scale);

    const padding = Math.round(36 * scale);
    let wmX = width - padding;
    let wmY = padding + fontSize;
    ctx.textAlign = 'right';

    if (wm.position === 'top-left') {
      wmX = padding;
      ctx.textAlign = 'left';
    } else if (wm.position === 'bottom-right') {
      wmY = height - padding;
    } else if (wm.position === 'bottom-left') {
      wmX = padding;
      wmY = height - padding;
      ctx.textAlign = 'left';
    } else if (wm.position === 'center') {
      wmX = width / 2;
      wmY = height / 2;
      ctx.textAlign = 'center';
    }

    ctx.fillText(wm.text, wmX, wmY);
    ctx.restore();
  }

  // 4. 3D Styled Video Title / Thumbnail Banner
  const st = videoEffects.styleText;
  if (st?.enabled && st.title && st.title.trim().length > 0) {
    hasDrawnAnything = true;
    ctx.save();

    const titleSize = Math.round((st.fontSize || 32) * scale);
    const subSize = Math.round((st.subtitleFontSize || Math.round(titleSize * 0.44)));
    const isFree = st.position === 'free' || (st.posX !== undefined && st.posY !== undefined);
    const align = st.textAlign || (st.position === 'top' || st.position === 'center' || st.position === 'bottom-center' ? 'center' : st.position === 'bottom-right' ? 'right' : 'left');

    let posX = isFree ? (width * (st.posX ?? 10)) / 100 : Math.round(54 * scale);
    let posY = isFree ? (height * (st.posY ?? 82)) / 100 : height - Math.round(54 * scale);

    if (st.position === 'top') {
      posX = width / 2;
      posY = Math.round(72 * scale);
    } else if (st.position === 'center') {
      posX = width / 2;
      posY = height / 2;
    } else if (st.position === 'bottom-right') {
      posX = width - Math.round(54 * scale);
      posY = height - Math.round(54 * scale);
    } else if (st.position === 'bottom-center') {
      posX = width / 2;
      posY = height - Math.round(54 * scale);
    }

    ctx.translate(posX, posY);
    if (st.rotationAngle) {
      ctx.rotate((st.rotationAngle * Math.PI) / 180);
    }

    const fontFam = st.fontFamily || 'Koulen';
    ctx.font = `bold ${titleSize}px "${fontFam}", "Kantumruy Pro", sans-serif`;
    ctx.textAlign = align;

    const titleMetrics = ctx.measureText(st.title);
    const titleWidth = titleMetrics.width;

    // A. Background Banner if enabled
    if (st.showBanner) {
      ctx.save();
      const padX = Math.round(24 * scale);
      const padY = Math.round(18 * scale);
      const boxW = titleWidth + padX * 2;
      const boxH = titleSize + (st.subtitle ? subSize + Math.round(26 * scale) : Math.round(16 * scale));

      let boxLeft = -padX;
      if (align === 'center') boxLeft = -titleWidth / 2 - padX;
      else if (align === 'right') boxLeft = -titleWidth - padX;

      const boxTop = -titleSize - Math.round(8 * scale);

      ctx.fillStyle = 'rgba(4, 7, 15, 0.82)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = Math.max(1.5, Math.round(2 * scale));

      ctx.beginPath();
      const radius = Math.round(14 * scale);
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(boxLeft, boxTop, boxW, boxH, radius);
      } else {
        ctx.rect(boxLeft, boxTop, boxW, boxH);
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // B. Top Badge (e.g. "ភាគ ០១ - ចប់")
    if (st.badge) {
      ctx.save();
      const badgeFontSize = Math.max(11, Math.round(14 * scale));
      ctx.font = `bold ${badgeFontSize}px "Outfit", "Koulen", sans-serif`;
      const badgeMetrics = ctx.measureText(st.badge);
      const badgeW = badgeMetrics.width + Math.round(18 * scale);
      const badgeH = badgeFontSize + Math.round(12 * scale);

      let badgeX = 0;
      if (align === 'center') badgeX = -badgeW / 2;
      else if (align === 'right') badgeX = -badgeW;

      const badgeY = -titleSize - Math.round(12 * scale) - badgeH;

      // Badge Gradient
      const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
      badgeGrad.addColorStop(0, '#e11d48');
      badgeGrad.addColorStop(1, '#9f1239');
      ctx.fillStyle = badgeGrad;

      ctx.beginPath();
      const bRad = Math.round(6 * scale);
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(badgeX, badgeY, badgeW, badgeH, bRad);
      } else {
        ctx.rect(badgeX, badgeY, badgeW, badgeH);
      }
      ctx.fill();

      ctx.strokeStyle = 'rgba(254, 240, 138, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(st.badge, badgeX + Math.round(9 * scale), badgeY + badgeFontSize + Math.round(4 * scale));
      ctx.restore();
    }

    // C. 3D Depth Shadow Extrusions
    const depth = Math.max(2, Math.round((st.depth3D ?? 6) * scale));
    ctx.fillStyle = '#05070d';
    for (let d = depth; d >= 1; d--) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = Math.round(4 * scale);
      ctx.shadowOffsetX = d;
      ctx.shadowOffsetY = d;
      ctx.fillText(st.title, d, d);
    }

    // D. Outer Glow Aura
    const preset = st.stylePreset || 'gold3d';
    let glowColor = '#eab308';
    if (preset.includes('fire') || preset.includes('lava')) glowColor = '#ea580c';
    else if (preset.includes('neon') || preset.includes('plasma') || preset.includes('cyan')) glowColor = '#06b6d4';
    else if (preset.includes('cyberpunk') || preset.includes('pink')) glowColor = '#f43f5e';
    else if (preset.includes('jade') || preset.includes('emerald')) glowColor = '#10b981';
    else if (preset.includes('sapphire') || preset.includes('blue')) glowColor = '#3b82f6';
    else if (preset.includes('silver') || preset.includes('chrome')) glowColor = '#cbd5e1';

    const glowBlur = Math.round((st.glowIntensity ?? 16) * scale);
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // E. Outer Stroke
    const strokeW = Math.round((st.strokeWidth ?? 4) * scale);
    if (strokeW > 0) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = strokeW;
      ctx.strokeText(st.title, 0, 0);
    }

    // F. Main Title Gradient Fill
    const grad = ctx.createLinearGradient(0, -titleSize, 0, 4);
    if (preset.includes('gold') || preset.includes('royal')) {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.25, '#fef08a');
      grad.addColorStop(0.65, '#eab308');
      grad.addColorStop(1, '#854d0e');
    } else if (preset.includes('fire') || preset.includes('lava')) {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.25, '#fef08a');
      grad.addColorStop(0.65, '#f97316');
      grad.addColorStop(1, '#b91c1c');
    } else if (preset.includes('cyberpunk') || preset.includes('neon_pink')) {
      grad.addColorStop(0, '#a5f3fc');
      grad.addColorStop(0.5, '#f472b6');
      grad.addColorStop(1, '#a855f7');
    } else if (preset.includes('neon') || preset.includes('plasma') || preset.includes('cyan')) {
      grad.addColorStop(0, '#e0f2fe');
      grad.addColorStop(0.5, '#38bdf8');
      grad.addColorStop(1, '#0284c7');
    } else if (preset.includes('jade') || preset.includes('emerald')) {
      grad.addColorStop(0, '#ecfdf5');
      grad.addColorStop(0.5, '#34d399');
      grad.addColorStop(1, '#059669');
    } else if (preset.includes('sapphire') || preset.includes('ocean')) {
      grad.addColorStop(0, '#eff6ff');
      grad.addColorStop(0.5, '#60a5fa');
      grad.addColorStop(1, '#1d4ed8');
    } else {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#e2e8f0');
      grad.addColorStop(1, '#94a3b8');
    }

    ctx.fillStyle = grad;
    ctx.fillText(st.title, 0, 0);

    // G. Subtitle Tagline
    if (st.subtitle) {
      ctx.font = `500 ${subSize}px "Kantumruy Pro", sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = Math.round(6 * scale);
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(st.subtitle, 0, subSize + Math.round(10 * scale));
    }

    ctx.restore();
  }

  if (!hasDrawnAnything) return null;

  return canvas.toDataURL('image/png');
}
