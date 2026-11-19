# Vice Cover Maker — Make GTA 6 Cover Art

[![Make GTA 6 Cover Art](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/epanpai/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/epanpai/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Entry for the [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) bounty on make.fun, by [@epanpai](https://github.com/epanpai).

## What it is

**Vice Cover Maker** turns your photo and a caption into GTA-style multi-panel cover art, in the browser, offline. Photos are read on your own machine and never uploaded. Open `app/index.html` from any static server (or run `node serve.ts` and visit http://localhost:8080) and:

1. **Add photos** — pick your own, or load the two bundled samples (Boulevard / Pier).
2. **Pick a panel layout** — Split, Triptych, Hero, or Quad.
3. **Frame one panel at a time** — choose which photo fills it, then zoom and pan it into place. One photo can fill every panel, or each panel can use a different photo.
4. **Write the words** — a bold caption and a sub-caption, over a retro striped sun disc.
5. **Pick a grade** — Sunset, Neon, Dusk, or Noir — and an export size: **1080 × 1080**, **1080 × 1350**, or **1920 × 1080**.
6. **Export PNG** — one click downloads the cover at the exact post size.

Everything is drawn live on a canvas, so the preview is exactly what the PNG will be.

## Originality

No Rockstar Games logo, wordmark, official artwork, or font is used anywhere. The display fonts are bundled under `app/fonts/` under the SIL Open Font License: **Anton** and **Archivo Black**, with their `OFL-*.txt` license files included. The sun disc, panels, and grades are drawn with canvas primitives in `app/src/cover.js`. The two sample photos under `app/samples/` were made with an image model for make.fun and are free to use.

## Files

- `app/index.html` — the editor page
- `app/style.css` — dark Vice City editor theme
- `app/src/main.js` — editor wiring: photos, layout, crop, caption, export
- `app/src/cover.js` — the cover renderer: panels, grades, sun, lettering
- `app/src/shots.js` — fixed `?shot=` scenes used for the screenshots
- `app/fonts/` — Anton + Archivo Black (SIL OFL)
- `app/samples/` — Boulevard and Pier sample photos
- `screenshots/` — 4 screenshots: the wide cover, the editor at work, the square cover, the portrait cover
- `main.ts` — the submission program: copies `app/` + `screenshots/` to `/output` and writes `dossier.json`
- `serve.ts` — tiny static server for local testing

## License

MIT — see `LICENSE`.
