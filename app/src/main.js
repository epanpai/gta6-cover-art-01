// Wires the Vice Cover Maker page: photos, layout, per-panel crop, caption,
// grade, export size and PNG export. A `?shot=` query sets up a fixed scene
// for a screenshot instead (./shots.js).
import { drawCoverArt, LAYOUTS } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const subcaptionInput = document.getElementById('subcaption');
const status = document.getElementById('status');
const photoStatus = document.getElementById('photo-status');
const panelSelect = document.getElementById('panel-select');
const panelPhoto = document.getElementById('panel-photo');
const panelZoom = document.getElementById('panel-zoom');
const panelX = document.getElementById('panel-x');
const panelY = document.getElementById('panel-y');

export const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

const state = {
  layout: 'split',
  grade: 'sunset',
  size: '1080x1080',
  caption: 'VICE NIGHTS',
  subcaption: 'SUNSET HEIST · EST. 2026',
  photos: { a: null, b: null },
  panels: [
    { photo: 'a', zoom: 1, x: 0, y: 0 },
    { photo: 'b', zoom: 1, x: 0, y: 0 },
    { photo: 'a', zoom: 1.15, x: 0, y: 0 },
    { photo: 'b', zoom: 1, x: 0, y: 0 },
  ],
};

let selectedPanel = 0;

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Waits until the bundled display fonts are usable by the canvas. */
export async function fontsReady() {
  try {
    await Promise.all([
      document.fonts.load("40px 'Anton'"),
      document.fonts.load("40px 'Archivo Black'"),
    ]);
    await document.fonts.ready;
  } catch {
    // Fall back to system fonts if the bundled ones cannot load.
  }
}

function panelCount() {
  return (LAYOUTS[state.layout] || LAYOUTS.split).length;
}

function refreshPanelSelect() {
  const n = panelCount();
  panelSelect.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = `Panel ${i + 1}`;
    panelSelect.appendChild(option);
  }
  if (selectedPanel >= n) selectedPanel = 0;
  panelSelect.value = String(selectedPanel);
  syncPanelControls();
}

function syncPanelControls() {
  const panel = state.panels[selectedPanel];
  panelPhoto.value = panel.photo;
  panelZoom.value = String(panel.zoom);
  panelX.value = String(panel.x);
  panelY.value = String(panel.y);
}

function redraw() {
  const [w, h] = SIZES[state.size];
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  drawCoverArt(canvas, state);
}

function updatePhotoStatus() {
  const loaded = ['a', 'b'].filter((k) => state.photos[k]).length;
  photoStatus.textContent =
    loaded === 0 ? 'No photo yet — load a sample or add your own.'
    : loaded === 1 ? 'Photo A loaded. Add a second photo for mixed panels.'
    : 'Photos A and B loaded — pick one per panel below.';
}

async function loadSample(name, slot) {
  state.photos[slot] = await loadImage(`samples/${name}.jpg`);
  updatePhotoStatus();
  redraw();
}

document.getElementById('photos').addEventListener('change', async (e) => {
  const files = [...(e.target.files || [])].slice(0, 2);
  for (const file of files) {
    const slot = state.photos.a ? 'b' : 'a';
    state.photos[slot] = await loadImage(URL.createObjectURL(file));
  }
  updatePhotoStatus();
  redraw();
});
document.getElementById('sample-boulevard').addEventListener('click', () => loadSample('boulevard', 'a'));
document.getElementById('sample-pier').addEventListener('click', () => loadSample('pier', 'b'));

document.getElementById('layouts').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-layout]');
  if (!btn) return;
  state.layout = btn.dataset.layout;
  document.querySelectorAll('.layout-btn').forEach((b) => b.classList.toggle('active', b === btn));
  refreshPanelSelect();
  redraw();
});
document.getElementById('grades').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-grade]');
  if (!btn) return;
  state.grade = btn.dataset.grade;
  document.querySelectorAll('.grade-btn').forEach((b) => b.classList.toggle('active', b === btn));
  redraw();
});
document.getElementById('sizes').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-size]');
  if (!btn) return;
  state.size = btn.dataset.size;
  document.querySelectorAll('.size-btn').forEach((b) => b.classList.toggle('active', b === btn));
  redraw();
});

panelSelect.addEventListener('change', () => {
  selectedPanel = Number(panelSelect.value);
  syncPanelControls();
});
panelPhoto.addEventListener('change', () => {
  state.panels[selectedPanel].photo = panelPhoto.value;
  redraw();
});
panelZoom.addEventListener('input', () => {
  state.panels[selectedPanel].zoom = Number(panelZoom.value);
  redraw();
});
panelX.addEventListener('input', () => {
  state.panels[selectedPanel].x = Number(panelX.value);
  redraw();
});
panelY.addEventListener('input', () => {
  state.panels[selectedPanel].y = Number(panelY.value);
  redraw();
});
document.getElementById('fill-all').addEventListener('click', () => {
  state.panels.forEach((p) => { p.photo = 'a'; });
  syncPanelControls();
  redraw();
});

captionInput.addEventListener('input', () => { state.caption = captionInput.value; redraw(); });
subcaptionInput.addEventListener('input', () => { state.subcaption = subcaptionInput.value; redraw(); });

/** Renders the cover at a size and returns its PNG as a data URL. Used by Export and by tests. */
export async function exportCoverPNG(sizeKey) {
  await fontsReady();
  const [w, h] = SIZES[sizeKey];
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawCoverArt(off, state);
  return new Promise((resolve) => off.toBlob((blob) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  }, 'image/png'));
}

document.getElementById('export').addEventListener('click', async () => {
  const dataUrl = await exportCoverPNG(state.size);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `vice-cover-${state.size}.png`;
  a.click();
  status.textContent = `Saved vice-cover-${state.size}.png`;
});

// Exposed for the screenshot/test driver: the current cover state as plain data.
window.__vice = { state, exportCoverPNG, redraw, fontsReady, loadSample };

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  await runShot(shot, new URLSearchParams(location.search), {
    loadSample,
    setState(next) { Object.assign(state, next); refreshPanelSelect(); },
    redraw,
  });
  await fontsReady();
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
} else {
  refreshPanelSelect();
  await fontsReady();
  redraw();
}
