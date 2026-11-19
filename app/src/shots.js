// Fixed scenes for screenshots: ?shot=editor shows the page with a sample
// photo loaded; ?shot=cover shows the cover alone, at the chosen size and
// layout. `photo` picks the sample, `caption` the words, `layout` and
// `grade` the look. window.__shotReady is set once painted (see main.js).

export async function runShot(shot, query, api) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const photo = query.get('photo') ?? 'pier';
  const caption = query.get('caption') ?? 'VICE NIGHTS';
  const subcaption = query.get('subcaption') ?? 'SUNSET HEIST · EST. 2026';
  const layout = query.get('layout') ?? 'split';
  const grade = query.get('grade') ?? 'sunset';
  const size = query.get('size') ?? '1080x1080';

  await api.loadSample(photo, 'a');
  await api.loadSample(photo === 'pier' ? 'boulevard' : 'pier', 'b');
  // Wide panels crop square photos hard: nudge the first panel down so the
  // subject's face stays in frame for the split/hero layouts.
  const firstY = layout === 'hero' ? 1 : layout === 'split' ? 0.6 : 0;
  const thirdY = layout === 'split' ? 0.8 : 0;
  api.setState({
    layout,
    grade,
    size,
    caption,
    subcaption,
    panels: [
      { photo: 'a', zoom: 1, x: 0, y: firstY },
      { photo: 'b', zoom: 1.1, x: 0, y: 0 },
      { photo: 'a', zoom: 1.2, x: 0.1, y: thirdY },
      { photo: 'b', zoom: 1, x: 0, y: 0 },
    ],
  });
  api.redraw();
}
