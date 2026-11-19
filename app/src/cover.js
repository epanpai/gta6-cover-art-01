// Draws the GTA-style multi-panel cover: photos in comic panels, a Vice City
// sunset or neon grade over each panel, a retro sun disc, and bold Anton
// caption lettering over a dark band. Pure canvas 2D, no library.

export const GRADES = {
  sunset: { from: '#ff7a18', to: '#ff2d78', accent: '#ffb347', band: '#170a24' },
  neon: { from: '#00f0ff', to: '#ff00a8', accent: '#00f0ff', band: '#0a1224' },
  dusk: { from: '#7b2ff7', to: '#ff5e62', accent: '#ffd166', band: '#120a24' },
  noir: { from: '#9a9a9a', to: '#111111', accent: '#e8e8e8', band: '#101010' },
};

// Panel rectangles as fractions of the photo area [x, y, w, h].
export const LAYOUTS = {
  split: [
    [0, 0, 0.58, 1],
    [0.58, 0, 0.42, 0.49],
    [0.58, 0.51, 0.42, 0.49],
  ],
  triptych: [
    [0, 0, 0.326, 1],
    [0.337, 0, 0.326, 1],
    [0.674, 0, 0.326, 1],
  ],
  hero: [
    [0, 0, 1, 0.6],
    [0, 0.62, 0.49, 0.38],
    [0.51, 0.62, 0.49, 0.38],
  ],
  quad: [
    [0, 0, 0.49, 0.49],
    [0.51, 0, 0.49, 0.49],
    [0, 0.51, 0.49, 0.49],
    [0.51, 0.51, 0.49, 0.49],
  ],
};

const CAPTION_BAND = 0.24; // fraction of the cover height taken by the caption band

/** Draws one photo into a panel rect, cover-fit, with per-panel zoom and pan. */
export function drawPanelPhoto(ctx, photo, rect, panel) {
  const [x, y, w, h] = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (photo) {
    const base = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
    const scale = base * (panel.zoom || 1);
    const pw = photo.naturalWidth * scale;
    const ph = photo.naturalHeight * scale;
    // Pan, clamped so the photo always covers the whole panel.
    const ox = Math.max(-(pw - w) / 2, Math.min((pw - w) / 2, (panel.x || 0) * w * 0.5));
    const oy = Math.max(-(ph - h) / 2, Math.min((ph - h) / 2, (panel.y || 0) * h * 0.5));
    ctx.drawImage(photo, x + (w - pw) / 2 + ox, y + (h - ph) / 2 + oy, pw, ph);
  } else {
    ctx.fillStyle = '#2a1638';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `600 ${Math.round(h * 0.07)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', x + w / 2, y + h / 2);
  }
  ctx.restore();
}

/** Washes a panel with the grade: a diagonal sunset/neon tint plus a bottom vignette. */
export function gradePanel(ctx, rect, grade) {
  const [x, y, w, h] = rect;
  const wash = ctx.createLinearGradient(x, y, x + w, y + h);
  wash.addColorStop(0, hexA(grade.from, 0.34));
  wash.addColorStop(0.55, hexA(grade.from, 0.08));
  wash.addColorStop(1, hexA(grade.to, 0.42));
  ctx.fillStyle = wash;
  ctx.fillRect(x, y, w, h);
  const shade = ctx.createLinearGradient(0, y + h * 0.45, 0, y + h);
  shade.addColorStop(0, 'rgba(10,4,20,0)');
  shade.addColorStop(1, 'rgba(10,4,20,0.5)');
  ctx.fillStyle = shade;
  ctx.fillRect(x, y, w, h);
}

/** A retro striped sun disc, drawn with canvas primitives only. */
export function drawSun(ctx, cx, cy, r, grade) {
  ctx.save();
  const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.9);
  glow.addColorStop(0, hexA(grade.to, 0.55));
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 2, cy - r * 2, r * 4, r * 4);
  const disc = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  disc.addColorStop(0, grade.accent);
  disc.addColorStop(1, grade.to);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = disc;
  ctx.fill();
  ctx.fillStyle = GRADES.sunset.band;
  let gap = r * 0.08;
  for (let i = 0; i < 4; i++) {
    const sy = cy + r * 0.12 + i * r * 0.2;
    ctx.fillRect(cx - r, sy, r * 2, gap);
    gap *= 1.5;
  }
  ctx.restore();
}

function hexA(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/** Fits one line of text to a width, returning the largest size that fits. */
function fitFont(ctx, text, family, maxSize, maxWidth, weight = '') {
  let size = maxSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

/**
 * Draws the whole cover onto `canvas` at its own size.
 * `state` is { layout, grade, caption, subcaption, photos: {a, b}, panels: [...] }.
 */
export function drawCoverArt(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const rects = LAYOUTS[state.layout] || LAYOUTS.split;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  const bandH = H * CAPTION_BAND;
  const photoH = H - bandH;
  const gap = Math.max(4, Math.round(W * 0.012));

  for (let i = 0; i < rects.length; i++) {
    const [fx, fy, fw, fh] = rects[i];
    const rect = [
      fx * W + (fx > 0 ? gap / 2 : 0),
      fy * photoH + (fy > 0 ? gap / 2 : 0),
      fw * W - (fx > 0 ? gap / 2 : 0) - (fx + fw < 1 ? gap / 2 : 0),
      fh * photoH - (fy > 0 ? gap / 2 : 0) - (fy + fh < 1 ? gap / 2 : 0),
    ];
    const panel = state.panels[i] || { photo: 'a', zoom: 1, x: 0, y: 0 };
    const photo = state.photos[panel.photo] || null;
    drawPanelPhoto(ctx, photo, rect, panel);
    gradePanel(ctx, rect, grade);
  }

  // Caption band: dark gradient, sun disc peeking behind the words, bold lettering.
  ctx.fillStyle = grade.band;
  ctx.fillRect(0, photoH, W, bandH);
  const bandGlow = ctx.createLinearGradient(0, photoH, 0, H);
  bandGlow.addColorStop(0, hexA(grade.to, 0.35));
  bandGlow.addColorStop(0.5, 'rgba(0,0,0,0)');
  ctx.fillStyle = bandGlow;
  ctx.fillRect(0, photoH, W, bandH);
  drawSun(ctx, W * 0.88, photoH + bandH * 0.42, bandH * 0.52, grade);

  const caption = (state.caption || '').trim().toUpperCase();
  if (caption) {
    const maxW = W * 0.84;
    const size = fitFont(ctx, caption, "'Anton', sans-serif", bandH * 0.52, maxW);
    const textGrad = ctx.createLinearGradient(0, photoH + bandH * 0.18, 0, photoH + bandH * 0.82);
    textGrad.addColorStop(0, '#ffffff');
    textGrad.addColorStop(1, grade.accent);
    ctx.font = `${size}px 'Anton', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(10,4,20,0.9)';
    ctx.lineWidth = Math.max(2, size * 0.07);
    ctx.strokeText(caption, W * 0.05, photoH + bandH * 0.42);
    ctx.fillStyle = textGrad;
    ctx.fillText(caption, W * 0.05, photoH + bandH * 0.42);
  }
  const sub = (state.subcaption || '').trim().toUpperCase();
  if (sub) {
    const size = fitFont(ctx, sub, "'Archivo Black', sans-serif", bandH * 0.16, W * 0.8);
    ctx.font = `${size}px 'Archivo Black', sans-serif`;
    ctx.fillStyle = grade.accent;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    try { ctx.letterSpacing = `${Math.max(1, size * 0.18)}px`; } catch { /* older canvas */ }
    ctx.fillText(sub, W * 0.05, photoH + bandH * 0.85);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  }
  // Thin accent rule under the band's top edge.
  const rule = ctx.createLinearGradient(0, 0, W, 0);
  rule.addColorStop(0, grade.from);
  rule.addColorStop(1, grade.to);
  ctx.fillStyle = rule;
  ctx.fillRect(0, photoH, W, Math.max(3, H * 0.005));
}
